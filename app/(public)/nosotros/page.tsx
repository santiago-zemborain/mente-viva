import type { Metadata } from "next"
import Image from "next/image"
import { Heart, Brain, Users, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Conocé la historia y el equipo detrás de Mente Viva, espacio de salud cognitiva.",
}

const values = [
  {
    icon: <Heart className="h-7 w-7" />,
    title: "Calidez",
    description: "Creamos un ambiente contenedor donde cada persona se siente bienvenida y valorada.",
  },
  {
    icon: <Brain className="h-7 w-7" />,
    title: "Profesionalismo",
    description: "Basamos nuestro trabajo en evidencia científica y formación continua.",
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: "Comunidad",
    description: "Fomentamos los vínculos y el acompañamiento entre los participantes.",
  },
  {
    icon: <Target className="h-7 w-7" />,
    title: "Personalización",
    description: "Adaptamos nuestras propuestas a las necesidades de cada persona.",
  },
]

// Configurar como estática
export const dynamic = 'force-static'

export default function NosotrosPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Sobre Mente Viva</h1>
              <p className="text-xl leading-relaxed text-muted-foreground">
                Somos un espacio dedicado a la <strong className="text-foreground">salud cognitiva</strong> con enfoque
                en Terapia Ocupacional. Creemos en el poder de la estimulación cognitiva y el acompañamiento profesional
                para mejorar la calidad de vida.
              </p>
              <p className="text-lg text-muted-foreground">
                Nuestro objetivo es promover el bienestar integral de las personas, integrando cuerpo, mente y entorno
                en cada una de nuestras propuestas.
              </p>
            </div>
            <div className="relative flex justify-center">
              <div className="relative h-64 w-64 sm:h-80 sm:w-80">
                <Image
                  src="/images/logo.png"
                  alt="Mente Viva"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Nuestros valores</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {value.icon}
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Nuestra misión</h2>
          <p className="text-xl leading-relaxed text-muted-foreground">
            Acompañar a las personas en su camino hacia una mejor salud cognitiva, brindando herramientas prácticas,
            conocimiento científico y un espacio de contención donde cada uno pueda desarrollar su potencial.
          </p>
        </div>
      </section>
    </div>
  )
}
