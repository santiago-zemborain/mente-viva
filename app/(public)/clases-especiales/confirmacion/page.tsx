import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

function ConfirmacionContent({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const name = searchParams.name || "Participante"
  const email = searchParams.email || ""
  const clase = searchParams.clase || "Clase Especial"
  const total = searchParams.total || "$0"
  const status = searchParams.status // approved, pending, failure
  const tipo = searchParams.tipo || "full"
  // Si viene status de MercadoPago, es MercadoPago, sino usar el método del parámetro o transfer por defecto
  const metodo = searchParams.metodo || (status === "approved" || status === "pending" ? "mercadopago" : "transfer")

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
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                {status === "pending"
                  ? "¡Reserva en proceso!"
                  : status === "failure"
                    ? "Error en el pago"
                    : "¡Gracias por tu reserva!"}
              </h1>
              <p className="text-xl text-green-700">
                {status === "pending" ? (
                  <>
                    <strong>{name}</strong>, tu reserva está siendo procesada. Te notificaremos cuando se confirme el pago.
                  </>
                ) : status === "failure" ? (
                  <>
                    <strong>{name}</strong>, hubo un problema con el pago. Por favor intentá nuevamente o contactanos.
                  </>
                ) : (
                  <>
                    <strong>{name}</strong>, tu reserva ha sido registrada correctamente.
                  </>
                )}
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

            {/* Resumen de la reserva */}
            <div className="bg-white rounded-xl p-6 border border-green-200 text-left space-y-4">
              <h3 className="font-semibold text-green-900 mb-3 text-lg">Resumen de tu reserva:</h3>
              <div className="space-y-2 text-green-800">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clase:</span>
                  <span className="font-medium">{clase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total a pagar:</span>
                  <span className="font-semibold text-lg">{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de pago:</span>
                  <span className="font-medium capitalize">
                    {metodo === "transfer" ? "Transferencia bancaria" : "MercadoPago"}
                  </span>
                </div>
                {tipo === "deposit" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de pago:</span>
                    <span className="font-medium">Seña (pago parcial)</span>
                  </div>
                )}
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
                  <span>¡Te esperamos en la clase especial!</span>
                </li>
              </ol>
            </div>

            {/* Botón volver */}
            <Link href="/clases-especiales">
              <Button variant="outline" size="lg" className="h-12 text-base mt-4 bg-transparent">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver a clases especiales
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Esta página usa searchParams, debe ser dinámica
export const dynamic = 'force-dynamic'

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams

  return (
    <Suspense fallback={<div className="container max-w-2xl mx-auto py-12 px-4 text-center">Cargando...</div>}>
      <ConfirmacionContent searchParams={params} />
    </Suspense>
  )
}

