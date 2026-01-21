"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { CreditCard, Building2, CheckCircle, XCircle, Loader2, ExternalLink, ImageIcon } from "lucide-react"

interface PaymentWithRelations {
  id: string
  method: "mp_link" | "transfer"
  status: string
  payment_type: string
  amount: number | null
  receipt_url: string | null
  admin_notes: string | null
  created_at: string
  confirmed_at: string | null
  reservations: {
    id: string
    guest_name: string | null
    guest_email: string | null
    profiles: {
      name: string | null
      email: string | null
      phone: string | null
    } | null
    products: {
      title: string
      type: string
    } | null
  } | null
  reservationsCount?: number
  allReservations?: Array<{
    id: string
    guest_name: string | null
    guest_email: string | null
    profiles: {
      name: string | null
      email: string | null
      phone: string | null
    } | null
    products: {
      title: string
      type: string
    } | null
  }>
}

interface PaymentListProps {
  payments: PaymentWithRelations[]
  status: "pending" | "confirmed" | "rejected"
}

export function PaymentList({ payments, status }: PaymentListProps) {
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithRelations | null>(null)
  const [action, setAction] = useState<"confirm" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    if (!selectedPayment || !action) return

    setIsLoading(true)
    const supabase = createClient()

    const newStatus = action === "confirm" ? "confirmed" : "rejected"

    const { error } = await supabase
      .from("payments")
      .update({
        status: newStatus,
        admin_notes: notes || null,
        confirmed_at: action === "confirm" ? new Date().toISOString() : null,
      })
      .eq("id", selectedPayment.id)

    if (!error) {
      // If confirmed, also update all associated reservations
      if (action === "confirm") {
        // Actualizar todas las reservas asociadas por payment_id (nuevo método)
        await supabase.from("reservations").update({ status: "confirmed" }).eq("payment_id", selectedPayment.id)
        
        // También actualizar por reservation_id si existe (método antiguo)
        if (selectedPayment.reservations?.id) {
          await supabase.from("reservations").update({ status: "confirmed" }).eq("id", selectedPayment.reservations.id)
        }
      }

      // Log action
      await supabase.from("audit_log").insert({
        action: `payment_${action}`,
        entity: "payments",
        entity_id: selectedPayment.id,
        details: { notes, amount: selectedPayment.amount },
      })

      router.refresh()
    }

    setIsLoading(false)
    setSelectedPayment(null)
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

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay pagos {status === "pending" ? "pendientes" : status === "confirmed" ? "confirmados" : "rechazados"}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {payments.map((payment) => {
          const userName = payment.reservations?.profiles?.name || payment.reservations?.guest_name || "Sin nombre"
          const userEmail = payment.reservations?.profiles?.email || payment.reservations?.guest_email || "Sin email"

          return (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      ${payment.amount?.toLocaleString("es-AR") || "N/A"}
                      {payment.method === "mp_link" ? (
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Building2 className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {payment.method === "mp_link" ? "MercadoPago" : "Transferencia"} -{" "}
                      {formatDate(payment.created_at)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={status === "confirmed" ? "default" : status === "rejected" ? "destructive" : "secondary"}
                  >
                    {status === "pending" ? "Pendiente" : status === "confirmed" ? "Confirmado" : "Rechazado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  {payment.reservationsCount && payment.reservationsCount > 1 && (
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {payment.reservationsCount} reservas asociadas
                    </p>
                  )}
                  
                  {/* Mostrar productos asociados */}
                  {payment.allReservations && payment.allReservations.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {payment.allReservations.map((reservation, idx) => (
                        <div key={reservation.id || idx} className="text-sm">
                          {reservation.products ? (
                            <span className="font-medium">{reservation.products.title}</span>
                          ) : (
                            <span className="text-muted-foreground">Sin producto asignado</span>
                          )}
                          {reservation.selected_date && (
                            <span className="ml-2 text-muted-foreground">
                              ({new Date(reservation.selected_date).toLocaleDateString("es-AR")})
                            </span>
                          )}
                        </div>
                      ))}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {payment.payment_type === "deposit"
                          ? "Seña"
                          : payment.payment_type === "balance"
                            ? "Saldo"
                            : "Pago completo"}
                      </p>
                    </div>
                  ) : payment.reservations?.products ? (
                    <p className="mt-1 text-sm">
                      {payment.reservations.products.title} (
                      {payment.payment_type === "deposit"
                        ? "Seña"
                        : payment.payment_type === "balance"
                          ? "Saldo"
                          : "Pago completo"}
                      )
                    </p>
                  ) : null}
                </div>

                {payment.receipt_url && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Ver comprobante
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  </div>
                )}

                {payment.admin_notes && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm font-medium text-blue-800">Notas:</p>
                    <p className="text-sm text-blue-700">{payment.admin_notes}</p>
                  </div>
                )}

                {status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedPayment(payment)
                        setAction("confirm")
                      }}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirmar pago
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedPayment(payment)
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
          )
        })}
      </div>

      <Dialog
        open={!!selectedPayment && !!action}
        onOpenChange={() => {
          setSelectedPayment(null)
          setAction(null)
          setNotes("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "confirm" ? "Confirmar pago" : "Rechazar pago"}</DialogTitle>
            <DialogDescription>
              {action === "confirm"
                ? "Al confirmar, la reserva quedará activa."
                : "El pago será marcado como rechazado."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>${selectedPayment?.amount?.toLocaleString("es-AR")}</strong> -{" "}
              {selectedPayment?.method === "mp_link" ? "MercadoPago" : "Transferencia"}
            </p>
            <Textarea placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPayment(null)
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
              {action === "confirm" ? "Confirmar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
