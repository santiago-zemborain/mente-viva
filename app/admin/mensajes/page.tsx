import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Phone, Calendar } from "lucide-react"

export default async function MensajesPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  const subjectLabels: Record<string, string> = {
    taller: "Taller de Memoria",
    clases: "Clases Especiales",
    formacion: "Formación Profesional",
    eventos: "Eventos y Charlas",
    otro: "Otro",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mensajes de Contacto</h1>
        <p className="text-muted-foreground">Consultas recibidas a través del formulario de contacto</p>
      </div>

      {messages && messages.length > 0 ? (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id} className={message.is_read ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {message.email}
                      </span>
                      {message.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {message.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.subject && (
                      <Badge variant="outline">{subjectLabels[message.subject] || message.subject}</Badge>
                    )}
                    {!message.is_read && <Badge className="bg-primary">Nuevo</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{message.message}</p>
                <p className="text-sm text-muted-foreground mt-4 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(message.created_at).toLocaleDateString("es-AR", {
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay mensajes de contacto</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
