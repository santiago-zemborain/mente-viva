import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReservationFlow } from "@/components/booking/reservation-flow"

export const metadata: Metadata = {
  title: "Reservar Clase",
  description: "Reservá tu clase de prueba o inscribite al mes en el Taller de Memoria.",
}

// Esta página requiere autenticación y datos dinámicos, debe ser dinámica
export const dynamic = 'force-dynamic'

export default async function ReservarPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/taller-de-memoria/reservar")
  }

  // Check if user is approved (has completed interview)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_approved, name, email, phone")
    .eq("id", user.id)
    .single()

  // Check for approved interview request
  const { data: interview } = await supabase
    .from("interview_requests")
    .select("status")
    .eq("email", user.email)
    .eq("status", "approved")
    .single()

  const isApproved = profile?.is_approved || interview?.status === "approved"

  if (!isApproved) {
    redirect("/taller-de-memoria/entrevista?message=pending")
  }

  // Get products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("type", ["trial", "monthly"])
    .eq("is_active", true)

  // Get holidays
  const { data: holidays } = await supabase.from("holidays").select("date").eq("is_active", true)

  // Get closed dates
  const { data: closedDates } = await supabase.from("closed_dates").select("date")

  // Get site settings
  const { data: bankDetails } = await supabase.from("site_settings").select("value").eq("key", "bank_details").single()

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <ReservationFlow
          userId={user.id}
          userProfile={{
            name: profile?.name || "",
            email: user.email || "",
            phone: profile?.phone || "",
          }}
          products={products || []}
          holidays={(holidays || []).map((h) => h.date)}
          closedDates={(closedDates || []).map((c) => c.date)}
          bankDetails={bankDetails?.value as Record<string, string> | null}
        />
      </div>
    </div>
  )
}
