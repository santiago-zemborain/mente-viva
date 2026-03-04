import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
})

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mente Viva",
  url: "https://menteviva.com.ar",
  logo: "https://menteviva.com.ar/images/logo.png",
}

export const metadata: Metadata = {
  title: {
    default: "Mente Viva - Espacio de Salud Cognitiva",
    template: "%s | Mente Viva",
  },
  description:
    "Promovemos la salud cognitiva desde una mirada global y humana. Talleres de memoria, estimulación cognitiva y terapia ocupacional en Buenos Aires.",
  keywords: [
    "salud cognitiva",
    "taller de memoria",
    "terapia ocupacional",
    "estimulación cognitiva",
    "adultos mayores",
    "Buenos Aires",
  ],
  authors: [{ name: "Mente Viva" }],
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/logo.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Mente Viva - Espacio de Salud Cognitiva",
    description: "Promovemos la salud cognitiva desde una mirada global y humana. Talleres de memoria, estimulación cognitiva y terapia ocupacional en Buenos Aires.",
    url: "https://menteviva.com.ar",
    siteName: "Mente Viva",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "https://menteviva.com.ar/images/logo.png",
        width: 1563,
        height: 1563,
        alt: "Mente Viva - Espacio de Salud Cognitiva",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mente Viva - Espacio de Salud Cognitiva",
    description: "Promovemos la salud cognitiva desde una mirada global y humana.",
    images: ["https://menteviva.com.ar/images/logo.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#2196F3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.className} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
