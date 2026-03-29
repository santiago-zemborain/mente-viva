import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
// 20dab404e3008fdefffb6e616837d33cff3aba6f8969fcce1f66a9ca216c07d1

/**
 * Webhook endpoint para recibir notificaciones de MercadoPago
 * 
 * MercadoPago envía notificaciones cuando:
 * - Se crea un pago
 * - Se actualiza el estado de un pago
 * - Se crea una preferencia
 * 
 * URL del webhook: https://tu-dominio.com/api/mercadopago/webhook
 * 
 * Para configurar en MercadoPago:
 * 1. Ve a tu aplicación en https://www.mercadopago.com.ar/developers/panel/app
 * 2. Configura la URL del webhook en "Notificaciones IPN"
 * 3. Agrega la URL: https://tu-dominio.com/api/mercadopago/webhook
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = request.headers.get("x-request-id") || `req-${Date.now()}`
  
  // Función helper para logs estructurados
  const log = (level: "info" | "error" | "warn", message: string, data?: any) => {
    const logEntry = {
      timestamp,
      requestId,
      level,
      message: `[Webhook] ${message}`,
      ...(data && { data }),
    }
    
    // En producción, usar JSON.stringify para mejor visibilidad en Vercel
    if (process.env.NODE_ENV === "production") {
      console[level](JSON.stringify(logEntry))
    } else {
      console[level](logEntry.message, data || "")
    }
  }

  try {
    log("info", "Webhook request received", {
      url: request.url,
      method: request.method,
      headers: {
        "content-type": request.headers.get("content-type"),
        "x-signature": request.headers.get("x-signature") ? "present" : "missing",
        "x-request-id": requestId,
      },
    })

    // MercadoPago envía los datos como query params O en el body
    // Formato 1: ?type=payment&data.id=123456 (query params)
    // Formato 2: Body JSON con { type: "payment", data: { id: "123456" } }
    const searchParams = request.nextUrl.searchParams
    
    // Intentar leer del body primero
    let bodyData: any = null
    try {
      const contentType = request.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        bodyData = await request.json()
        log("info", "Body data parsed", { hasBody: true, bodyKeys: Object.keys(bodyData || {}) })
      }
    } catch (e) {
      log("warn", "Failed to parse body", { error: e instanceof Error ? e.message : String(e) })
    }

    // Extraer topic/type e id de query params o body
    // Nota: Next.js puede tener problemas con query params que tienen puntos
    // Por eso también intentamos leer del body y de diferentes formatos
    const topic = 
      searchParams.get("topic") || 
      searchParams.get("type") || 
      bodyData?.topic || 
      bodyData?.type ||
      bodyData?.action

    // Para data.id, intentar diferentes formas de acceso
    let id = 
      searchParams.get("id") || 
      searchParams.get("data_id") ||
      bodyData?.data?.id ||
      bodyData?.id ||
      bodyData?.data_id

    // Si no encontramos id, intentar parsear data.id del query string manualmente
    if (!id) {
      const url = request.url
      const dataIdMatch = url.match(/[?&]data\.id=([^&]+)/)
      if (dataIdMatch) {
        id = decodeURIComponent(dataIdMatch[1])
      }
    }

    if (!topic || !id) {
      log("error", "Missing topic or id", {
        topic,
        id,
        queryParams: Object.fromEntries(searchParams.entries()),
        bodyData,
        url: request.url,
      })
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    log("info", "Notification parsed", { topic, id })

    // Verificar autenticación (opcional pero recomendado)
    // MercadoPago puede enviar un header X-Signature para verificar
    const signature = request.headers.get("x-signature")

    // Procesar según el tipo de notificación
    if (topic === "payment" || topic === "merchant_order") {
      // Obtener información del pago desde MercadoPago
      if (!MERCADOPAGO_ACCESS_TOKEN) {
        log("error", "MercadoPago Access Token not configured")
        return NextResponse.json({ error: "Configuration error" }, { status: 500 })
      }

      // Obtener información del pago/preferencia desde MercadoPago API
      let paymentData = null
      let preferenceData = null

      if (topic === "payment") {
        // Obtener información del pago
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: {
            Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        })

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text()
          log("error", `Error fetching payment ${id}`, { error: errorText, status: paymentResponse.status })
          return NextResponse.json({ error: "Error fetching payment" }, { status: 500 })
        }

        paymentData = await paymentResponse.json()
        log("info", "Payment data retrieved", {
          id: paymentData.id,
          status: paymentData.status,
          external_reference: paymentData.external_reference,
          transaction_amount: paymentData.transaction_amount,
        })
      } else if (topic === "merchant_order") {
        // Obtener información de la orden
        const orderResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
          headers: {
            Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        })

        if (!orderResponse.ok) {
          const errorText = await orderResponse.text()
          log("error", `Error fetching merchant_order ${id}`, { error: errorText, status: orderResponse.status })
          return NextResponse.json({ error: "Error fetching order" }, { status: 500 })
        }

        const orderData = await orderResponse.json()
        log("info", "Order data retrieved", {
          id: orderData.id,
          status: orderData.status,
          preference_id: orderData.preference_id,
        })

        // Si hay payments asociados, obtener el primero
        if (orderData.payments && orderData.payments.length > 0) {
          const paymentId = orderData.payments[0].id
          const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
            },
          })

          if (paymentResponse.ok) {
            paymentData = await paymentResponse.json()
          }
        }
      }

      if (!paymentData) {
        log("warn", "No payment data found, skipping update")
        return NextResponse.json({ received: true })
      }

      // Mapear estados de MercadoPago a nuestros estados
      const statusMap: Record<string, "pending" | "confirmed" | "rejected"> = {
        pending: "pending",
        approved: "confirmed",
        authorized: "confirmed",
        in_process: "pending",
        in_mediation: "pending",
        rejected: "rejected",
        cancelled: "rejected",
        refunded: "rejected",
        charged_back: "rejected",
      }

      const newStatus = statusMap[paymentData.status] || "pending"

      // Buscar el pago en nuestra base de datos usando external_reference
      // El external_reference tiene formato: email-timestamp
      const externalReference = paymentData.external_reference
      if (!externalReference) {
        log("error", "No external_reference found in payment", { paymentId: paymentData.id })
        return NextResponse.json({ received: true, warning: "No external_reference" })
      }

      log("info", "Processing payment", {
        paymentId: paymentData.id,
        status: paymentData.status,
        external_reference: externalReference,
      })

      // Usar service role key para bypassar RLS (necesario para webhooks)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Buscar la reserva por el external_reference (que contiene el email)
      // El formato es: email-timestamp, así que extraemos el email
      const emailMatch = externalReference.match(/^([^-]+)-/)
      if (!emailMatch) {
        log("error", "Invalid external_reference format", { external_reference: externalReference })
        return NextResponse.json({ received: true, warning: "Invalid external_reference format" })
      }

      const email = emailMatch[1]
      log("info", "Searching for reservations", { email, external_reference: externalReference })

      let reservations: any[] = []
      let reservationError: any = null

      // Estrategia 1: Buscar TODAS las reservas con ese email (sin filtros de status)
      // Esto es lo más directo y debería encontrar las reservas que tienen payment_id
      log("info", "Strategy 1: Searching all reservations with email (any status)")
      const { data: allReservations, error: allError } = await supabase
        .from("reservations")
        .select("id, product_id, guest_email, user_id, payment_id, status, created_at")
        .eq("guest_email", email)
        .order("created_at", { ascending: false })
        .limit(20)

      log("info", "Strategy 1 result", {
        found: allReservations?.length || 0,
        error: allError?.message,
        reservations: allReservations?.map((r: any) => ({
          id: r.id,
          status: r.status,
          payment_id: r.payment_id,
          created_at: r.created_at,
          guest_email: r.guest_email,
        })),
      })

      if (!allError && allReservations && allReservations.length > 0) {
        // Priorizar las que tienen payment_id y son recientes (últimas 2 horas)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        const recentWithPayment = allReservations.filter(
          (r: any) => r.payment_id && new Date(r.created_at) >= new Date(twoHoursAgo)
        )

        if (recentWithPayment.length > 0) {
          reservations = recentWithPayment
          log("info", `Found ${reservations.length} recent reservations with payment_id`)
        } else {
          // Si no hay recientes con payment_id, usar todas las que tienen payment_id
          const withPayment = allReservations.filter((r: any) => r.payment_id)
          if (withPayment.length > 0) {
            reservations = withPayment
            log("info", `Found ${reservations.length} reservations with payment_id`)
          } else {
            // Si no tienen payment_id, usar las que tienen status pending_payment
            const pending = allReservations.filter((r: any) => r.status === "pending_payment")
            if (pending.length > 0) {
              reservations = pending
              log("info", `Found ${reservations.length} reservations with status pending_payment`)
            }
          }
        }
      } else {
        reservationError = allError
      }

      // Estrategia 2: Si no encontramos por guest_email, buscar por user_id (usuario autenticado)
      if (reservations.length === 0) {
        log("info", "Strategy 2: Trying to find reservations by user_id")
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single()

        log("info", "Profile lookup", { found: !!profile, error: profileError?.message })

        if (profile) {
          const { data: userReservations, error: userReservationError } = await supabase
            .from("reservations")
            .select("id, product_id, guest_email, user_id, payment_id, status, created_at")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(20)

          log("info", "Strategy 2 result", {
            found: userReservations?.length || 0,
            error: userReservationError?.message,
          })

          if (!userReservationError && userReservations && userReservations.length > 0) {
            // Priorizar las que tienen payment_id
            const withPayment = userReservations.filter((r: any) => r.payment_id)
            if (withPayment.length > 0) {
              reservations = withPayment
              log("info", `Found ${reservations.length} reservations by user_id with payment_id`)
            } else {
              // Si no tienen payment_id, usar las que tienen status pending_payment
              const pending = userReservations.filter((r: any) => r.status === "pending_payment")
              if (pending.length > 0) {
                reservations = pending
                log("info", `Found ${reservations.length} reservations by user_id with status pending_payment`)
              }
            }
            reservationError = null
          } else {
            reservationError = userReservationError
          }
        }
      }

      if (reservations.length === 0) {
        log("error", "No reservations found", {
          email,
          external_reference: externalReference,
          reservationError: reservationError?.message,
        })
        // Retornamos success para que MercadoPago no reintente infinitamente
        return NextResponse.json({ received: true, warning: "No reservations found" })
      }

      log("info", `Found ${reservations.length} reservation(s) to process`, {
        reservationIds: reservations.map((r: any) => r.id),
      })

      // Buscar el pago asociado usando payment_id de las reservas
      // Primero intentar obtener el payment_id de la primera reserva
      const firstReservation = reservations[0]
      
      // Si la reserva tiene payment_id, usarlo directamente
      // Si no, buscar por reservation_id (compatibilidad con pagos antiguos)
      let payment = null
      let paymentError = null

      if (firstReservation.payment_id) {
        // Buscar por payment_id (nuevo método para pagos múltiples)
        const { data: paymentData, error: error } = await supabase
          .from("payments")
          .select("id, status")
          .eq("id", firstReservation.payment_id)
          .eq("method", "mp_link")
          .single()

        payment = paymentData
        paymentError = error
      } else {
        // Buscar por reservation_id (método antiguo para compatibilidad)
        const { data: paymentData, error: error } = await supabase
          .from("payments")
          .select("id, status")
          .eq("reservation_id", firstReservation.id)
          .eq("method", "mp_link")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        payment = paymentData
        paymentError = error
      }

      if (paymentError || !payment) {
        log("error", "Payment not found", {
          paymentError: paymentError?.message,
          reservationId: firstReservation.id,
          paymentId: firstReservation.payment_id,
        })
        return NextResponse.json({ received: true, warning: "Payment not found" })
      }

      log("info", "Payment found in database", {
        paymentId: payment.id,
        currentStatus: payment.status,
        newStatus,
      })

      // Actualizar el estado del pago
      const updateData: {
        status: "pending" | "confirmed" | "rejected"
        confirmed_at?: string
        updated_at: string
      } = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "confirmed") {
        updateData.confirmed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase.from("payments").update(updateData).eq("id", payment.id)

      if (updateError) {
        log("error", "Error updating payment", { updateError: updateError.message, paymentId: payment.id })
        return NextResponse.json({ error: "Error updating payment" }, { status: 500 })
      }

      log("info", "Payment updated successfully", {
        paymentId: payment.id,
        newStatus,
        updateData,
      })

      // Si el pago fue confirmado, actualizar el estado de TODAS las reservas
      if (newStatus === "confirmed") {
        const reservationIds = reservations.map((r) => r.id)
        const { error: updateReservationsError } = await supabase
          .from("reservations")
          .update({ status: "confirmed" })
          .in("id", reservationIds)

        if (updateReservationsError) {
          log("error", "Error updating reservations", {
            updateReservationsError: updateReservationsError.message,
            reservationIds,
          })
          return NextResponse.json({ error: "Error updating reservations" }, { status: 500 })
        }

        log("info", "Payment and reservations confirmed", {
          paymentId: payment.id,
          reservationCount: reservations.length,
          reservationIds,
        })
      } else if (newStatus === "rejected") {
        // Si fue rechazado, mantener pending_payment o cambiar a cancelled según tu lógica
        // Por ahora, lo dejamos como pending_payment para que el admin pueda revisar
        log("warn", "Payment rejected", {
          paymentId: payment.id,
          reservationCount: reservations.length,
        })
      }

      log("info", "Webhook processing completed", {
        paymentId: payment.id,
        status: newStatus,
        reservationsAffected: reservations.length,
      })

      return NextResponse.json({ received: true, updated: true, payment_id: payment.id, status: newStatus })
    }

    // Para otros tipos de notificaciones, solo confirmamos recepción
    log("info", `Notification type ${topic} received but not processed`)
    return NextResponse.json({ received: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    log("error", "Error processing webhook", {
      error: errorMessage,
      stack: errorStack,
    })
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// MercadoPago también puede hacer GET para verificar el endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: "MercadoPago webhook endpoint",
    status: "active",
    timestamp: new Date().toISOString()
  })
}

