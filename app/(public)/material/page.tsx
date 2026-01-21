import type { Metadata } from "next"
import { Download, FileText, BookOpen, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Material Descargable",
  description: "Recursos gratuitos sobre salud cognitiva: guías, ejercicios y material informativo.",
}

// This would come from Supabase/Storage
const materials = [
  {
    id: "1",
    title: "Guía de ejercicios cognitivos para el hogar",
    description: "10 ejercicios simples para estimular la memoria y la atención desde casa.",
    type: "PDF",
    size: "2.3 MB",
    icon: <Brain className="h-6 w-6" />,
  },
  {
    id: "2",
    title: "Consejos para una buena higiene del sueño",
    description: "Recomendaciones para mejorar la calidad del sueño y su impacto en la memoria.",
    type: "PDF",
    size: "1.1 MB",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    id: "3",
    title: "Recetario cognitivo",
    description: "Recetas nutritivas que favorecen la salud cerebral.",
    type: "PDF",
    size: "3.5 MB",
    icon: <BookOpen className="h-6 w-6" />,
  },
]

// Configurar como estática
export const dynamic = 'force-static'

export default function MaterialPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Material Descargable</h1>
          <p className="text-xl text-muted-foreground">
            Recursos gratuitos para que puedas seguir cuidando tu salud cognitiva desde casa.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {material.icon}
                </div>
                <CardTitle className="text-xl">{material.title}</CardTitle>
                <CardDescription className="text-base">{material.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{material.type}</span>
                  <span>{material.size}</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-muted/50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">¿Querés más recursos?</h2>
          <p className="mb-6 text-muted-foreground">
            Próximamente vamos a lanzar nuestro canal de YouTube con contenido gratuito sobre salud cognitiva.
          </p>
          <Button variant="outline" disabled>
            YouTube - Próximamente
          </Button>
        </div>
      </div>
    </div>
  )
}
