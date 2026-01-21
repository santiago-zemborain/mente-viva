"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createReservation(data: {
  productId: string
  scheduleId: string
  paymentMethod: "mercadopago" | "transfer"
  receiptUrl?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  // Check interview completed
  const { data: profile } = await supabase.from("profiles").select("interview_completed").eq("id", user.id).single()

  if (!profile?.interview_completed) {
    throw new Error("Debe completar la entrevista antes de reservar")
  }

  // Get product price
  const { data: product } = await supabase.from("products").select("price").eq("id", data.productId).single()

  if (!product) throw new Error("Producto no encontrado")

  // Create reservation
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      user_id: user.id,
      product_id: data.productId,
      schedule_id: data.scheduleId,
      status: "pending_payment",
    })
    .select()
    .single()

  if (reservationError) throw reservationError

  // Create payment record
  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: user.id,
    reservation_id: reservation.id,
    amount: product.price,
    method: data.paymentMethod,
    status: "pending",
    receipt_url: data.receiptUrl,
  })

  if (paymentError) throw paymentError

  revalidatePath("/mi-cuenta")
  return { success: true, reservationId: reservation.id }
}

export async function updatePaymentStatus(paymentId: string, status: "confirmed" | "rejected", adminNotes?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  // Check admin role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  // Update payment
  const { data: payment, error } = await supabase
    .from("payments")
    .update({ status, admin_notes: adminNotes })
    .eq("id", paymentId)
    .select("reservation_id")
    .single()

  if (error) throw error

  // Update reservation status if payment confirmed
  if (status === "confirmed" && payment?.reservation_id) {
    await supabase.from("reservations").update({ status: "active" }).eq("id", payment.reservation_id)
  }

  // Log action
  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: `payment_${status}`,
    entity_type: "payment",
    entity_id: paymentId,
    details: { admin_notes: adminNotes },
  })

  revalidatePath("/admin/pagos")
  return { success: true }
}
