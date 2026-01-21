import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Download } from "lucide-react"
import { CreateWorkshopClassesDialog } from "@/components/admin/create-workshop-classes-dialog"
import { EditWorkshopClassDialog } from "@/components/admin/edit-workshop-class-dialog"

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export default async function TallerPage() {
  const supabase = await createClient()

  // Obtener todas las clases del taller (productos de tipo monthly con month_label en formato fecha)
  const { data: allProducts } = await supabase
    .from("products")
    .select("*, schedules(weekday, time_slot, specific_date)")
    .eq("type", "monthly")
    .order("month_label", { ascending: true })

  // Filtrar solo las que tienen month_label en formato fecha (clases individuales)
  const workshopClasses = allProducts?.filter((p) => {
    if (!p.month_label) return false
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    return dateRegex.test(p.month_label)
  }) || []

  // Obtener todas las reservas para estas clases
  const productIds = workshopClasses.map((c) => c.id)
  const { data: reservations } = await supabase
    .from("reservations")
    .select("*, profiles(name, email, phone), products(id, title, month_label), payments(status, amount)")
    .in("product_id", productIds)
    .order("created_at", { ascending: false })

  // Crear un mapa de product_id -> reservas
  const reservationsByProduct = new Map<string, typeof reservations>()
  reservations?.forEach((res) => {
    if (res.product_id) {
      if (!reservationsByProduct.has(res.product_id)) {
        reservationsByProduct.set(res.product_id, [])
      }
      reservationsByProduct.get(res.product_id)?.push(res)
    }
  })

  // Agrupar clases por mes
  const classesByMonth: Record<string, typeof workshopClasses> = {}
  workshopClasses.forEach((cls) => {
    if (cls.month_label) {
      const date = new Date(cls.month_label)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!classesByMonth[monthKey]) {
        classesByMonth[monthKey] = []
      }
      classesByMonth[monthKey].push(cls)
    }
  })

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    pending_payment: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Taller Regular</h1>
          <p className="text-muted-foreground">Reservas del Taller de Memoria</p>
        </div>
        <div className="flex gap-2">
          <CreateWorkshopClassesDialog />
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {Object.keys(classesByMonth).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay clases creadas. Creá la primera clase usando el botón "Crear clase".
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(classesByMonth)
            .sort(([a], [b]) => a.localeCompare(b)) // Orden cronológico: enero, febrero, marzo...
            .map(([monthKey, classes]) => {
              const [year, month] = monthKey.split("-")
              const monthName = MONTH_NAMES[parseInt(month) - 1]
              return (
                <div key={monthKey} className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {monthName} {year}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes
                      .sort((a, b) => {
                        // Ordenar por fecha
                        if (!a.month_label || !b.month_label) return 0
                        return a.month_label.localeCompare(b.month_label)
                      })
                      .map((product) => {
                        const schedule = product.schedules?.[0]
                        const classDate = product.month_label ? new Date(product.month_label) : null
                        const weekday = schedule?.weekday
                        const time = schedule?.time_slot
                        const classReservations = reservationsByProduct.get(product.id) || []
                        const confirmedCount = classReservations.filter((r) => r.status === "confirmed").length
                        const totalCount = classReservations.length

                        return (
                          <Card key={product.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {classDate
                                      ? classDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                                      : "Sin fecha"}
                                  </CardTitle>
                                  <CardDescription>
                                    {weekday === 3 ? "Miércoles" : weekday === 5 ? "Viernes" : ""} {time}
                                  </CardDescription>
                                </div>
                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                  {product.is_active ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  {totalCount} reserva{totalCount !== 1 ? "s" : ""} ({confirmedCount} confirmada
                                  {confirmedCount !== 1 ? "s" : ""}) / {product.capacity} cupos
                                </p>
                                <p>${product.price.toLocaleString("es-AR")}</p>
                              </div>
                              <div className="flex justify-end pt-2">
                                <EditWorkshopClassDialog product={product} />
                              </div>
                              {classReservations.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {classReservations.map((res) => (
                                    <div key={res.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                                      <div>
                                        <p className="font-medium">{res.profiles?.name || res.guest_name || "Sin nombre"}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {res.profiles?.email || res.guest_email || ""}
                                        </p>
                                      </div>
                                      <Badge className={statusColors[res.status] || "bg-gray-100 text-gray-800"}>
                                        {res.status === "pending"
                                          ? "Pendiente"
                                          : res.status === "pending_payment"
                                            ? "Pago pendiente"
                                            : res.status === "confirmed"
                                              ? "Confirmado"
                                              : "Cancelado"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-sm text-muted-foreground py-2">No hay reservas</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
