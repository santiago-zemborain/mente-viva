import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      reservation_id, // Para compatibilidad con pagos de una sola reserva
      reservation_ids, // Array de IDs de reservas para pagos múltiples
      method,
      status,
      payment_type,
      amount,
    } = body

    // Validar datos requeridos
    if (!method || !amount) {
      return NextResponse.json(
        { error: "Datos incompletos: method y amount son requeridos" },
        { status: 400 }
      )
    }

    // Debe tener al menos reservation_id o reservation_ids
    if (!reservation_id && (!reservation_ids || reservation_ids.length === 0)) {
      return NextResponse.json(
        { error: "Datos incompletos: reservation_id o reservation_ids son requeridos" },
        { status: 400 }
      )
    }

    // Usar service role key si está disponible, sino usar anon key
    // El service role key bypassa RLS, el anon key respeta RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Normalizar reservation_ids: si viene reservation_id, convertirlo a array
    const reservationIds = reservation_ids || (reservation_id ? [reservation_id] : [])
    
    // Para pagos múltiples, reservation_id en payments será null
    // Para pagos de una sola reserva, mantener reservation_id para compatibilidad
    const singleReservationId = reservationIds.length === 1 ? reservationIds[0] : null

    // Crear pago
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        reservation_id: singleReservationId, // null si es múltiple, el ID si es una sola
        method,
        status: status || "pending",
        payment_type: payment_type || "full",
        amount: typeof amount === "number" ? amount : parseFloat(amount),
      })
      .select()
      .single()

    if (paymentError) {
      console.error("Error creating guest payment:", paymentError)
      return NextResponse.json(
        { error: paymentError.message || "Error al crear el pago" },
        { status: 500 }
      )
    }

    // Actualizar todas las reservas con el payment_id
    if (reservationIds.length > 0) {
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ payment_id: payment.id })
        .in("id", reservationIds)

      if (updateError) {
        console.error("Error updating reservations with payment_id:", updateError)
        // No fallar el pago si la actualización falla, pero loguear el error
      }
    }

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error("Error in create-guest payment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

