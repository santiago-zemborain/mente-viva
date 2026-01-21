"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createInterviewRequest(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { error } = await supabase.from("interview_requests").insert({
    user_id: user.id,
    preferred_date: formData.get("preferred_date") as string,
    preferred_time: formData.get("preferred_time") as string,
    notes: formData.get("notes") as string,
    status: "pending",
  })

  if (error) throw error

  revalidatePath("/taller-de-memoria")
  return { success: true }
}

export async function updateInterviewStatus(id: string, status: "approved" | "rejected", adminNotes?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  // Check admin role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("No autorizado")

  const { error } = await supabase.from("interview_requests").update({ status, admin_notes: adminNotes }).eq("id", id)

  if (error) throw error

  // If approved, update user profile
  if (status === "approved") {
    const { data: interview } = await supabase.from("interview_requests").select("user_id").eq("id", id).single()

    if (interview) {
      await supabase.from("profiles").update({ interview_completed: true }).eq("id", interview.user_id)
    }
  }

  // Log action
  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: `interview_${status}`,
    entity_type: "interview_request",
    entity_id: id,
    details: { admin_notes: adminNotes },
  })

  revalidatePath("/admin/entrevistas")
  return { success: true }
}
