import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HolidayManager } from "@/components/admin/holiday-manager"

export default async function FeriadosPage() {
  const supabase = await createClient()

  const { data: holidays } = await supabase.from("holidays").select("*").order("date", { ascending: true })

  const { data: closedDates } = await supabase.from("closed_dates").select("*").order("date", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feriados y Fechas Cerradas</h1>
        <p className="text-muted-foreground">Gestionar días sin clases</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feriados</CardTitle>
            <CardDescription>Feriados nacionales (se excluyen automáticamente)</CardDescription>
          </CardHeader>
          <CardContent>
            <HolidayManager type="holiday" items={holidays || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas cerradas</CardTitle>
            <CardDescription>Días específicos sin clases (vacaciones, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <HolidayManager type="closed" items={closedDates || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
