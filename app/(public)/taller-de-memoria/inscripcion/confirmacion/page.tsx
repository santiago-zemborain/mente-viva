"use client"

// Esta página usa searchParams, debe ser dinámica
// Nota: Como es un client component, la configuración se hace en el wrapper
import { Suspense, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail, Calendar, MapPin, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

function ConfirmacionContent({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const name = searchParams.name || "Participante"
  const email = searchParams.email || ""
  const clases = searchParams.clases ? Number.parseInt(searchParams.clases) : 1
  const total = searchParams.total || "$0"
  const dia = searchParams.dia === "3" ? "miércoles" : "viernes"
  const hora = searchParams.dia === "3" ? "11:00" : "16:00"
  const fechas = searchParams.fechas ? decodeURIComponent(searchParams.fechas) : ""
  const status = searchParams.status // approved, pending, failure
  const metodo = searchParams.metodo || (status ? "mercadopago" : "transfer")
  const [emailSent, setEmailSent] = useState(false)

  // Enviar email cuando viene de MercadoPago (solo una vez)
  useEffect(() => {
    console.log("FUERA DEL IF", { status, metodo, emailSent, email });
    
    if ((status?.[0] === "approved" || status?.[0] === "pending") && metodo === "mercadopago" && !emailSent && email) {
      console.log("DENTRO DEL IF", { status, metodo, emailSent, email });
      
      // Extraer fechas de los parámetros si están disponibles
      const selectedDates = fechas
        ? fechas.split(", ").map((f) => {
            // Convertir formato "15 de enero" a fecha ISO
            const parts = f.split(" de ")
            if (parts.length === 2) {
              const day = parseInt(parts[0])
              const monthName = parts[1].toLowerCase()
              const months: { [key: string]: number } = {
                enero: 0,
                febrero: 1,
                marzo: 2,
                abril: 3,
                mayo: 4,
                junio: 5,
                julio: 6,
                agosto: 7,
                septiembre: 8,
                octubre: 9,
                noviembre: 10,
                diciembre: 11,
              }
              const month = months[monthName]
              if (month !== undefined) {
                const now = new Date()
                const year = now.getFullYear()
                const date = new Date(year, month, day)
                return date.toISOString().split("T")[0]
              }
            }
            return ""
          })
        : []

      fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          selectedDates: selectedDates.filter((d) => d),
          weekday: searchParams.dia ? parseInt(searchParams.dia) : 3,
          total: total.replace(/[^0-9]/g, ""), // Remover símbolos de moneda
          paymentMode: clases > 4 ? "monthly" : "single", // Aproximación
          paymentMethod: "mercadopago",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setEmailSent(true)
          }
        })
        .catch((err) => {
          console.error("Error sending confirmation email:", err)
        })
    }
  }, [status, metodo, email, emailSent, name, fechas, total, clases, searchParams.dia])

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Icono de éxito */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">¡Gracias por inscribirte!</h1>
              <p className="text-xl text-green-700">
                <strong>{name}</strong>, tu inscripción ha sido registrada correctamente.
              </p>
            </div>

            {/* Confirmación de email */}
            <div className="bg-white rounded-xl p-6 border border-green-200 space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Mail className="h-5 w-5" />
                <span className="text-lg">Te enviamos la confirmación a:</span>
              </div>
              <p className="text-xl font-semibold text-green-800">{email}</p>
              <p className="text-green-600 text-base">
                Revisá tu bandeja de entrada (y la carpeta de spam) para ver todos los detalles.
              </p>
            </div>

            {/* Resumen de la inscripción */}
            <div className="bg-white rounded-xl p-6 border border-green-200 text-left space-y-4">
              <h2 className="text-lg font-semibold text-green-800 text-center mb-4">Resumen de tu inscripción</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">
                      {clases} clase{clases > 1 ? "s" : ""} los {dia}
                    </p>
                    {fechas && <p className="text-green-600 text-sm">{fechas}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">{hora} hs</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-green-800">Av. Presidente Manuel Quintana y Montevideo, Recoleta, CABA</p>
                </div>
              </div>

              <div className="pt-4 border-t border-green-200 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 text-lg">Total abonado:</span>
                  <span className="text-2xl font-bold text-green-800">{total}</span>
                </div>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-left">
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">Próximos pasos:</h3>
              <ol className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </span>
                  <span>Revisá el email con los datos de pago</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </span>
                  <span>¡Te esperamos en el taller!</span>
                </li>
              </ol>
            </div>

            {/* Botón volver */}
            <Link href="/">
              <Button variant="outline" size="lg" className="h-12 text-base mt-4 bg-transparent">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const [params, setParams] = useState<{ [key: string]: string | undefined }>({})

  useEffect(() => {
    searchParams.then(setParams)
  }, [searchParams])

  return (
    <Suspense fallback={<div className="container max-w-2xl mx-auto py-12 px-4 text-center">Cargando...</div>}>
      {Object.keys(params).length > 0 && <ConfirmacionContent searchParams={params} />}
    </Suspense>
  )
}
