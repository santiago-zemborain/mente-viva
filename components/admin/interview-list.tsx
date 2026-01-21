"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { InterviewRequest } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Phone, Mail, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface InterviewListProps {
  interviews: InterviewRequest[]
  status: "pending" | "approved" | "rejected"
}

export function InterviewList({ interviews, status }: InterviewListProps) {
  const router = useRouter()
  const [selectedInterview, setSelectedInterview] = useState<InterviewRequest | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    if (!selectedInterview || !action) return

    setIsLoading(true)
    const supabase = createClient()

    const newStatus = action === "approve" ? "approved" : "rejected"

    const { error } = await supabase
      .from("interview_requests")
      .update({
        status: newStatus,
        admin_notes: notes || null,
      })
      .eq("id", selectedInterview.id)

    if (!error) {
      // Log action
      await supabase.from("audit_log").insert({
        action: `interview_${action}`,
        entity: "interview_requests",
        entity_id: selectedInterview.id,
        details: { notes },
      })

      router.refresh()
    }

    setIsLoading(false)
    setSelectedInterview(null)
    setAction(null)
    setNotes("")
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay entrevistas {status === "pending" ? "pendientes" : status === "approved" ? "aprobadas" : "rechazadas"}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {interviews.map((interview) => (
          <Card key={interview.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{interview.name}</CardTitle>
                  <CardDescription>Solicitada el {formatDate(interview.created_at)}</CardDescription>
                </div>
                <Badge
                  variant={status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary"}
                >
                  {status === "pending" ? "Pendiente" : status === "approved" ? "Aprobada" : "Rechazada"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${interview.email}`} className="text-primary hover:underline">
                    {interview.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://wa.me/${interview.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {interview.phone}
                  </a>
                </div>
                {interview.preferred_schedule && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Preferencia:{" "}
                      {interview.preferred_schedule === "manana"
                        ? "Mañana"
                        : interview.preferred_schedule === "tarde"
                          ? "Tarde"
                          : interview.preferred_schedule === "mediodia"
                            ? "Mediodía"
                            : "Cualquier horario"}
                    </span>
                  </div>
                )}
              </div>

              {interview.comments && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Comentarios:</p>
                  <p className="text-sm text-muted-foreground">{interview.comments}</p>
                </div>
              )}

              {interview.admin_notes && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-800">Notas del admin:</p>
                  <p className="text-sm text-blue-700">{interview.admin_notes}</p>
                </div>
              )}

              {status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedInterview(interview)
                      setAction("approve")
                    }}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInterview(interview)
                      setAction("reject")
                    }}
                    className="gap-2 bg-transparent"
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedInterview && !!action}
        onOpenChange={() => {
          setSelectedInterview(null)
          setAction(null)
          setNotes("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Aprobar entrevista" : "Rechazar entrevista"}</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Al aprobar, esta persona podrá reservar su clase de prueba."
                : "Esta persona no podrá reservar clases."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>{selectedInterview?.name}</strong> - {selectedInterview?.email}
            </p>
            <Textarea placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedInterview(null)
                setAction(null)
                setNotes("")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={isLoading}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {action === "approve" ? "Aprobar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
