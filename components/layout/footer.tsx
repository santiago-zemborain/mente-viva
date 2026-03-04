import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin } from "lucide-react"

const footerLinks = {
  servicios: [
    { name: "Taller de Memoria", href: "/taller-de-memoria" },
    { name: "Clases Especiales", href: "/clases-especiales" },
    { name: "Formación Profesional", href: "/formacion" },
    { name: "Eventos y Charlas", href: "/eventos" },
  ],
  info: [
    { name: "Sobre Nosotros", href: "/nosotros" },
    { name: "Preguntas Frecuentes", href: "/faq" },
    { name: "Material Descargable", href: "/material" },
    { name: "Contacto", href: "/contacto" },
  ],
  legal: [
    { name: "Privacidad", href: "/legal/privacidad" },
    { name: "Términos", href: "/legal/terminos" },
    { name: "Pagos y Cancelaciones", href: "/legal/pagos" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Mente Viva"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <span className="text-lg font-bold text-primary">Mente Viva</span>
            </Link>
            <p className="text-base text-muted-foreground">
              Espacio de salud cognitiva con enfoque en Terapia Ocupacional.
            </p>
            <div className="space-y-2 text-base">
              <a
                href="https://wa.me/5491125790108"
                className="flex items-center gap-2 text-foreground hover:text-primary"
              >
                <Phone className="h-5 w-5" />
                +54 11 2579 0108
              </a>
              <a
                href="mailto:mentevivaespacio@gmail.com"
                className="flex items-center gap-2 text-foreground hover:text-primary"
              >
                <Mail className="h-5 w-5" />
                mentevivaespacio@gmail.com
              </a>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0" />
                Buenos Aires, Argentina
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Servicios</h3>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-base text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Información</h3>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-base text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-base text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-base text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mente Viva. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
