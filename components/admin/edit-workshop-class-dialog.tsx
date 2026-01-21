"use client"

import { useState } from "react"
import { Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { updateWorkshopClass } from "@/lib/actions/admin"
import { toast } from "sonner"

interface Product {
  id: string
  title: string
  price: number
  monthly_price?: number | null
  capacity: number
  location: string | null
  is_active: boolean
  is_free: boolean
  month_label: string | null
  schedules?: Array<{
    weekday: number | null
    time_slot: string | null
    specific_date: string | null
  }>
}

export function EditWorkshopClassDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const schedule = product.schedules?.[0]
  const classDate = product.month_label || ""
  const weekday = schedule?.weekday?.toString() || ""
  const time = schedule?.time_slot || ""

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("id", product.id)
      await updateWorkshopClass(formData)
      toast.success("Clase actualizada exitosamente")
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la clase")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Edit className="h-4 w-4" />
        Editar
      </Button>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Clase del Taller</DialogTitle>
          <DialogDescription>Modificar los datos de la clase</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class_date">
                Fecha de la clase <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class_date"
                name="class_date"
                type="date"
                required
                defaultValue={classDate}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekday">
                Día de la semana <span className="text-destructive">*</span>
              </Label>
              <Select name="weekday" defaultValue={weekday} required>
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
              <Select name="time" defaultValue={time} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                defaultValue={product.price}
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
                defaultValue={product.monthly_price || ""}
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
                defaultValue={product.capacity}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                defaultValue={product.location || ""}
                placeholder="Av. Presidente Manuel Quintana y Montevideo, Recoleta, CABA"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_free" name="is_free" value="true" defaultChecked={product.is_free} />
            <Label htmlFor="is_free" className="text-sm font-normal cursor-pointer">
              Clase gratuita
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_inactive" name="is_inactive" value="true" defaultChecked={!product.is_active} />
            <Label htmlFor="is_inactive" className="text-sm font-normal cursor-pointer">
              Clase inactiva
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

