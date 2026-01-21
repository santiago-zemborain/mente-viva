"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { exportSpecialClassReservations } from "@/lib/actions/admin"
import { toast } from "sonner"

interface Props {
  productId: string
  productTitle: string
}

export function ExportReservationsButton({ productId, productTitle }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleExport() {
    setIsLoading(true)
    try {
      const csv = await exportSpecialClassReservations(productId)
      
      // Crear blob y descargar
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${productTitle.replace(/\s+/g, "_")}_inscriptos.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Listado exportado exitosamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al exportar el listado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 bg-transparent"
      onClick={handleExport}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar
    </Button>
  )
}

