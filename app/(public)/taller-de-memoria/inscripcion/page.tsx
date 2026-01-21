import { RecurringRegistrationForm } from "@/components/forms/recurring-registration-form"

// Esta página puede ser estática (el formulario hace fetch del lado del cliente)
export const dynamic = 'force-static'

export default function InscripcionPage() {
  return (
    <main className="py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Inscripción al Taller de Memoria</h1>
          <p className="text-muted-foreground text-lg">
            Elegí el horario que mejor se adapte a tu disponibilidad
          </p>
        </div>

        <RecurringRegistrationForm />
      </div>
    </main>
  )
}
