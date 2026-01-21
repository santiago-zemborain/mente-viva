import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageSquare, CreditCard, Calendar, ArrowRight } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch counts
  const { count: pendingInterviews } = await supabase
    .from("interview_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: pendingPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: confirmedPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed")
    .gte("confirmed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 días

  const { count: upcomingReservations } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Fetch recent interview requests
  const { data: recentInterviews } = await supabase
    .from("interview_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent pending payments (sin join automático por el problema de relaciones múltiples)
  const { data: recentPaymentsData } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  // Obtener reservas para estos pagos
  const recentPaymentIds = recentPaymentsData?.map((p) => p.id) || []
  const recentReservationIds = recentPaymentsData?.map((p) => p.reservation_id).filter(Boolean) || []

  const { data: recentReservationsByPayment } = await supabase
    .from("reservations")
    .select("*, products(title)")
    .in("payment_id", recentPaymentIds)

  const { data: recentReservationsById } = await supabase
    .from("reservations")
    .select("*, products(title)")
    .in("id", recentReservationIds)

  const recentReservationsMap = new Map()
  recentReservationsByPayment?.forEach((r) => {
    if (r.payment_id && !recentReservationsMap.has(r.payment_id)) {
      recentReservationsMap.set(r.payment_id, r)
    }
  })
  recentReservationsById?.forEach((r) => {
    recentReservationsMap.set(r.id, r)
  })

  const recentPayments = recentPaymentsData?.map((payment) => {
    const reservation =
      recentReservationsMap.get(payment.id) || (payment.reservation_id ? recentReservationsMap.get(payment.reservation_id) : null)
    return {
      ...payment,
      reservations: reservation || null,
    }
  })

  const stats = [
    {
      title: "Entrevistas pendientes",
      value: pendingInterviews || 0,
      icon: MessageSquare,
      href: "/admin/entrevistas",
      urgent: (pendingInterviews || 0) > 0,
    },
    {
      title: "Pagos por confirmar",
      value: pendingPayments || 0,
      icon: CreditCard,
      href: "/admin/pagos",
      urgent: (pendingPayments || 0) > 0,
    },
    {
      title: "Pagos confirmados (7 días)",
      value: confirmedPayments || 0,
      icon: CreditCard,
      href: "/admin/pagos?tab=confirmed",
      urgent: false,
    },
    {
      title: "Reservas pendientes",
      value: upcomingReservations || 0,
      icon: Calendar,
      href: "/admin/taller",
      urgent: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de actividad de Mente Viva</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.urgent ? "border-amber-200 bg-amber-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.urgent ? "text-amber-600" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stat.value}</span>
                <Button asChild variant="ghost" size="sm">
                  <Link href={stat.href}>
                    Ver
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Entrevistas recientes
            </CardTitle>
            <CardDescription>Solicitudes pendientes de aprobación</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInterviews && recentInterviews.length > 0 ? (
              <div className="space-y-4">
                {recentInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{interview.name}</p>
                      <p className="text-sm text-muted-foreground">{interview.email}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Pendiente
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/entrevistas">Ver todas</Link>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay entrevistas pendientes</p>
            )}
          </CardContent>
        </Card>

        {/* Recent payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagos pendientes
            </CardTitle>
            <CardDescription>Pagos por confirmar</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments && recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">${payment.amount?.toLocaleString("es-AR") || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.method === "mp_link" ? "MercadoPago" : "Transferencia"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Pendiente
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/pagos">Ver todos</Link>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay pagos pendientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/admin/entrevistas">Gestionar entrevistas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/pagos">Confirmar pagos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/configuracion">Configuración</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
