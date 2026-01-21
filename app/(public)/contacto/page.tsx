import type { Metadata } from "next"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/forms/contact-form"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactanos por WhatsApp, email o completando el formulario. Estamos para ayudarte.",
}

const contactInfo = [
  {
    icon: <Phone className="h-6 w-6" />,
    title: "WhatsApp",
    value: "+54 11 2579 0108",
    href: "https://wa.me/5491125790108",
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email",
    value: "mentevivaespacio@gmail.com",
    href: "mailto:mentevivaespacio@gmail.com",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Ubicación",
    value: "Buenos Aires, Argentina",
    href: null,
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Horarios de atención",
    value: "Lunes a Viernes, 9 a 18hs",
    href: null,
  },
]

// Configurar como estática
export const dynamic = 'force-static'

export default function ContactoPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Contactanos</h1>
          <p className="text-xl text-muted-foreground">
            Estamos para ayudarte. Escribinos por WhatsApp, email o completá el formulario.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Información de contacto</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {contactInfo.map((item) => (
                <Card key={item.title}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-primary hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{item.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Envianos un mensaje</CardTitle>
                <CardDescription>Completá el formulario y te responderemos a la brevedad.</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
