"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
  Info,
  CreditCard,
  Building2,
  Copy,
  Check,
  ArrowLeft,
  Package,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
import { toast } from "sonner"

interface Props {
  product: Product & { reservations?: { count: number }[] | { count: number } }
}

const BANK_DETAILS = {
  titular: "MAITE BUSTINZA",
  banco: "Banco Galicia",
  cbu: "0070664930004001936415",
  alias: "MENTEVIVAESPACIO",
  numeroCuenta: "4001936-4 664-1",
}

export function SpecialClassRegistrationForm({ product }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [step, setStep] = useState<"form" | "payment">("form")
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "transfer" | null>(null)
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full")
  const [copied, setCopied] = useState<string | null>(null)

  const supabase = createClient()

  const reservationsCount = Array.isArray(product.reservations)
    ? product.reservations[0]?.count || 0
    : product.reservations?.count || 0
  const spotsLeft = product.capacity - reservationsCount

  const price = Number(product.price)
  const depositAmount = product.requires_deposit
    ? Math.round((price * product.deposit_percent) / 100)
    : 0
  const totalAmount = paymentType === "deposit" ? depositAmount : price

  function formatPrice(price: number): string {
    return price.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 })
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Por favor completá todos los campos.")
      return
    }

    if (spotsLeft <= 0) {
      setError("No hay cupos disponibles para esta clase.")
      return
    }

    if (!termsAccepted) {
      setError("Debés leer y aceptar los términos y condiciones para continuar.")
      return
    }

    setStep("payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleFinalSubmit() {
    if (!paymentMethod) {
      setError("Por favor seleccioná un método de pago.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      if (paymentMethod === "mercadopago") {
        const mpResponse = await fetch("/api/mercadopago/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: `+54${phone.trim()}`,
            total: totalAmount,
            productId: product.id,
            productTitle: product.title,
            paymentType: paymentType,
          }),
        })

        const mpData = await mpResponse.json()

        if (!mpResponse.ok) {
          const errorMessage = mpData.error || mpData.message || "Error al procesar el pago"
          console.error("Error de MercadoPago:", mpData)
          throw new Error(errorMessage)
        }

        // Crear reserva con estado pending_payment antes de redirigir usando API route
        const reservationResponse = await fetch("/api/reservations/create-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            guest_name: name.trim(),
            guest_email: email.trim(),
            guest_phone: `+54${phone.trim()}`,
            status: "pending_payment",
            terms_accepted_at: new Date().toISOString(),
            payment: {
              method: "mp_link",
              status: "pending",
              payment_type: paymentType === "deposit" ? "deposit" : "full",
              amount: paymentType === "deposit" ? depositAmount : totalAmount,
            },
          }),
        })

        const reservationData = await reservationResponse.json()

        if (!reservationResponse.ok) {
          throw new Error(reservationData.error || "Error al crear la reserva")
        }

        // Redirigir a MercadoPago checkout
        window.location.href = mpData.init_point
        return
      }

      // Crear reserva usando API route
      const reservationResponse = await fetch("/api/reservations/create-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          guest_name: name.trim(),
          guest_email: email.trim(),
          guest_phone: `+54${phone.trim()}`,
          status: "pending",
          terms_accepted_at: new Date().toISOString(),
          payment: paymentType === "deposit"
            ? {
              method: "transfer",
              status: "pending",
              payment_type: "deposit",
              amount: depositAmount,
            }
            : undefined,
        }),
      })

      const reservationData = await reservationResponse.json()

      if (!reservationResponse.ok) {
        throw new Error(reservationData.error || "Error al crear la reserva")
      }

      // Enviar email de confirmación
      const sendConfirmationResponse = await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: `+54${phone.trim()}`,
          selectedDates: [],
          weekday: null,
          total: formatPrice(totalAmount),
          paymentMode: paymentType === "deposit" ? "deposit" : "full",
          paymentMethod: "transfer",
          specialClass: {
            title: product.title,
            month_label: product.month_label,
          },
        }),
      })

      console.log({ sendConfirmationResponse });

      const params = new URLSearchParams({
        name: name.trim(),
        email: email.trim(),
        clase: product.title,
        total: formatPrice(totalAmount),
        metodo: paymentMethod,
        tipo: paymentType,
      })

      router.push(`/clases-especiales/confirmacion?${params.toString()}`)
    } catch (err) {
      console.error(err)
      setError("Hubo un error al procesar tu reserva. Por favor intentá nuevamente.")
      setIsSubmitting(false)
    }
  }

  if (step === "payment") {
    return (
      <div className="space-y-6">
        <Button type="button" variant="ghost" onClick={() => setStep("form")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al formulario
        </Button>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-xl">Resumen de tu reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clase:</span>
              <span className="font-medium">{product.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de pago:</span>
              <span className="font-medium">
                {paymentType === "deposit" ? `Seña (${product.deposit_percent}%)` : "Pago completo"}
              </span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total a pagar:</span>
                <span className="font-bold text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Elegí cómo pagar</CardTitle>
            <CardDescription className="text-base">Seleccioná tu método de pago preferido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-5 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === "mercadopago"
                  ? "bg-primary/10 border-primary"
                  : "border-border hover:border-primary/50"
                }`}
              onClick={() => setPaymentMethod("mercadopago")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-full ${paymentMethod === "mercadopago" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">MercadoPago</h3>
                  <p className="text-muted-foreground mt-1">Pagá con tarjeta de crédito, débito o dinero en cuenta</p>
                </div>
              </div>
            </div>

            <div
              className={`p-5 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === "transfer" ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                }`}
              onClick={() => setPaymentMethod("transfer")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-full ${paymentMethod === "transfer" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Transferencia bancaria</h3>
                  <p className="text-muted-foreground mt-1">Transferí desde tu banco o billetera virtual</p>
                </div>
              </div>
            </div>

            {paymentMethod === "transfer" && (
              <Card className="bg-blue-50 border-blue-200 mt-4">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Datos para la transferencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Titular</p>
                        <p className="font-medium">{BANK_DETAILS.titular}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Banco</p>
                        <p className="font-medium">{BANK_DETAILS.banco}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">CBU</p>
                        <p className="font-medium font-mono">{BANK_DETAILS.cbu}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(BANK_DETAILS.cbu, "cbu")}
                      >
                        {copied === "cbu" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Alias</p>
                        <p className="font-medium font-mono">{BANK_DETAILS.alias}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(BANK_DETAILS.alias, "alias")}
                      >
                        {copied === "alias" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Monto a transferir</p>
                        <p className="font-bold text-lg text-primary">{formatPrice(totalAmount)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(totalAmount.toString(), "monto")}
                      >
                        {copied === "monto" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-blue-800 mt-4">
                    Una vez realizada la transferencia, tu reserva quedará confirmada cuando verifiquemos el pago.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-base text-destructive text-center">{error}</p>
          </div>
        )}

        <Button
          type="button"
          size="lg"
          className="w-full h-14 text-lg"
          disabled={isSubmitting || !paymentMethod}
          onClick={handleFinalSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando reserva...
            </>
          ) : paymentMethod === "mercadopago" ? (
            "Pagar con MercadoPago"
          ) : paymentMethod === "transfer" ? (
            "Confirmar reserva"
          ) : (
            "Seleccioná un método de pago"
          )}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleProceedToPayment} className="space-y-6">
      {/* Información de la clase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.title}</CardTitle>
          {product.month_label && (
            <CardDescription className="text-lg">{product.month_label}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-base text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
            {product.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-base">{product.location}</span>
              </div>
            )}
            {product.duration_minutes && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-base">{formatDuration(product.duration_minutes)}</span>
              </div>
            )}
            {product.instructor_name && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-base font-medium">{product.instructor_name}</span>
                  {product.instructor_bio && (
                    <p className="text-sm text-muted-foreground">{product.instructor_bio}</p>
                  )}
                </div>
              </div>
            )}
            {product.modality && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-base capitalize">{product.modality}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {product.is_free ? "Gratis" : formatPrice(price)}
              </span>
              {!product.is_free && (
                <span className="text-lg text-muted-foreground">por persona</span>
              )}
            </div>
            {!product.is_free && product.requires_deposit && (
              <p className="text-sm text-muted-foreground mt-2">
                Seña mínima: {product.deposit_percent}% ({formatPrice(depositAmount)})
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {spotsLeft > 0 ? `${spotsLeft} lugares disponibles` : "Sin cupos disponibles"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tus datos</CardTitle>
          <CardDescription className="text-base">Completá tus datos para reservar tu lugar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre y apellido"
              className="text-base h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">
              Celular
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-base font-medium">
                +54
              </span>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11 2345 6789"
                className="rounded-l-none text-base h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="text-base h-12"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Opciones de pago */}
      {!product.is_free && product.requires_deposit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Opciones de pago</CardTitle>
            <CardDescription className="text-base">Elegí cómo preferís abonar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentType === "full"
                  ? "bg-primary/10 border-primary"
                  : "border-border hover:border-primary/50"
                }`}
              onClick={() => setPaymentType("full")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${paymentType === "full" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Pago completo</h3>
                  <p className="text-muted-foreground mt-1">{formatPrice(price)}</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentType === "deposit"
                  ? "bg-primary/10 border-primary"
                  : "border-border hover:border-primary/50"
                }`}
              onClick={() => setPaymentType("deposit")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${paymentType === "deposit" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Info className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Pagar seña</h3>
                  <p className="text-muted-foreground mt-1">
                    {formatPrice(depositAmount)} ({product.deposit_percent}% del total)
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    El saldo restante se abona hasta 1 día antes de la clase
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Términos y condiciones */}
      <div className="flex items-start space-x-3 p-4 rounded-lg border bg-muted/30">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="h-6 w-6 mt-0.5"
        />
        <label htmlFor="terms" className="text-base cursor-pointer">
          He leído y acepto los términos y condiciones
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-base text-destructive text-center">{error}</p>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-lg font-semibold">
          Total a pagar: {formatPrice(product.is_free ? 0 : totalAmount)}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg"
        disabled={isSubmitting || spotsLeft <= 0 || !termsAccepted}
      >
        {spotsLeft <= 0 ? "Sin cupos disponibles" : "Continuar al pago"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">1. Reserva</h4>
            <p>
              La reserva queda confirmada una vez realizado el pago correspondiente. Las vacantes son limitadas y se
              asignan por orden de pago.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">2. Valores y formas de pago</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Pago completo: <strong>{formatPrice(price)}</strong>
              </li>
              {product.requires_deposit && (
                <li>
                  Seña: <strong>{formatPrice(depositAmount)}</strong> ({product.deposit_percent}% del total). El saldo
                  restante se abona hasta 1 día antes de la clase.
                </li>
              )}
            </ul>
            <p className="mt-2">Los pagos pueden realizarse mediante transferencia bancaria o MercadoPago.</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">3. Cancelaciones</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>En caso de no poder asistir, te pedimos avisar con al menos 48 horas de anticipación.</li>
              <li>Las cancelaciones con más de 48 horas de anticipación pueden optar por reprogramar o reembolso.</li>
              <li>Las cancelaciones con menos de 48 horas no tienen reembolso.</li>
              <li>Si la clase se suspende por motivos de fuerza mayor, se reprogramará o se ofrecerá un reembolso.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">4. Puntualidad</h4>
            <p>
              Se solicita llegar unos minutos antes del inicio de la clase. El ingreso tardío puede interrumpir la
              dinámica del grupo.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

