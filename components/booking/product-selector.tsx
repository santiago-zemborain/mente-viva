"use client"

import type { Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

interface ProductSelectorProps {
  products: Product[]
  onSelect: (product: Product) => void
}

export function ProductSelector({ products, onSelect }: ProductSelectorProps) {
  const trialProduct = products.find((p) => p.type === "trial")
  const monthlyProduct = products.find((p) => p.type === "monthly")

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">¿Qué querés reservar?</h2>
        <p className="text-muted-foreground">Elegí la opción que mejor se adapte a vos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trial class */}
        {trialProduct && (
          <Card className="relative overflow-hidden border-2 hover:border-primary">
            <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              Recomendado
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Clase de Prueba</CardTitle>
              <CardDescription className="text-base">Conocé el taller antes de inscribirte al mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">${trialProduct.price.toLocaleString("es-AR")}</div>
              <ul className="space-y-2 text-sm">
                {[
                  "Una clase para conocer el espacio",
                  "Sin compromiso de continuidad",
                  "Aplica al mes si te inscribís",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={() => onSelect(trialProduct)} className="w-full" size="lg">
                Elegir clase de prueba
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Monthly */}
        {monthlyProduct && (
          <Card className="border-2 hover:border-primary">
            <CardHeader>
              <CardTitle className="text-xl">Clases del Mes</CardTitle>
              <CardDescription className="text-base">Inscribite a todas las clases del mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ${monthlyProduct.price.toLocaleString("es-AR")}
                <span className="text-base font-normal text-muted-foreground"> /clase</span>
              </div>
              <ul className="space-y-2 text-sm">
                {["2 clases por semana", "Horario fijo todo el mes", "Material y seguimiento incluido"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={() => onSelect(monthlyProduct)} className="w-full" size="lg" variant="outline">
                Elegir mes completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
