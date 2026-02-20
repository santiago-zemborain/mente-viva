import type { Metadata } from "next"
import Link from "next/link"
import { GraduationCap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Formación para Profesionales",
  description: "Capacitaciones y cursos para profesionales de la salud interesados en estimulación cognitiva.",
}

export const dynamic = "force-static"

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

      {/* Proximamente */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">Proximamente</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Estamos preparando nuevas formaciones para profesionales de la salud. Dejanos tu consulta y te avisamos
            cuando estén disponibles.
          </p>
          <Button asChild size="lg">
            <Link href="/contacto">Contactanos</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
