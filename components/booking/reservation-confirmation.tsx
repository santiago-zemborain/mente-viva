"use client"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { WEEKDAY_NAMES } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Phone } from "lucide-react"

interface ReservationConfirmationProps {
  reservationId: string
  product: Product | null
  schedule: {
    weekday: number
    time: string
    dates: string[]
  } | null
}

export function ReservationConfirmation({ reservationId, product, schedule }: ReservationConfirmationProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <div>
        <h2 className="mb-2 text-3xl font-bold text-green-800">¡Reserva creada!</h2>
        <p className="text-lg text-muted-foreground">Tu reserva está pendiente de confirmación de pago.</p>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Detalles de tu reserva</CardTitle>
          <CardDescription>Código: {reservationId.slice(0, 8).toUpperCase()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{product?.type === "trial" ? "Clase de prueba" : "Clases del mes"}</p>
              <p className="text-sm text-muted-foreground">
                {schedule?.dates.length} clase(s) - {schedule && WEEKDAY_NAMES[schedule.weekday]} {schedule?.time}
              </p>
            </div>
          </div>

          {schedule && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="mb-2 text-sm font-medium">Fechas:</p>
              <div className="space-y-1">
                {schedule.dates.map((date) => (
                  <p key={date} className="text-sm capitalize text-muted-foreground">
                    {formatDate(date)}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-amber-50 p-4">
            <p className="font-medium text-amber-800">Estado: Pendiente de confirmación</p>
            <p className="text-sm text-amber-700">Te notificaremos por email y WhatsApp cuando confirmemos tu pago.</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-muted-foreground">¿Tenés dudas sobre tu reserva?</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <a href="https://wa.me/5491125790108" target="_blank" rel="noopener noreferrer">
              <Phone className="mr-2 h-4 w-4" />
              Contactar por WhatsApp
            </a>
          </Button>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
