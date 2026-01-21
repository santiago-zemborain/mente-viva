import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Clock, MapPin, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Clases Especiales",
  description: "Clases temáticas mensuales con profesionales especializados en salud cognitiva.",
}

// Placeholder classes for when there are no active classes
const placeholderClasses = [
  {
    id: "1",
    month_label: "Febrero 2025",
    title: "Memoria y Emociones",
    description:
      "Exploramos la conexión entre nuestras emociones y la memoria. ¿Cómo influyen los estados emocionales en lo que recordamos?",
    date: "15 de Febrero, 2025",
    time: "10:00",
    duration: "1h 30min",
    instructor: "Lic. María González",
    instructor_bio: "Terapista Ocupacional especializada en neuropsicología",
    price: 30000,
    deposit_percent: 50,
    location: "Buenos Aires, Argentina",
    capacity: 15,
    spots_left: 8,
  },
  {
    id: "2",
    month_label: "Marzo 2025",
    title: "Atención Plena y Concentración",
    description: "Técnicas de mindfulness aplicadas a la mejora de la atención y concentración en la vida diaria.",
    date: "22 de Marzo, 2025",
    time: "10:00",
    duration: "1h 30min",
    instructor: "Lic. Carlos Pérez",
    instructor_bio: "Psicólogo cognitivo con formación en mindfulness",
    price: 30000,
    deposit_percent: 50,
    location: "Buenos Aires, Argentina",
    capacity: 15,
    spots_left: 12,
  },
]

// Configurar como estática con ISR (se regenera cada hora)
export const revalidate = 3600 // 1 hora

export default async function ClasesEspecialesPage() {
  const supabase = await createClient()

  // Get active special classes from database
  const { data: activeClasses } = await supabase
    .from("products")
    .select("*, reservations(count)")
    .eq("type", "special")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const hasActiveClasses = activeClasses && activeClasses.length > 0
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Calendar className="h-5 w-5" />
            Clases temáticas mensuales
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">Clases Especiales Mente Viva</h1>
          <div className="mx-auto max-w-3xl space-y-4 text-left text-lg text-muted-foreground">
            <p>
              Las Clases Especiales de Mente Viva son encuentros únicos e irrepetibles, que se dictan la última semana
              de cada mes y siempre abordan temáticas diferentes. Están pensadas como una experiencia puntual,
              inspiradora y práctica: el objetivo es mejorar la calidad de vida a través de una herramienta concreta,
              una práctica de bienestar o el aprendizaje de algo nuevo que puedas llevarte a tu día a día.
            </p>
            <p>
              Cada clase propone un enfoque distinto (según el tema y el profesional invitado/a), por eso funcionan como
              "ediciones especiales": no requieren continuidad previa y podés sumarte de forma independiente, según el
              interés que te despierte cada propuesta.
            </p>
            <p>Para acompañarte con claridad, en cada anuncio se informará:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>El tema</li>
              <li>Quién la dicta</li>
              <li>La duración de la clase</li>
              <li>Día y horario</li>
            </ul>
            <p className="italic text-foreground/80">
              Las Clases Especiales son una invitación a regalarte un espacio de cuidado, curiosidad y crecimiento,
              guiadas por profesionales idóneos y alineadas con la esencia de Mente Viva: bienestar, aprendizaje y una
              vida más plena.
            </p>
          </div>
        </div>
      </section>

      {/* Classes list */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-2xl font-bold">Próximas clases</h2>
          {hasActiveClasses ? (
            <p className="mb-8 text-muted-foreground">Clases especiales disponibles para inscripción.</p>
          ) : (
            <p className="mb-8 text-muted-foreground">Próximamente estaremos anunciando las clases disponibles.</p>
          )}
          <div className="space-y-6">
            {hasActiveClasses
              ? activeClasses.map((clase) => {
                  const reservationsCount = Array.isArray(clase.reservations)
                    ? clase.reservations[0]?.count || 0
                    : clase.reservations?.count || 0
                  const spotsLeft = clase.capacity - reservationsCount
                  const durationText = clase.duration_minutes
                    ? `${Math.floor(clase.duration_minutes / 60)}h ${clase.duration_minutes % 60}min`
                    : "1h 30min"

                  return (
                    <Card key={clase.id} className="overflow-hidden">
                      <div className="grid md:grid-cols-3">
                        <CardHeader className="bg-primary/5 md:col-span-1">
                          <div className="mb-2 text-sm font-medium text-primary">
                            {clase.month_label || "Clase Especial"}
                          </div>
                          <CardTitle className="text-2xl">{clase.title}</CardTitle>
                          <CardDescription className="text-base">
                            {clase.short_description || clase.description || "Clase especial de Mente Viva"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between p-6 md:col-span-2">
                          <div className="mb-6 grid gap-4 sm:grid-cols-2">
                            {clase.location && (
                              <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span>{clase.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-primary" />
                              <span>{durationText}</span>
                            </div>
                            {clase.instructor_name && (
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-primary" />
                                <span>{clase.instructor_name}</span>
                              </div>
                            )}
                            {clase.modality && (
                              <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="capitalize">{clase.modality}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
                            <div>
                              <p className="text-2xl font-bold text-primary">
                                {clase.is_free ? "Gratis" : `$${Number(clase.price).toLocaleString("es-AR")}`}
                              </p>
                              {!clase.is_free && clase.requires_deposit && (
                                <p className="text-sm text-muted-foreground">
                                  Seña mínima: {clase.deposit_percent}% ($
                                  {((Number(clase.price) * clase.deposit_percent) / 100).toLocaleString("es-AR")})
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">
                                {spotsLeft > 0 ? `${spotsLeft} lugares disponibles` : "Sin cupos disponibles"}
                              </span>
                              <Button asChild disabled={spotsLeft <= 0}>
                                <Link href={spotsLeft > 0 ? `/clases-especiales/${clase.id}/inscripcion` : "#"}>
                                  Reservar
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  )
                })
              : placeholderClasses.map((clase) => (
                  <Card key={clase.id} className="overflow-hidden blur-sm pointer-events-none select-none opacity-60">
                    <div className="grid md:grid-cols-3">
                      <CardHeader className="bg-primary/5 md:col-span-1">
                        <div className="mb-2 text-sm font-medium text-primary">{clase.month_label}</div>
                        <CardTitle className="text-2xl">{clase.title}</CardTitle>
                        <CardDescription className="text-base">{clase.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col justify-between p-6 md:col-span-2">
                        <div className="mb-6 grid gap-4 sm:grid-cols-2">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span>{clase.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <span>
                              {clase.time} ({clase.duration})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>{clase.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <span>{clase.instructor}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-2xl font-bold text-primary">${clase.price.toLocaleString("es-AR")}</p>
                            <p className="text-sm text-muted-foreground">
                              Seña mínima: {clase.deposit_percent}% ($
                              {((clase.price * clase.deposit_percent) / 100).toLocaleString("es-AR")})
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{clase.spots_left} lugares disponibles</span>
                            <Button asChild disabled>
                              <Link href={`/clases-especiales/${clase.id}`}>
                                Ver más
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Info section */}
      <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold">¿Cómo funcionan las clases especiales?</h2>
          <div className="space-y-4 text-left text-lg text-muted-foreground">
            <p>
              <strong className="text-foreground">Reserva:</strong> Podés abonar el 50% del valor para asegurar tu lugar
              y pagar el 50% restante hasta 1 día antes de la clase, o directamente abonar el 100% en el momento de la
              inscripción.
            </p>
            <p>
              <strong className="text-foreground">Sin requisitos previos:</strong> No necesitás entrevista previa ni
              experiencia anterior para inscribirte.
            </p>
            <p>
              <strong className="text-foreground">Cupos limitados:</strong> Trabajamos con grupos reducidos para
              garantizar una experiencia de calidad.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
