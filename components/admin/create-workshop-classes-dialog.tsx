"use client"

import { useState } from "react"
import { Plus, Loader2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createWorkshopClass } from "@/lib/actions/admin"
import { toast } from "sonner"

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

export function CreateWorkshopClassesDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [weekday, setWeekday] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [monthlyPrice, setMonthlyPrice] = useState<string>("")
  const [capacity, setCapacity] = useState<string>("13")
  const [location, setLocation] = useState<string>("")
  const [isFree, setIsFree] = useState(false)
  const [isInactive, setIsInactive] = useState(false)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Estado para el mes y año seleccionados
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth + 1).padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear))

  // Calcular fechas del mes seleccionado para el día seleccionado
  const getDatesForMonth = (targetWeekday: number, month: number, year: number): string[] => {
    const dates: string[] = []
    const lastDay = new Date(year, month + 1, 0).getDate()
    const isCurrentMonth = month === currentMonth && year === currentYear
    const today = now.getDate()

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day)
      // Si es el mes actual, solo incluir fechas futuras. Si es un mes futuro, incluir todas
      if (date.getDay() === targetWeekday) {
        if (!isCurrentMonth || day >= today) {
          dates.push(date.toISOString().split("T")[0])
        }
      }
    }

    return dates
  }

  const selectedMonthNum = parseInt(selectedMonth) - 1
  const selectedYearNum = parseInt(selectedYear)
  const monthName = MONTH_NAMES[selectedMonthNum]

  const selectedDates = weekday ? getDatesForMonth(parseInt(weekday), selectedMonthNum, selectedYearNum) : []

  // Generar opciones de años (año actual y siguientes 2 años)
  const yearOptions: number[] = []
  for (let i = 0; i <= 2; i++) {
    yearOptions.push(currentYear + i)
  }

  // Generar opciones de meses
  const monthOptions = MONTH_NAMES.map((name, index) => ({
    value: String(index + 1).padStart(2, "0"),
    label: name,
  }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!weekday || !time || !price) {
      toast.error("Por favor completá todos los campos requeridos")
      return
    }

    if (selectedDates.length === 0) {
      toast.error("No hay fechas disponibles para el día seleccionado en este mes")
      return
    }

    setIsLoading(true)

    try {
      // Crear una clase por cada fecha
      let successCount = 0
      let errorCount = 0

      for (const dateString of selectedDates) {
        try {
          const formData = new FormData()
          formData.set("class_date", dateString)
          formData.set("weekday", weekday)
          formData.set("time", time)
          formData.set("price", price)
          if (monthlyPrice) {
            formData.set("monthly_price", monthlyPrice)
          }
          formData.set("capacity", capacity || "13")
          if (location) {
            formData.set("location", location)
          }
          if (isFree) {
            formData.set("is_free", "true")
          }
          if (isInactive) {
            formData.set("is_inactive", "true")
          }

          await createWorkshopClass(formData)
          successCount++
        } catch (error) {
          console.error(`Error creating class for ${dateString}:`, error)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} clase${successCount !== 1 ? "s" : ""} creada${successCount !== 1 ? "s" : ""} exitosamente`)
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} clase${errorCount !== 1 ? "s" : ""} no se pudo${errorCount !== 1 ? "ron" : ""} crear`)
      }

      if (successCount > 0) {
        // No cerrar el diálogo automáticamente, solo resetear algunos campos
        setWeekday("")
        setTime("")
        setPrice("")
        setMonthlyPrice("")
        // Mantener mes, año, capacidad y ubicación para facilitar crear más clases
        // Refresh page
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || "Error al crear las clases")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Crear clase
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Clases de {monthName} {selectedYear}</DialogTitle>
          <DialogDescription>Crear clases del Taller de Memoria para el mes seleccionado</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">
                Mes <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">
                Año <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weekday">
                Día de la semana <span className="text-destructive">*</span>
              </Label>
              <Select value={weekday} onValueChange={setWeekday} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Miércoles</SelectItem>
                  <SelectItem value="5">Viernes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Horario <span className="text-destructive">*</span>
              </Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">
                Precio por clase suelta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="30000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_price">
                Precio por clase (pack mensual)
              </Label>
              <Input
                id="monthly_price"
                name="monthly_price"
                type="number"
                step="0.01"
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="25000 (opcional)"
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se usa el precio de clase suelta. Este precio se aplica cuando se compran todas las clases del mes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                defaultValue="13"
                placeholder="13"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Av. Presidente Manuel Quintana y Montevideo, Recoleta, CABA"
            />
          </div>

          {selectedDates.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium mb-2">
                Se crearán {selectedDates.length} clase{selectedDates.length !== 1 ? "s" : ""} para:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {selectedDates.map((date) => {
                  const d = new Date(date)
                  return (
                    <div key={date} className="text-muted-foreground">
                      {d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_free"
              checked={isFree}
              onCheckedChange={(checked) => setIsFree(checked === true)}
            />
            <Label htmlFor="is_free" className="text-sm font-normal cursor-pointer">
              Clase gratuita
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_inactive"
              checked={isInactive}
              onCheckedChange={(checked) => setIsInactive(checked === true)}
            />
            <Label htmlFor="is_inactive" className="text-sm font-normal cursor-pointer">
              Clase inactiva
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || selectedDates.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Crear {selectedDates.length} clase{selectedDates.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

