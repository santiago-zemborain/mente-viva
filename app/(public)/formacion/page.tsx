import type { Metadata } from "next"
import Link from "next/link"
import { GraduationCap, Calendar, Clock, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Formación para Profesionales",
  description: "Capacitaciones y cursos para profesionales de la salud interesados en estimulación cognitiva.",
}

// This would come from Supabase
const trainings = [
  {
    id: "1",
    title: "Introducción a la Estimulación Cognitiva",
    description:
      "Curso introductorio para profesionales de la salud que desean incorporar técnicas de estimulación cognitiva en su práctica.",
    target_audience: "Terapistas ocupacionales, psicólogos, médicos, enfermeros",
    modality: "presencial",
    dates: "8, 15 y 22 de Marzo 2025",
    duration: "12 horas totales",
    price: 85000,
    instructor: "Equipo Mente Viva",
    capacity: 20,
    spots_left: 14,
  },
  {
    id: "2",
    title: "Taller de Memoria: Metodología y Práctica",
    description:
      "Formación intensiva sobre la metodología del Taller de Memoria Mente Viva. Aprenderás a diseñar y facilitar sesiones grupales.",
    target_audience: "Terapistas ocupacionales y profesionales afines",
    modality: "hibrido",
    dates: "Abril 2025 (fechas a confirmar)",
    duration: "24 horas totales",
    price: 150000,
    instructor: "Equipo Mente Viva",
    capacity: 15,
    spots_left: 0,
    waitlist: true,
  },
]

const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Híbrido",
}

// Configurar como estática
export const dynamic = 'force-static'

export default function FormacionPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <GraduationCap className="h-5 w-5" />
            Para profesionales de la salud
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">Formación Profesional</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Capacitaciones y cursos diseñados para profesionales de la salud que desean especializarse en estimulación
            cognitiva y terapia ocupacional.
          </p>
        </div>
      </section>

      {/* Trainings list */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-bold">Próximas formaciones</h2>
          <div className="space-y-6">
            {trainings.map((training) => (
              <Card key={training.id} className="overflow-hidden">
                <CardHeader>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{modalityLabels[training.modality]}</Badge>
                    {training.waitlist && <Badge variant="outline">Lista de espera</Badge>}
                  </div>
                  <CardTitle className="text-2xl">{training.title}</CardTitle>
                  <CardDescription className="text-base">{training.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Dirigido a:</p>
                    <p>{training.target_audience}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fechas</p>
                        <p className="font-medium">{training.dates}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duración</p>
                        <p className="font-medium">{training.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cupo</p>
                        <p className="font-medium">
                          {training.spots_left > 0 ? `${training.spots_left} lugares disponibles` : "Cupo completo"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Docente</p>
                        <p className="font-medium">{training.instructor}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">${training.price.toLocaleString("es-AR")}</p>
                    </div>
                    <Button asChild disabled={training.waitlist}>
                      <Link href={training.waitlist ? "#" : `/formacion/${training.id}`}>
                        {training.waitlist ? "Anotarme en lista de espera" : "Inscribirme"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-primary px-4 py-16 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">¿Tenés una propuesta de formación?</h2>
          <p className="mb-8 text-xl opacity-90">
            Si sos profesional y querés dictar un curso o taller en Mente Viva, nos encantaría conocer tu propuesta.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link href="/contacto">Contactanos</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
