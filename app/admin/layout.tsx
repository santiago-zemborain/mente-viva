import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

// Todas las páginas de admin deben ser dinámicas
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role, name").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <AdminHeader userName={profile?.name || user.email || "Admin"} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
