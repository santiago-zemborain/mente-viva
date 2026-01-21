import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      product_id,
      guest_name,
      guest_email,
      guest_phone,
      status,
      terms_accepted_at,
      selected_weekday,
      selected_time,
      selected_date,
      payment, // Opcional: { method, payment_type, amount }
    } = body

    // Validar datos requeridos
    // Para clases especiales: product_id es requerido
    // Para taller de memoria: selected_weekday y selected_time son requeridos
    const isSpecialClass = !!product_id
    const isWorkshop = selected_weekday !== undefined && !!selected_time

    if (!guest_name || !guest_email || !guest_phone) {
      return NextResponse.json(
        { error: "Datos incompletos: nombre, email y teléfono son requeridos" },
        { status: 400 }
      )
    }

    if (!isSpecialClass && !isWorkshop) {
      return NextResponse.json(
        { error: "Datos incompletos: se requiere product_id (clase especial) o selected_weekday/selected_time (taller)" },
        { status: 400 }
      )
    }

    // Usar service role key si está disponible, sino usar anon key
    // El service role key bypassa RLS, el anon key respeta RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Crear reserva como guest (user_id será NULL)
    const reservationData: any = {
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim(),
      guest_phone: guest_phone.trim(),
      status: status || "pending",
      terms_accepted_at: terms_accepted_at || new Date().toISOString(),
      user_id: null, // Guest reservation
    }

    // Agregar campos según el tipo de reserva
    if (product_id) {
      reservationData.product_id = product_id
    }
    if (selected_weekday !== undefined) {
      reservationData.selected_weekday = selected_weekday
    }
    if (selected_time) {
      reservationData.selected_time = selected_time
    }
    if (selected_date) {
      reservationData.selected_date = selected_date
    }

    const { data: reservation, error: insertError } = await supabase
      .from("reservations")
      .insert(reservationData)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating guest reservation:", insertError)
      return NextResponse.json(
        { error: insertError.message || "Error al crear la reserva" },
        { status: 500 }
      )
    }

    // Crear pago si se proporciona información de pago
    let paymentData = null
    if (payment && reservation) {
      const { data: createdPayment, error: paymentError } = await supabase.from("payments").insert({
        reservation_id: reservation.id,
        method: payment.method,
        status: "pending",
        payment_type: payment.payment_type || "full",
        amount: payment.amount,
      }).select().single()

      if (paymentError) {
        console.error("Error creating payment:", paymentError)
        // No fallar la reserva si el pago falla, solo loguear el error
      } else {
        paymentData = createdPayment
      }
    }

    return NextResponse.json({ success: true, reservation, payment: paymentData })
  } catch (error) {
    console.error("Error in create-guest reservation:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

