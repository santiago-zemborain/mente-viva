import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, Phone, User, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function InscripcionesPage() {
  const supabase = await createClient()

  // Obtener inscripciones recurrentes (usuarios que ya asistieron)
  const { data: inscriptions } = await supabase
    .from("reservations")
    .select("*")
    .not("guest_name", "is", null)
    .order("created_at", { ascending: false })

  // Agrupar por mes
  const groupedByMonth: Record<string, typeof inscriptions> = {}

  inscriptions?.forEach((inscription) => {
    const date = new Date(inscription.created_at)
    const monthKey = date.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = []
    }
    groupedByMonth[monthKey]!.push(inscription)
  })

  const weekdayNames: Record<number, string> = {
    3: "Miércoles",
    5: "Viernes",
  }

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> =
    {
      pending: { label: "Pendiente", variant: "outline" },
      confirmed: { label: "Confirmado", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inscripciones Recurrentes</h1>
        <p className="text-muted-foreground">Personas que ya asistieron al taller y se inscribieron a nuevas clases</p>
      </div>

      {Object.keys(groupedByMonth).length > 0 ? (
        <Tabs defaultValue={Object.keys(groupedByMonth)[0]} className="w-full">
          <TabsList className="flex-wrap h-auto gap-2">
            {Object.keys(groupedByMonth).map((month) => (
              <TabsTrigger key={month} value={month} className="capitalize">
                {month} ({groupedByMonth[month]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedByMonth).map(([month, monthInscriptions]) => (
            <TabsContent key={month} value={month} className="mt-6">
              <div className="grid gap-4">
                {monthInscriptions?.map((inscription) => (
                  <Card key={inscription.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {inscription.guest_name}
                          </CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {inscription.guest_email}
                            </span>
                            {inscription.guest_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {inscription.guest_phone}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusLabels[inscription.status]?.variant || "outline"}>
                            {statusLabels[inscription.status]?.label || inscription.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {inscription.selected_date
                              ? new Date(inscription.selected_date).toLocaleDateString("es-AR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })
                              : weekdayNames[inscription.selected_weekday] || `Día ${inscription.selected_weekday}`}
                          </span>
                        </div>
                        {inscription.selected_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{inscription.selected_time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Modalidad:</span>
                          <Badge variant="secondary">
                            {inscription.payment_mode === "monthly" ? "Pack Mensual" : "Clase Suelta"}
                          </Badge>
                        </div>
                        {inscription.payment_method && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Pago:</span>
                            <Badge variant="outline">
                              {inscription.payment_method === "mercadopago" ? "MercadoPago" : "Transferencia"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        Inscripto el{" "}
                        {new Date(inscription.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay inscripciones recurrentes todavía</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
