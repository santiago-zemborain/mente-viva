import type { Metadata } from "next"
import { InterviewRequestForm } from "@/components/forms/interview-request-form"

export const metadata: Metadata = {
  title: "Agendar Entrevista",
  description: "Completá el formulario para agendar tu entrevista virtual y conocer el Taller de Memoria Mente Viva.",
}

// Esta página puede ser estática (el formulario hace fetch del lado del cliente)
export const dynamic = 'force-static'

export default function EntrevistaPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Agendar Entrevista Virtual</h1>
          <p className="text-lg text-muted-foreground">
            Completá el formulario y nos pondremos en contacto para coordinar tu entrevista. Es el primer paso para
            conocer el Taller de Memoria.
          </p>
        </div>
        <InterviewRequestForm />
      </div>
    </div>
  )
}
