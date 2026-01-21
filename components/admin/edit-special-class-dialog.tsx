"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateSpecialClass } from "@/lib/actions/admin"
import { toast } from "sonner"
import type { Product } from "@/lib/types"

interface Props {
  product: Product
}

export function EditSpecialClassDialog({ product }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modality, setModality] = useState<string>(product.modality || "")
  const [requiresDeposit, setRequiresDeposit] = useState(product.requires_deposit || false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setModality(product.modality || "")
      setRequiresDeposit(product.requires_deposit || false)
    }
  }, [open, product.modality, product.requires_deposit])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("id", product.id)
      // Only add modality if it has a value
      if (modality && modality.trim() !== "") {
        formData.set("modality", modality)
      }
      await updateSpecialClass(formData)
      toast.success("Clase especial actualizada exitosamente")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la clase especial")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          setModality(product.modality || "")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Clase Especial</DialogTitle>
          <DialogDescription>
            Modifica los datos de la clase especial. Completa los campos requeridos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={product.title}
                placeholder="Ej: Mindfulness y Relajación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month_label">Mes</Label>
              <Input
                id="month_label"
                name="month_label"
                defaultValue={product.month_label || ""}
                placeholder="Ej: Enero 2025"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descripción corta</Label>
            <Input
              id="short_description"
              name="short_description"
              defaultValue={product.short_description || ""}
              placeholder="Breve descripción que aparecerá en las tarjetas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción completa</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description || ""}
              placeholder="Descripción detallada de la clase especial"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">
                Precio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={product.price}
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                defaultValue={product.capacity}
                placeholder="13"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración (minutos)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="1"
                defaultValue={product.duration_minutes}
                placeholder="90"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                defaultValue={product.location || ""}
                placeholder="Av. Presidente Manuel Quintana y Montevideo, Recoleta, CABA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modality">Modalidad</Label>
              <Select value={modality || undefined} onValueChange={setModality}>
                <SelectTrigger id="modality">
                  <SelectValue placeholder="Seleccionar modalidad (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instructor_name">Nombre del instructor</Label>
              <Input
                id="instructor_name"
                name="instructor_name"
                defaultValue={product.instructor_name || ""}
                placeholder="Nombre del profesional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor_bio">Bio del instructor</Label>
              <Textarea
                id="instructor_bio"
                name="instructor_bio"
                rows={2}
                defaultValue={product.instructor_bio || ""}
                placeholder="Breve biografía del instructor"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_inactive"
                name="is_inactive"
                value="true"
                defaultChecked={!product.is_active}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_inactive" className="font-normal">
                Clase inactiva
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_free"
                name="is_free"
                value="true"
                defaultChecked={product.is_free}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_free" className="font-normal">
                Clase gratuita
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requires_deposit"
                name="requires_deposit"
                value="true"
                checked={requiresDeposit}
                onChange={(e) => setRequiresDeposit(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="requires_deposit" className="font-normal">
                Requiere seña
              </Label>
            </div>
          </div>

          {requiresDeposit && (
            <div className="space-y-2">
              <Label htmlFor="deposit_percent">Porcentaje de seña</Label>
              <Input
                id="deposit_percent"
                name="deposit_percent"
                type="number"
                min="1"
                max="100"
                defaultValue={product.deposit_percent}
                placeholder="50"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

