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
  try {
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
      }
    } catch (e) {
      // Si no hay body o no es JSON, continuar con query params
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
      console.error("[Webhook] Missing topic or id", {
        topic,
        id,
        queryParams: Object.fromEntries(searchParams.entries()),
        bodyData,
      })
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    console.log(`[Webhook] Received notification: topic=${topic}, id=${id}`)

    // Verificar autenticación (opcional pero recomendado)
    // MercadoPago puede enviar un header X-Signature para verificar
    const signature = request.headers.get("x-signature")
    const requestId = request.headers.get("x-request-id")

    // Procesar según el tipo de notificación
    if (topic === "payment" || topic === "merchant_order") {
      // Obtener información del pago desde MercadoPago
      if (!MERCADOPAGO_ACCESS_TOKEN) {
        console.error("[Webhook] MercadoPago Access Token not configured")
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
          console.error(`[Webhook] Error fetching payment ${id}:`, await paymentResponse.text())
          return NextResponse.json({ error: "Error fetching payment" }, { status: 500 })
        }

        paymentData = await paymentResponse.json()
        console.log(`[Webhook] Payment data:`, {
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
          console.error(`[Webhook] Error fetching merchant_order ${id}:`, await orderResponse.text())
          return NextResponse.json({ error: "Error fetching order" }, { status: 500 })
        }

        const orderData = await orderResponse.json()
        console.log(`[Webhook] Order data:`, {
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
        console.log("[Webhook] No payment data found, skipping update")
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
        console.error("[Webhook] No external_reference found in payment")
        return NextResponse.json({ received: true, warning: "No external_reference" })
      }

      // Usar service role key para bypassar RLS (necesario para webhooks)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Buscar la reserva por el external_reference (que contiene el email)
      // El formato es: email-timestamp, así que extraemos el email
      const emailMatch = externalReference.match(/^([^-]+)-/)
      if (!emailMatch) {
        console.error("[Webhook] Invalid external_reference format:", externalReference)
        return NextResponse.json({ received: true, warning: "Invalid external_reference format" })
      }

      const email = emailMatch[1]
      console.log(`[Webhook] Searching for reservations with email: ${email}`)

      let reservations: any[] = []
      let reservationError: any = null

      // Estrategia 1: Buscar TODAS las reservas con ese email (sin filtros de status)
      // Esto es lo más directo y debería encontrar las reservas que tienen payment_id
      console.log(`[Webhook] Strategy 1: Searching all reservations with email (any status)...`)
      const { data: allReservations, error: allError } = await supabase
        .from("reservations")
        .select("id, product_id, guest_email, user_id, payment_id, status, created_at")
        .eq("guest_email", email)
        .order("created_at", { ascending: false })
        .limit(20)

      console.log(`[Webhook] Strategy 1 result:`, {
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

      if (allReservations) {
        for (const reservation of allReservations) {
          console.log("RESERVATION", reservation);
        }
      }

      if (!allError && allReservations && allReservations.length > 0) {
        // Priorizar las que tienen payment_id y son recientes (últimas 2 horas)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        const recentWithPayment = allReservations.filter(
          (r: any) => r.payment_id && new Date(r.created_at) >= new Date(twoHoursAgo)
        )

        if (recentWithPayment.length > 0) {
          reservations = recentWithPayment
          console.log(`[Webhook] Found ${reservations.length} recent reservations with payment_id`)
        } else {
          // Si no hay recientes con payment_id, usar todas las que tienen payment_id
          const withPayment = allReservations.filter((r: any) => r.payment_id)
          if (withPayment.length > 0) {
            reservations = withPayment
            console.log(`[Webhook] Found ${reservations.length} reservations with payment_id`)
          } else {
            // Si no tienen payment_id, usar las que tienen status pending_payment
            const pending = allReservations.filter((r: any) => r.status === "pending_payment")
            if (pending.length > 0) {
              reservations = pending
              console.log(`[Webhook] Found ${reservations.length} reservations with status pending_payment`)
            }
          }
        }
      } else {
        reservationError = allError
      }

      // Estrategia 2: Si no encontramos por guest_email, buscar por user_id (usuario autenticado)
      if (reservations.length === 0) {
        console.log(`[Webhook] Strategy 2: Trying to find reservations by user_id...`)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single()

        console.log(`[Webhook] Profile lookup:`, { found: !!profile, error: profileError?.message })

        if (profile) {
          const { data: userReservations, error: userReservationError } = await supabase
            .from("reservations")
            .select("id, product_id, guest_email, user_id, payment_id, status, created_at")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(20)

          console.log(`[Webhook] Strategy 2 result:`, {
            found: userReservations?.length || 0,
            error: userReservationError?.message,
          })

          if (!userReservationError && userReservations && userReservations.length > 0) {
            // Priorizar las que tienen payment_id
            const withPayment = userReservations.filter((r: any) => r.payment_id)
            if (withPayment.length > 0) {
              reservations = withPayment
              console.log(`[Webhook] Found ${reservations.length} reservations by user_id with payment_id`)
            } else {
              // Si no tienen payment_id, usar las que tienen status pending_payment
              const pending = userReservations.filter((r: any) => r.status === "pending_payment")
              if (pending.length > 0) {
                reservations = pending
                console.log(`[Webhook] Found ${reservations.length} reservations by user_id with status pending_payment`)
              }
            }
            reservationError = null
          } else {
            reservationError = userReservationError
          }
        }
      }

      if (reservations.length === 0) {
        console.error("[Webhook] No reservations found for email:", email, reservationError)
        console.error("[Webhook] External reference:", externalReference)
        // Retornamos success para que MercadoPago no reintente infinitamente
        return NextResponse.json({ received: true, warning: "No reservations found" })
      }

      console.log(`[Webhook] Found ${reservations.length} reservation(s) to process`)

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
        console.error("[Webhook] Payment not found:", paymentError)
        return NextResponse.json({ received: true, warning: "Payment not found" })
      }

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
        console.error("[Webhook] Error updating payment:", updateError)
        return NextResponse.json({ error: "Error updating payment" }, { status: 500 })
      }

      // Si el pago fue confirmado, actualizar el estado de TODAS las reservas
      if (newStatus === "confirmed") {
        const reservationIds = reservations.map((r) => r.id)
        const { error: updateReservationsError } = await supabase
          .from("reservations")
          .update({ status: "confirmed" })
          .in("id", reservationIds)

        if (updateReservationsError) {
          console.error("[Webhook] Error updating reservations:", updateReservationsError)
          return NextResponse.json({ error: "Error updating reservations" }, { status: 500 })
        }

        console.log(`[Webhook] Payment ${payment.id} and ${reservations.length} reservations updated to confirmed`)
      } else if (newStatus === "rejected") {
        // Si fue rechazado, mantener pending_payment o cambiar a cancelled según tu lógica
        // Por ahora, lo dejamos como pending_payment para que el admin pueda revisar
        console.log(`[Webhook] Payment ${payment.id} rejected, keeping ${reservations.length} reservations as pending_payment`)
      }

      console.log(`[Webhook] Payment ${payment.id} updated to status: ${newStatus}, affecting ${reservations.length} reservation(s)`)

      return NextResponse.json({ received: true, updated: true, payment_id: payment.id, status: newStatus })
    }

    // Para otros tipos de notificaciones, solo confirmamos recepción
    console.log(`[Webhook] Notification type ${topic} received but not processed`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error)
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

