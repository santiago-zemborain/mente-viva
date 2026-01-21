"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Building2, Upload, Loader2, ExternalLink, Copy, Check } from "lucide-react"
import Link from "next/link"

interface PaymentSelectorProps {
  userId: string
  userProfile: {
    name: string
    email: string
    phone: string
  }
  product: Product
  schedule: {
    weekday: number
    time: string
    dates: string[]
  }
  bankDetails: Record<string, string> | null
  onComplete: (reservationId: string) => void
  onBack: () => void
}

export function PaymentSelector({
  userId,
  userProfile,
  product,
  schedule,
  bankDetails,
  onComplete,
  onBack,
}: PaymentSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState<"mp_link" | "transfer">("mp_link")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const totalAmount = schedule.dates.length * product.price

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!termsAccepted) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Create reservation
      const { data: reservation, error: resError } = await supabase
        .from("reservations")
        .insert({
          product_id: product.id,
          user_id: userId,
          status: "pending",
          terms_accepted_at: new Date().toISOString(),
          selected_weekday: schedule.weekday,
          selected_time: schedule.time,
        })
        .select()
        .single()

      if (resError) throw resError

      // Upload receipt if transfer
      let receiptUrl = null
      if (paymentMethod === "transfer" && receiptFile) {
        const fileExt = receiptFile.name.split(".").pop()
        const fileName = `${reservation.id}-${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, receiptFile)

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName)
          receiptUrl = urlData.publicUrl
        }
      }

      // Create payment record
      const { error: payError } = await supabase.from("payments").insert({
        reservation_id: reservation.id,
        method: paymentMethod,
        status: "pending",
        amount: totalAmount,
        receipt_url: receiptUrl,
      })

      if (payError) throw payError

      onComplete(reservation.id)
    } catch (error) {
      console.error("Error creating reservation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Método de pago</h2>
        <p className="text-muted-foreground">Elegí cómo querés pagar tu reserva</p>
      </div>

      {/* Order summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Resumen de tu reserva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>{product.type === "trial" ? "Clase de prueba" : "Clases del mes"}</span>
            <span>{schedule.dates.length} clase(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Precio por clase</span>
            <span>${product.price.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total a pagar</span>
            <span className="text-primary">${totalAmount.toLocaleString("es-AR")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment methods */}
      <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "mp_link" | "transfer")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mp_link" className="gap-2">
            <CreditCard className="h-4 w-4" />
            MercadoPago
          </TabsTrigger>
          <TabsTrigger value="transfer" className="gap-2">
            <Building2 className="h-4 w-4" />
            Transferencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mp_link" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagar con MercadoPago</CardTitle>
              <CardDescription>
                Al hacer clic en el botón, serás redirigido a MercadoPago para completar el pago.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.mp_payment_link ? (
                <Button asChild className="w-full" size="lg">
                  <a href={product.mp_payment_link} target="_blank" rel="noopener noreferrer">
                    Ir a pagar
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-center text-muted-foreground">
                  Link de pago no disponible. Por favor, usá transferencia.
                </p>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Después de pagar, volvé acá y hacé clic en "Confirmar reserva".
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos para transferencia</CardTitle>
              <CardDescription>Transferí el monto y subí el comprobante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankDetails && (
                <div className="space-y-3 rounded-lg bg-muted p-4">
                  {Object.entries(bankDetails).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">{key.replace("_", " ")}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(value, key)}>
                        {copied === key ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="receipt">Subir comprobante (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {receiptFile && (
                    <span className="text-sm text-muted-foreground">
                      <Upload className="inline h-4 w-4" /> {receiptFile.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Podés subir el comprobante ahora o después desde tu perfil
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Terms */}
      <div className="flex items-start space-x-3">
        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} />
        <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
          Acepto los{" "}
          <Link href="/legal/terminos" className="text-primary hover:underline" target="_blank">
            Términos y Condiciones
          </Link>{" "}
          y las{" "}
          <Link href="/legal/pagos" className="text-primary hover:underline" target="_blank">
            Políticas de Pago y Cancelación
          </Link>
        </label>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={!termsAccepted || isLoading} size="lg" className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          "Confirmar reserva"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Tu reserva quedará pendiente de confirmación hasta que verifiquemos el pago.
      </p>
    </div>
  )
}
