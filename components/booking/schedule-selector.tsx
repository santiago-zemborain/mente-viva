"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { WORKSHOP_SCHEDULES } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

interface ScheduleSelectorProps {
  product: Product
  holidays: string[]
  closedDates: string[]
  onSelect: (schedule: { weekday: number; time: string; dates: string[] }) => void
  onBack: () => void
}

export function ScheduleSelector({ product, holidays, closedDates, onSelect, onBack }: ScheduleSelectorProps) {
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null)

  // Calculate available dates for the current month
  const getAvailableDates = (weekday: number) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const dates: string[] = []

    // Get all dates for this weekday in the current month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === weekday && d > now) {
        const dateStr = d.toISOString().split("T")[0]
        // Check if not a holiday or closed date
        if (!holidays.includes(dateStr) && !closedDates.includes(dateStr)) {
          dates.push(dateStr)
        }
      }
    }

    return dates
  }

  const scheduleOptions = WORKSHOP_SCHEDULES.map((s) => ({
    ...s,
    dates: getAvailableDates(s.weekday),
  }))

  const selectedScheduleOption = scheduleOptions.find((s) => s.weekday === selectedWeekday)

  const handleConfirm = () => {
    if (selectedScheduleOption) {
      onSelect({
        weekday: selectedScheduleOption.weekday,
        time: selectedScheduleOption.time,
        dates: product.type === "trial" ? [selectedScheduleOption.dates[0]] : selectedScheduleOption.dates,
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Elegí tu horario</h2>
        <p className="text-muted-foreground">
          {product.type === "trial"
            ? "Seleccioná el día para tu clase de prueba"
            : "Este será tu horario fijo para todo el mes"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scheduleOptions.map((schedule) => (
          <Card
            key={schedule.weekday}
            className={`cursor-pointer transition-all ${
              selectedWeekday === schedule.weekday
                ? "border-2 border-primary ring-2 ring-primary/20"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedWeekday(schedule.weekday)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{schedule.label}</CardTitle>
                {selectedWeekday === schedule.weekday && <CheckCircle className="h-6 w-6 text-primary" />}
              </div>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duración: 1h 30min
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {schedule.dates.length} {schedule.dates.length === 1 ? "fecha disponible" : "fechas disponibles"} este
                mes
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedScheduleOption && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">
              {product.type === "trial" ? "Tu clase de prueba" : "Tus clases del mes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(product.type === "trial" ? [selectedScheduleOption.dates[0]] : selectedScheduleOption.dates).map(
                (date) => (
                  <div key={date} className="flex items-center justify-between rounded-lg bg-background p-3">
                    <span className="capitalize">{formatDate(date)}</span>
                    <Badge variant="secondary">{selectedScheduleOption.time}</Badge>
                  </div>
                ),
              )}
            </div>
            {product.type === "monthly" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Total: {selectedScheduleOption.dates.length} clases x ${product.price.toLocaleString("es-AR")} = $
                {(selectedScheduleOption.dates.length * product.price).toLocaleString("es-AR")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!selectedWeekday} size="lg">
          Continuar al pago
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
