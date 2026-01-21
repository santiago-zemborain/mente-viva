import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CreditCard, User, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/actions/auth"

// Esta página requiere autenticación, debe ser dinámica
export const dynamic = 'force-dynamic'

export default async function MiCuentaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/mi-cuenta")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: interviewRequests } = await supabase
    .from("interview_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: reservations } = await supabase
    .from("reservations")
    .select(`
      *,
      product:products(*),
      schedule:schedules(*),
      payments(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "approved":
      case "confirmed":
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Aprobado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Mi Cuenta</h1>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mis Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{profile?.name || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{profile?.phone || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entrevista</p>
                {profile?.interview_completed ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completada
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Pendiente
                  </Badge>
                )}
              </div>
            </div>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                Cerrar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Interview Requests */}
        {!profile?.interview_completed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Solicitudes de Entrevista
              </CardTitle>
              <CardDescription>Debe completar una entrevista antes de poder reservar el taller</CardDescription>
            </CardHeader>
            <CardContent>
              {interviewRequests && interviewRequests.length > 0 ? (
                <div className="space-y-4">
                  {interviewRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(request.preferred_date).toLocaleDateString("es-AR")} - {request.preferred_time}
                        </p>
                        {request.notes && <p className="text-sm text-muted-foreground">{request.notes}</p>}
                        {request.admin_notes && (
                          <p className="text-sm text-primary mt-1">Nota: {request.admin_notes}</p>
                        )}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No tiene solicitudes de entrevista</p>
                  <Button asChild>
                    <Link href="/taller-de-memoria">Solicitar Entrevista</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mis Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations && reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{reservation.product?.name}</h4>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Horario: {reservation.schedule?.day_of_week} {reservation.schedule?.start_time} -{" "}
                        {reservation.schedule?.end_time}
                      </p>
                      <p>Precio: ${reservation.product?.price?.toLocaleString("es-AR")}</p>
                    </div>
                    {reservation.payments?.[0] && (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4" />
                        <span>Pago: </span>
                        {getStatusBadge(reservation.payments[0].status)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No tiene reservas activas</p>
                {profile?.interview_completed && (
                  <Button asChild>
                    <Link href="/taller-de-memoria/reservar">Reservar Taller</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
