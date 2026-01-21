"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  const settings = {
    bank_name: formData.get("bank_name"),
    bank_cbu: formData.get("bank_cbu"),
    bank_alias: formData.get("bank_alias"),
    bank_holder: formData.get("bank_holder"),
    mercadopago_link: formData.get("mercadopago_link"),
    whatsapp_number: formData.get("whatsapp_number"),
    email_contact: formData.get("email_contact"),
    address: formData.get("address"),
    trial_price: formData.get("trial_price"),
    monthly_price: formData.get("monthly_price"),
  }

  // Update each setting
  for (const [key, value] of Object.entries(settings)) {
    if (value) {
      await supabase.from("site_settings").upsert({ key, value: value as string }, { onConflict: "key" })
    }
  }

  revalidatePath("/admin/configuracion")
  return { success: true }
}

export async function addHoliday(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { error } = await supabase.from("holidays").insert({
    date: formData.get("date") as string,
    name: formData.get("name") as string,
    type: formData.get("type") as string,
  })

  if (error) throw error

  revalidatePath("/admin/feriados")
  return { success: true }
}

export async function deleteHoliday(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { error } = await supabase.from("holidays").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/admin/feriados")
  return { success: true }
}

export async function updatePageContent(page: string, content: Record<string, string>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { error } = await supabase.from("page_content").upsert({ page, content }, { onConflict: "page" })

  if (error) throw error

  revalidatePath(`/${page}`)
  revalidatePath("/admin/contenido")
  return { success: true }
}

export async function createSpecialClass(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  const productData = {
    type: "special" as const,
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    short_description: formData.get("short_description") as string || null,
    price: parseFloat(formData.get("price") as string),
    month_label: formData.get("month_label") as string || null,
    capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : 13,
    duration_minutes: formData.get("duration_minutes") ? parseInt(formData.get("duration_minutes") as string) : 90,
    location: formData.get("location") as string || null,
    instructor_name: formData.get("instructor_name") as string || null,
    instructor_bio: formData.get("instructor_bio") as string || null,
    modality: (formData.get("modality") as string) || null,
    is_active: formData.get("is_inactive") !== "true", // Si is_inactive está marcado, is_active es false
    is_free: formData.get("is_free") === "true",
    requires_deposit: formData.get("requires_deposit") === "true",
    deposit_percent: formData.get("deposit_percent") ? parseInt(formData.get("deposit_percent") as string) : 50,
  }

  const { error } = await supabase.from("products").insert(productData)

  if (error) throw error

  revalidatePath("/admin/clases-especiales")
  return { success: true }
}

export async function updateSpecialClass(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  const id = formData.get("id") as string
  if (!id) throw new Error("ID de producto requerido")

  const productData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    short_description: formData.get("short_description") as string || null,
    price: parseFloat(formData.get("price") as string),
    month_label: formData.get("month_label") as string || null,
    capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : 13,
    duration_minutes: formData.get("duration_minutes") ? parseInt(formData.get("duration_minutes") as string) : 90,
    location: formData.get("location") as string || null,
    instructor_name: formData.get("instructor_name") as string || null,
    instructor_bio: formData.get("instructor_bio") as string || null,
    modality: (formData.get("modality") as string) || null,
    is_active: formData.get("is_inactive") !== "true", // Si is_inactive está marcado, is_active es false
    is_free: formData.get("is_free") === "true",
    requires_deposit: formData.get("requires_deposit") === "true",
    deposit_percent: formData.get("deposit_percent") ? parseInt(formData.get("deposit_percent") as string) : 50,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("products").update(productData).eq("id", id)

  if (error) throw error

  revalidatePath("/admin/clases-especiales")
  revalidatePath("/clases-especiales")
  return { success: true }
}

export async function exportSpecialClassReservations(productId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  // Get all reservations for this product
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("id, guest_name, guest_email, guest_phone, status, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: true })

  if (error) throw error

  // Get payments for all reservations
  const reservationIds = reservations?.map((r) => r.id) || []
  const { data: payments } = await supabase
    .from("payments")
    .select("reservation_id, method, amount, status")
    .in("reservation_id", reservationIds)

  // Create a map of reservation_id -> payment
  const paymentMap = new Map()
  payments?.forEach((payment) => {
    if (!paymentMap.has(payment.reservation_id)) {
      paymentMap.set(payment.reservation_id, payment)
    }
  })

  // Get product info
  const { data: product } = await supabase.from("products").select("title").eq("id", productId).single()

  // Generate CSV
  const headers = [
    "Nombre",
    "Email",
    "Teléfono",
    "Estado",
    "Método de pago",
    "Monto",
    "Estado de pago",
    "Fecha de reserva",
  ]

  const rows = reservations?.map((reservation) => {
    const payment = paymentMap.get(reservation.id)
    const method = payment?.method === "transfer" ? "Transferencia" : payment?.method === "mp_link" ? "MercadoPago" : ""
    return [
      reservation.guest_name || "",
      reservation.guest_email || "",
      reservation.guest_phone || "",
      reservation.status || "",
      method,
      payment?.amount ? `$${Number(payment.amount).toLocaleString("es-AR")}` : "",
      payment?.status || "",
      new Date(reservation.created_at).toLocaleDateString("es-AR"),
    ]
  }) || []

  // Create CSV content with BOM for Excel compatibility
  const csvContent = [
    `Clase: ${product?.title || "Clase Especial"}`,
    `Total de inscriptos: ${reservations?.length || 0}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  // Add BOM for Excel UTF-8 support
  return "\uFEFF" + csvContent
}

export async function createWorkshopClass(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  const classDate = formData.get("class_date") as string
  const weekday = formData.get("weekday") as string
  const time = formData.get("time") as string

  // Crear título basado en la fecha
  const date = new Date(classDate)
  const dayName = weekday === "3" ? "Miércoles" : "Viernes"
  const formattedDate = date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
  const title = `Taller de Memoria - ${dayName} ${time} - ${formattedDate}`

  const price = parseFloat(formData.get("price") as string)
  const monthlyPrice = formData.get("monthly_price") ? parseFloat(formData.get("monthly_price") as string) : null

  const productData = {
    type: "monthly" as const, // Usamos 'monthly' como tipo base
    title,
    description: `Clase del Taller de Memoria del ${formattedDate}`,
    short_description: `${dayName} ${time}`,
    price,
    monthly_price: monthlyPrice, // Precio para pack mensual (opcional)
    capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : 13,
    duration_minutes: 90,
    location: formData.get("location") as string || null,
    is_active: formData.get("is_inactive") !== "true",
    is_free: formData.get("is_free") === "true",
    month_label: classDate, // Usamos month_label para almacenar la fecha de la clase
  }

  const { data: product, error: productError } = await supabase.from("products").insert(productData).select().single()

  if (productError) throw productError

  // Crear schedule asociado
  if (product) {
    const { error: scheduleError } = await supabase.from("schedules").insert({
      product_id: product.id,
      weekday: parseInt(weekday),
      time_slot: time,
      specific_date: classDate,
      capacity: productData.capacity,
    })

    if (scheduleError) {
      console.error("Error creating schedule:", scheduleError)
      // No fallar si el schedule falla, pero loguear el error
    }
  }

  revalidatePath("/admin/taller")
  revalidatePath("/taller-de-memoria/inscripcion")
  return { success: true, product }
}

export async function updateWorkshopClass(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  const id = formData.get("id") as string
  if (!id) throw new Error("ID de producto requerido")

  const classDate = formData.get("class_date") as string
  const weekday = formData.get("weekday") as string
  const time = formData.get("time") as string

  // Crear título basado en la fecha
  const date = new Date(classDate)
  const dayName = weekday === "3" ? "Miércoles" : "Viernes"
  const formattedDate = date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
  const title = `Taller de Memoria - ${dayName} ${time} - ${formattedDate}`

  const price = parseFloat(formData.get("price") as string)
  const monthlyPrice = formData.get("monthly_price") ? parseFloat(formData.get("monthly_price") as string) : null

  const productData = {
    title,
    description: `Clase del Taller de Memoria del ${formattedDate}`,
    short_description: `${dayName} ${time}`,
    price,
    monthly_price: monthlyPrice, // Precio para pack mensual (opcional)
    capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : 13,
    location: formData.get("location") as string || null,
    is_active: formData.get("is_inactive") !== "true",
    is_free: formData.get("is_free") === "true",
    month_label: classDate,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("products").update(productData).eq("id", id)

  if (error) throw error

  // Actualizar schedule
  const { data: schedules } = await supabase.from("schedules").select("id").eq("product_id", id).limit(1)
  if (schedules && schedules.length > 0) {
    await supabase
      .from("schedules")
      .update({
        weekday: parseInt(weekday),
        time_slot: time,
        specific_date: classDate,
        capacity: productData.capacity,
      })
      .eq("id", schedules[0].id)
  }

  revalidatePath("/admin/taller")
  revalidatePath("/taller-de-memoria/inscripcion")
  return { success: true }
}
