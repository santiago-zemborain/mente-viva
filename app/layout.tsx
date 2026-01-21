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
      { url: "/images/logo-20mente-20viva-20espacio.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Mente Viva - Espacio de Salud Cognitiva",
    description: "Promovemos la salud cognitiva desde una mirada global y humana.",
    url: "https://menteviva.com.ar",
    siteName: "Mente Viva",
    locale: "es_AR",
    type: "website",
  },
  generator: 'v0.app'
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
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
