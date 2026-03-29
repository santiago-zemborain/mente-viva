import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Brain,
  Clock,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  ArrowRight,
  Coffee,
  BookOpen,
  HeartHandshake,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StepIndicator } from "@/components/ui/step-indicator"

export const metadata: Metadata = {
  title: "Taller de Memoria",
  description:
    "Estimulación cognitiva grupal con enfoque en Terapia Ocupacional. Trabajamos memoria, atención, lenguaje y funciones ejecutivas.",
}

const steps = [
  { number: 1, title: "Pedí tu entrevista", description: "Completá el formulario online" },
  { number: 2, title: "Entrevista virtual", description: "Te contactamos para conocerte" },
  { number: 3, title: "Clase de prueba", description: "Probá el taller sin compromiso" },
  { number: 4, title: "¡Inscribite!", description: "Elegí tu horario y reservá" },
]

const includes = [
  {
    icon: <Coffee className="h-6 w-6" />,
    title: "Infusiones y snack",
    description: "Té, café y algo rico para compartir",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Material de trabajo",
    description: "Todo lo necesario para las actividades",
  },
  {
    icon: <HeartHandshake className="h-6 w-6" />,
    title: "Seguimiento personalizado",
    description: "Acompañamiento si lo necesitás",
  },
  { icon: <Users className="h-6 w-6" />, title: "Grupos reducidos", description: "Máximo 13 personas por grupo" },
  {
    icon: <Home className="h-6 w-6" />,
    title: "Material para el hogar",
    description: "Para continuar trabajando la memoria en casa",
  },
]

// Configurar como estática con ISR (se regenera cada hora)
export const revalidate = 3600 // 1 hora

export default async function TallerDeMemoriaPage() {
  const supabase = await createClient()

  // Obtener precio del producto monthly
  const { data: monthlyProduct } = await supabase
    .from("products")
    .select("price")
    .eq("type", "monthly")
    .eq("is_active", true)
    .single()

  const price = monthlyProduct?.price ? Number(monthlyProduct.price) : 25000

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                Nuestro taller principal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Taller de Memoria Mente Viva</h1>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                Un espacio de <strong className="text-foreground">estimulación cognitiva grupal</strong> con enfoque en
                Terapia Ocupacional. Trabajamos la memoria, atención, lenguaje y funciones ejecutivas en un ambiente
                cálido y contenedor.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-card p-3 sm:gap-3 sm:p-4">
                  <Clock className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                  <div>
                    <p className="text-sm font-semibold sm:text-base">Duración</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">1 hora 30 minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-card p-3 sm:gap-3 sm:p-4">
                  <MapPin className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                  <div>
                    <p className="text-sm font-semibold sm:text-base">Ubicación</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">Buenos Aires, Argentina</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-card p-3 sm:gap-3 sm:p-4">
                  <Calendar className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                  <div>
                    <p className="text-sm font-semibold sm:text-base">Horarios</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">Mié 11:00 / Vie 16:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-card p-3 sm:gap-3 sm:p-4">
                  <Users className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                  <div>
                    <p className="text-sm font-semibold sm:text-base">Cupo</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">Máximo 13 personas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-card p-6 shadow-lg sm:p-8">
              <div className="mb-4 text-center sm:mb-6">
                <p className="mb-2 text-base text-muted-foreground sm:text-lg">Valor por clase</p>
                <p className="text-4xl font-bold text-primary sm:text-5xl">
                  ${price.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
                <h3 className="text-base font-semibold sm:text-lg">El taller incluye:</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    "Infusiones y algo para comer",
                    "Material de trabajo",
                    "Seguimiento personalizado",
                    "Grupos reducidos de hasta 13 personas",
                    "Material para continuar trabajando la memoria en el hogar",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild size="lg" className="w-full text-base sm:text-lg">
                  <Link href="/taller-de-memoria/entrevista">
                    Soy nuevo/a: Agendar Entrevista
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full text-base bg-transparent sm:text-lg">
                  <Link href="/taller-de-memoria/inscripcion">
                    Ya asistí: Reservar mi lugar
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-card px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">¿Cómo funciona?</h2>
            <p className="text-base text-muted-foreground sm:text-lg">Si sos nuevo/a, seguí estos pasos para sumarte al taller</p>
          </div>
          <StepIndicator steps={steps} currentStep={1} />
          <div className="mt-8 rounded-xl bg-amber-50 p-4 text-center sm:mt-12 sm:p-6">
            <p className="text-sm sm:text-base lg:text-lg">
              <strong className="text-amber-800">Importante:</strong>{" "}
              <span className="text-amber-700">
                Los nuevos participantes deben completar una entrevista virtual antes de poder reservar su clase de
                prueba. Esto nos permite conocerte y asegurarnos de que el taller sea el espacio adecuado para vos.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">¿Qué incluye cada clase?</h2>
            <p className="text-base text-muted-foreground sm:text-lg">Todo lo que necesitás para disfrutar del taller</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {includes.map((item) => (
              <Card key={item.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mb-4 sm:h-14 sm:w-14">
                    {item.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule info */}
      <section className="bg-muted/50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">Horarios disponibles</h2>
            <p className="text-base text-muted-foreground sm:text-lg">Elegí el horario que mejor se adapte a tu rutina</p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">Miércoles 11:00</CardTitle>
                <CardDescription className="text-sm sm:text-base">Turno mañana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-center sm:space-y-4">
                <p className="text-sm text-muted-foreground sm:text-base">
                  Ideal para quienes prefieren arrancar el día con actividad cognitiva
                </p>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Cupo: 13 personas</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">Viernes 16:00</CardTitle>
                <CardDescription className="text-sm sm:text-base">Turno tarde</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-center sm:space-y-4">
                <p className="text-sm text-muted-foreground sm:text-base">
                  Perfecto para cerrar la semana con una actividad grupal estimulante
                </p>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Cupo: 13 personas</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground sm:mt-8 sm:text-base">
            Al inscribirte, elegís <strong>un horario fijo</strong> para todo el mes.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">¿Listo/a para empezar?</h2>
          <p className="mb-6 text-base text-muted-foreground sm:mb-8 sm:text-lg">
            El primer paso es agendar una entrevista virtual para conocernos. Es rápido y sin compromiso.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="text-base sm:text-lg">
              <Link href="/taller-de-memoria/entrevista">
                Agendar Entrevista
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base bg-transparent sm:text-lg">
              <a href="https://wa.me/5491125790108" target="_blank" rel="noopener noreferrer">
                Tengo dudas, prefiero hablar
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
