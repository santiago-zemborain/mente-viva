import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"

export default async function HistorialPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const actionLabels: Record<string, string> = {
    interview_approve: "Entrevista aprobada",
    interview_reject: "Entrevista rechazada",
    payment_confirm: "Pago confirmado",
    payment_reject: "Pago rechazado",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial</h1>
        <p className="text-muted-foreground">Registro de acciones administrativas</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {logs && logs.length > 0 ? (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{actionLabels[log.action] || log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.entity} #{log.entity_id?.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">{formatDate(log.created_at)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No hay acciones registradas</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
