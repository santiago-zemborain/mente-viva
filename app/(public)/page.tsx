import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Brain, Calendar, GraduationCap, Users, Youtube, ArrowRight, Clock, MapPin, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/ui/service-card"
import { StepIndicator } from "@/components/ui/step-indicator"

const services = [
  {
    title: "Taller de Memoria",
    description:
      "Estimulación cognitiva grupal con enfoque en Terapia Ocupacional. Incluye infusiones, material y seguimiento personalizado.",
    href: "/taller-de-memoria",
    icon: <Brain className="h-7 w-7" />,
  },
  {
    title: "Clases Especiales",
    description:
      "Clases temáticas mensuales con profesionales especializados. Abordamos temas específicos de salud cognitiva.",
    href: "/clases-especiales",
    icon: <Calendar className="h-7 w-7" />,
  },
  {
    title: "Formación Profesional",
    description: "Capacitaciones y cursos para profesionales de la salud interesados en estimulación cognitiva.",
    href: "/formacion",
    icon: <GraduationCap className="h-7 w-7" />,
  },
  {
    title: "Eventos y Charlas",
    description: "Encuentros abiertos al público sobre salud cognitiva, bienestar y calidad de vida.",
    href: "/eventos",
    icon: <Users className="h-7 w-7" />,
  },
  {
    title: "YouTube",
    description: "Contenido gratuito sobre salud cognitiva, ejercicios y consejos para el día a día.",
    href: "#",
    icon: <Youtube className="h-7 w-7" />,
    badge: "Próximamente",
    disabled: true,
  },
]

const steps = [
  { number: 1, title: "Pedí tu entrevista", description: "Completá el formulario" },
  { number: 2, title: "Te contactamos", description: "Coordinamos día y hora" },
  { number: 3, title: "Clase de prueba", description: "Conocé el taller" },
  { number: 4, title: "¡Inscribite!", description: "Reservá tu lugar" },
]

// Configurar como estática con ISR (se regenera cada hora)
export const revalidate = 3600 // 1 hora

export default async function HomePage() {
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
      {/* Hero Section */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="relative h-40 w-full max-w-lg sm:h-64 sm:max-w-xl lg:h-80 lg:max-w-2xl">
              <Image
                src="/images/logo-20mente-20viva-20espacio.png"
                alt="Mente Viva - Espacio de Salud Cognitiva"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="mt-3 text-center font-medium tracking-wide text-primary-foreground/90 text-base sm:mt-4 sm:text-lg lg:text-xl xl:text-2xl">
              Un espacio de aprendizaje y salud integral
            </p>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-4xl space-y-4 sm:space-y-6">
              <p className="text-base leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                Bienvenido/a a Mente Viva, un espacio de salud integral donde cuidamos la salud cognitiva desde una
                mirada global, humana y cercana.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                Ofrecemos talleres, charlas y clases pensadas para fortalecer la memoria, la atención y el bienestar en
                la vida cotidiana, con propuestas prácticas, acompañadas y de alta calidad.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                Además, desarrollamos formaciones e instancias de intercambio para el público general y para
                profesionales de la salud. Nuestro trabajo está llevado adelante por profesionales capacitados y se
                apoya en el enfoque de la Terapia Ocupacional: una perspectiva que integra cuerpo, mente, hábitos y
                entorno para mejorar la calidad de vida de manera real y sostenible.
              </p>
              <p className="text-base font-medium text-foreground italic sm:text-lg">
                Un espacio donde la salud cognitiva se trabaja con práctica, acompañamiento y mirada humana.
              </p>
              <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                <Button asChild variant="outline" size="lg" className="text-base bg-transparent sm:text-lg">
                  <Link href="/contacto">Contactanos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Highlight */}
      <section className="border-y bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-8 lg:p-12">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Taller de Memoria Mente Viva</h2>
                <p className="text-base text-muted-foreground sm:text-lg">
                  Un espacio de estimulación cognitiva grupal donde trabajamos la memoria, atención, lenguaje y
                  funciones ejecutivas en un ambiente cálido y contenedor.
                </p>
                <div className="relative h-48 w-full max-w-md overflow-hidden rounded-xl sm:h-56">
                  <Image
                    src="/images/taller-memoria.jpg"
                    alt="Taller de Memoria Mente Viva - Participantes en clase"
                    fill
                    className="object-cover object-bottom"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                    <Clock className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">1 hora 30 minutos</span>
                  </div>
                  <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Av. Presidente Manuel Quintana y Montevideo, Recoleta, CABA</span>
                  </div>
                  <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                    <Calendar className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                    <div className="flex flex-wrap gap-2 text-sm sm:text-base">
                      <Link
                        href="/taller-de-memoria/inscripcion?dia=miercoles&hora=11:00"
                        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                      >
                        Mié 11hs
                      </Link>
                      <span>/</span>
                      <Link
                        href="/taller-de-memoria/inscripcion?dia=viernes&hora=16:00"
                        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                      >
                        Vie 16hs
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                    <Users className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Máximo 13 personas</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary sm:text-3xl">
                    ${price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-base text-muted-foreground sm:text-lg">por clase</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium sm:text-base">Incluye:</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {["Infusiones y snack", "Material de trabajo", "Seguimiento personalizado", "Grupos reducidos"].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
                          <CheckCircle className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl bg-background p-4 shadow-sm sm:p-6">
                  <h3 className="mb-4 text-lg font-semibold sm:text-xl">¿Cómo empezar?</h3>
                  <StepIndicator steps={steps} currentStep={1} />
                </div>
                <Button asChild size="lg" className="w-full text-base sm:text-lg">
                  <Link href="/taller-de-memoria">
                    Soy nuevo/a: Agendar Entrevista
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full text-base bg-transparent sm:text-lg">
                  <Link href="/taller-de-memoria/inscripcion?dia=miercoles&hora=11:00">
                    Ya asistí: Reservar mi lugar
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">Nuestros Servicios</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Descubrí todas las opciones que tenemos para acompañarte en tu camino hacia una mejor salud cognitiva.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-12 text-primary-foreground sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl lg:text-4xl">¿Tenés dudas? ¡Hablemos!</h2>
          <p className="mb-6 text-base opacity-90 sm:mb-8 sm:text-lg lg:text-xl">
            Estamos para ayudarte. Contactanos por WhatsApp o completá el formulario de contacto.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg">
              <a href="https://wa.me/5491125790108" target="_blank" rel="noopener noreferrer">
                WhatsApp: +54 11 2579 0108
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-base text-primary-foreground hover:bg-primary-foreground/10 sm:text-lg"
            >
              <Link href="/contacto">Formulario de Contacto</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
