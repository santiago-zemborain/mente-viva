import type { Metadata } from "next"
import Link from "next/link"
import { Users, Calendar, Clock, MapPin, Video, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Eventos y Charlas",
  description: "Encuentros abiertos al público sobre salud cognitiva, bienestar y calidad de vida.",
}

// This would come from Supabase
const upcomingEvents = [
  {
    id: "1",
    title: "Apego y Patrones Vinculares a la Vida Adulta",
    description:
      "Un encuentro para explorar cómo los patrones de apego que construimos a lo largo de la vida influyen en nuestras relaciones, decisiones y bienestar emocional. A cargo de la Lic. Lamberti.",
    date: "Sábado 4 de Abril, 2026",
    time: "16:00 a 18:00 hs",
    duration: "2 horas",
    location: "Recoleta, Buenos Aires, Argentina",
    is_virtual: false,
    is_free: false,
    price: 55000,
    capacity: 15,
    spots_left: 15,
    cta: "Consultar disponibilidad",
  },
  {
    id: "2",
    title: "Encuentro de Arteterapia con Maru Martin",
    subtitle: "MENTE VIVA te invita",
    description:
      "Memoria de los sentidos: una experiencia de arte y bienestar cognitivo. Un encuentro de Arteterapia donde los sentidos serán la puerta de entrada a la memoria. A través de colores, texturas, aromas, objetos y diferentes materiales artísticos, exploraremos cómo las experiencias sensoriales activan recuerdos, emociones y asociaciones. No necesitás saber dibujar: venís a crear y disfrutar.",
    long_description:
      "La creación artística estimula funciones cognitivas como la atención, la flexibilidad y la memoria, al mismo tiempo que favorece la conexión emocional y la integración personal. Un espacio para descubrir cómo el arte puede convertirse en una herramienta concreta para tu vida cotidiana.",
    facilitator: "Lic. en Bellas Artes y en Arteterapia",
    date: "Sábado 14 de Marzo, 2026",
    time: "15:00 hs",
    duration: "2 horas",
    location: "Palacio Balcarce, Recoleta",
    is_virtual: false,
    is_free: false,
    price: 60000,
    capacity: 0,
    spots_left: 0,
    limited_spots: true,
    cta: "Consultar disponibilidad",
  },
]

const pastEvents = [
  {
    id: "3",
    title: "Charla: La importancia del sueño en la memoria",
    date: "15 de Diciembre, 2024",
    location: "Virtual",
    attendees: 85,
  },
]

// Configurar como estática
export const dynamic = 'force-static'

export default function EventosPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Users className="h-5 w-5" />
            Abiertos al público
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">Eventos y Charlas</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Encuentros presenciales y virtuales sobre salud cognitiva, bienestar y calidad de vida. Algunos son
            gratuitos, otros de pago.
          </p>
        </div>
      </section>

      {/* Events list */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2">
              <TabsTrigger value="upcoming" className="text-base">
                Próximos eventos
              </TabsTrigger>
              <TabsTrigger value="past" className="text-base">
                Eventos pasados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {event.is_virtual ? (
                        <Badge variant="secondary">
                          <Video className="mr-1 h-3 w-3" />
                          Virtual
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <MapPin className="mr-1 h-3 w-3" />
                          Presencial
                        </Badge>
                      )}
                      {event.is_free && <Badge className="bg-green-100 text-green-800">Gratuito</Badge>}
                      {"limited_spots" in event && event.limited_spots && (
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                          Cupos limitados
                        </Badge>
                      )}
                    </div>
                    {"subtitle" in event && event.subtitle && (
                      <p className="text-sm font-medium uppercase tracking-wide text-primary">{event.subtitle}</p>
                    )}
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                    {"facilitator" in event && event.facilitator && (
                      <p className="text-sm text-muted-foreground">({event.facilitator})</p>
                    )}
                    <CardDescription className="text-base">{event.description}</CardDescription>
                    {"long_description" in event && event.long_description && (
                      <p className="mt-2 text-sm text-muted-foreground">{event.long_description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 shrink-0 text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-primary" />
                        <span>
                          {event.time} ({event.duration})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {event.is_virtual ? (
                          <Video className="h-5 w-5 shrink-0 text-primary" />
                        ) : (
                          <MapPin className="h-5 w-5 shrink-0 text-primary" />
                        )}
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 shrink-0 text-primary" />
                        <span>
                          {event.spots_left > 0
                            ? `${event.spots_left} lugares disponibles`
                            : "Cupos limitados"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
                      <div>
                        {event.is_free ? (
                          <p className="text-xl font-bold text-green-600">Entrada libre</p>
                        ) : (
                          <p className="text-2xl font-bold text-primary">${event.price.toLocaleString("es-AR")}</p>
                        )}
                      </div>
                      <Button asChild>
                        <a
                          href={`https://wa.me/541125790108?text=${encodeURIComponent(`Hola, me interesa el evento ${event.title}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {"cta" in event && event.cta ? event.cta : event.is_free ? "Inscribirme gratis" : "Inscribirme"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="opacity-75">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">
                      Finalizado
                    </Badge>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription>
                      {event.date} - {event.location} - {event.attendees} asistentes
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
