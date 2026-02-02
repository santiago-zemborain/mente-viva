"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Loader2, Package, Ticket, Info, CreditCard, Building2, Copy, Check, ArrowLeft, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  weekday?: number
  time?: string
}

interface ClassDate {
  date: Date
  dateString: string
  isHoliday: boolean
  holidayLabel?: string
}

const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

// Precios por defecto (fallback si no se pueden obtener de la BD)
const DEFAULT_PRICE_MONTHLY = 25000
const DEFAULT_PRICE_SINGLE = 30000

const BANK_DETAILS = {
  titular: "MAITE BUSTINZA",
  banco: "Banco Galicia",
  cbu: "0070664930004001936415",
  alias: "MENTEVIVAESPACIO",
  numeroCuenta: "4001936-4 664-1",
}

export function RecurringRegistrationForm({ weekday: initialWeekday, time: initialTime }: Props) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<"miercoles" | "viernes" | null>(
    initialWeekday ? (initialWeekday === 3 ? "miercoles" : "viernes") : null
  )
  const [weekday, setWeekday] = useState<number>(initialWeekday || 3)
  const [time, setTime] = useState<string>(initialTime || "11:00")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [availableDates, setAvailableDates] = useState<ClassDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [step, setStep] = useState<"form" | "payment">("form")
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "transfer" | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [userSelectedMonthly, setUserSelectedMonthly] = useState(false)
  const [monthlyPrice, setMonthlyPrice] = useState(DEFAULT_PRICE_MONTHLY)
  const [singlePrice, setSinglePrice] = useState(DEFAULT_PRICE_SINGLE)
  const [monthlyProductId, setMonthlyProductId] = useState<string | null>(null)
  const [trialProductId, setTrialProductId] = useState<string | null>(null)
  const [classProducts, setClassProducts] = useState<Map<string, { id: string; price: number; monthly_price: number | null }>>(new Map())

  const supabase = useMemo(() => createClient(), [])

  // Obtener precios y product IDs de la base de datos
  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data: products } = await supabase
          .from("products")
          .select("id, type, price")
          .in("type", ["monthly", "trial"])
          .eq("is_active", true)

        if (products) {
          const monthlyProduct = products.find((p) => p.type === "monthly")
          const trialProduct = products.find((p) => p.type === "trial")

          if (monthlyProduct) {
            setMonthlyPrice(Number(monthlyProduct.price))
            setMonthlyProductId(monthlyProduct.id)
          }
          // El precio de clases sueltas puede ser el mismo que monthly o trial
          // Por ahora usamos el precio de trial si existe, sino el de monthly
          if (trialProduct) {
            setSinglePrice(Number(trialProduct.price))
            setTrialProductId(trialProduct.id)
          } else if (monthlyProduct) {
            // Si no hay trial, usar un precio más alto que monthly (ej: 20% más)
            setSinglePrice(Number(monthlyProduct.price) * 1.2)
            // Usar el monthly product ID también para clases sueltas si no hay trial
            setTrialProductId(monthlyProduct.id)
          }
        }
      } catch (error) {
        console.error("Error fetching prices:", error)
        // Mantener precios por defecto en caso de error
      }
    }

    fetchPrices()
  }, [supabase])

  console.log("monthlyPrice", monthlyPrice)

  const availableNonHoliday = useMemo(() => {
    return availableDates.filter((d) => !d.isHoliday)
  }, [availableDates])

  const isFullMonth = selectedDates.length === availableNonHoliday.length && availableNonHoliday.length > 0

  const paymentMode = isFullMonth && userSelectedMonthly ? "monthly" : "single"

  const getMonthDates = useCallback((targetWeekday: number, holidayMap: Record<string, string>): ClassDate[] => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const today = now.getDate()

    const dates: ClassDate[] = []
    const lastDay = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day)
      if (date.getDay() === targetWeekday && day >= today) {
        const dateString = date.toISOString().split("T")[0]
        const isHoliday = dateString in holidayMap
        dates.push({
          date,
          dateString,
          isHoliday,
          holidayLabel: holidayMap[dateString],
        })
      }
    }

    return dates
  }, [])

  useEffect(() => {
    if (!selectedDay) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function loadHolidays() {
      const { data } = await supabase.from("holidays").select("date, label").eq("is_active", true)

      if (!isMounted) return

      const holidayMap: Record<string, string> = {}
      data?.forEach((h) => {
        holidayMap[h.date] = h.label || "Feriado"
      })

      const dates = getMonthDates(weekday, holidayMap)
      setAvailableDates(dates)

      // Cargar productos individuales de las clases disponibles
      // Filtrar por fecha, weekday y time usando schedules
      const dateStrings = dates.map(d => d.dateString)
      if (dateStrings.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select(`
            id, 
            price, 
            monthly_price, 
            month_label,
            schedules!inner(weekday, time_slot, specific_date)
          `)
          .eq("type", "monthly")
          .eq("is_active", true)
          .in("month_label", dateStrings)

        if (products && isMounted) {
          const productMap = new Map<string, { id: string; price: number; monthly_price: number | null }>()
          products.forEach(p => {
            // Filtrar por weekday y time en el schedule
            const schedule = Array.isArray(p.schedules) ? p.schedules[0] : p.schedules
            if (p.month_label && schedule && schedule.weekday === weekday && schedule.time_slot === time) {
              productMap.set(p.month_label, {
                id: p.id,
                price: Number(p.price),
                monthly_price: p.monthly_price ? Number(p.monthly_price) : null
              })
            }
          })
          setClassProducts(productMap)
        }
      }

      setIsLoading(false)
    }

    loadHolidays()

    return () => {
      isMounted = false
    }
  }, [weekday, supabase, getMonthDates, selectedDay])

  function handleDaySelection(day: "miercoles" | "viernes") {
    setSelectedDay(day)
    setWeekday(day === "miercoles" ? 3 : 5)
    setTime(day === "miercoles" ? "11:00" : "16:00")
    setSelectedDates([])
    setUserSelectedMonthly(false)
    setIsLoading(true)
  }

  function toggleDate(dateString: string) {
    setSelectedDates((prev) => {
      const newDates = prev.includes(dateString)
        ? prev.filter((d) => d !== dateString)
        : [...prev, dateString]

      // Si se deselecciona una clase y estaba en modo mensual, desactivar el modo mensual
      if (prev.includes(dateString) && userSelectedMonthly) {
        setUserSelectedMonthly(false)
      }

      return newDates
    })
  }

  function selectMonthlyPack() {
    const allNonHoliday = availableNonHoliday.map((d) => d.dateString)
    if (selectedDates.length === allNonHoliday.length && userSelectedMonthly) {
      // Deseleccionar todas
      setSelectedDates([])
      setUserSelectedMonthly(false)
    } else {
      // Seleccionar todas y activar pack mensual
      setSelectedDates(allNonHoliday)
      setUserSelectedMonthly(true)
    }
  }

  function calculateTotal(): number {
    // Si hay productos individuales cargados, usar sus precios
    if (classProducts.size > 0) {
      let total = 0
      for (const dateString of selectedDates) {
        const product = classProducts.get(dateString)
        if (product) {
          if (paymentMode === "monthly" && product.monthly_price !== null) {
            total += product.monthly_price
          } else {
            total += product.price
          }
        } else {
          // Fallback si no se encuentra el producto
          total += paymentMode === "monthly" ? monthlyPrice : singlePrice
        }
      }
      return total
    }

    // Fallback a precios globales si no hay productos individuales
    if (paymentMode === "monthly") {
      return selectedDates.length * monthlyPrice
    }
    return selectedDates.length * singlePrice
  }

  function formatPrice(price: number): string {

    return price.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 })
  }

  function formatDatesForDisplay(): string {
    const dateFormatter = new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
    })
    return selectedDates
      .sort()
      .map((d) => dateFormatter.format(new Date(d + "T12:00:00")))
      .join(", ")
  }

  function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Por favor completá todos los campos.")
      return
    }

    if (selectedDates.length === 0) {
      setError("Por favor seleccioná al menos una clase.")
      return
    }

    if (!termsAccepted) {
      setError("Debés leer y aceptar los términos y condiciones para continuar.")
      return
    }

    setStep("payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleFinalSubmit() {
    if (!paymentMethod) {
      setError("Por favor seleccioná un método de pago.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const total = calculateTotal()

      if (paymentMethod === "mercadopago") {
        const mpResponse = await fetch("/api/mercadopago/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: `+54${phone.trim()}`,
            selectedDates,
            weekday,
            time,
            total,
            paymentMode,
          }),
        })

        const mpData = await mpResponse.json()

        if (!mpResponse.ok) {
          // Mostrar error más descriptivo
          const errorMessage = mpData.error || mpData.message || "Error al procesar el pago"
          console.error("Error de MercadoPago:", mpData)
          throw new Error(errorMessage)
        }

        // Crear reservas usando API route (similar a clases especiales)
        // Para el taller de memoria, creamos una reserva por cada fecha seleccionada
        // y un solo pago que agrupe todas las reservas
        // Usamos el product_id según el modo de pago (monthly o trial)
        const productId = paymentMode === "monthly" ? monthlyProductId : trialProductId

        if (!productId) {
          throw new Error("No se pudo obtener el ID del producto. Por favor recargá la página.")
        }

        const reservationIds: string[] = []

        for (const dateString of selectedDates) {
          const reservationResponse = await fetch("/api/reservations/create-guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: productId,
              guest_name: name.trim(),
              guest_email: email.trim(),
              guest_phone: `+54${phone.trim()}`,
              selected_weekday: weekday,
              selected_time: time,
              selected_date: dateString,
              status: "pending_payment",
              terms_accepted_at: new Date().toISOString(),
              // No crear pago aquí, lo haremos después para agrupar todas las reservas
            }),
          })

          const reservationData = await reservationResponse.json()

          if (!reservationResponse.ok) {
            throw new Error(reservationData.error || "Error al crear la reserva")
          }

          if (reservationData.reservation?.id) {
            reservationIds.push(reservationData.reservation.id)
          }
        }

        // Crear un solo registro de pago que agrupe todas las reservas usando API route
        if (reservationIds.length > 0) {
          const paymentResponse = await fetch("/api/payments/create-guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reservation_ids: reservationIds, // Todas las reservas asociadas al pago
              method: "mp_link",
              status: "pending",
              payment_type: "full",
              amount: total,
            }),
          })

          const paymentData = await paymentResponse.json()

          if (!paymentResponse.ok) {
            console.error("Error creating payment:", paymentData.error)
            // No fallar la reserva si el pago falla, pero loguear el error
          }
        }

        // Redirect to MercadoPago checkout
        // El email se enviará cuando MercadoPago redirija de vuelta a la página de confirmación
        window.location.href = mpData.init_point
        return
      }

      // ===== TRANSFERENCIA BANCARIA =====
      // Crear reservas y pago para transferencia bancaria usando API route
      // Usamos el product_id según el modo de pago (monthly o trial)
      const productId = paymentMode === "monthly" ? monthlyProductId : trialProductId

      if (!productId) {
        throw new Error("No se pudo obtener el ID del producto. Por favor recargá la página.")
      }

      const reservationIds: string[] = []

      for (const dateString of selectedDates) {
        const reservationResponse = await fetch("/api/reservations/create-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            guest_name: name.trim(),
            guest_email: email.trim(),
            guest_phone: `+54${phone.trim()}`,
            selected_weekday: weekday,
            selected_time: time,
            selected_date: dateString,
            status: "pending",
            terms_accepted_at: new Date().toISOString(),
            // No crear pago aquí, lo haremos después para agrupar todas las reservas
          }),
        })

        const reservationData = await reservationResponse.json()

        if (!reservationResponse.ok) {
          throw new Error(reservationData.error || "Error al crear la reserva")
        }

        if (reservationData.reservation?.id) {
          reservationIds.push(reservationData.reservation.id)
        }
      }

      // Crear registro de pago para transferencia bancaria usando API route
      if (reservationIds.length > 0) {
        const paymentResponse = await fetch("/api/payments/create-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservation_ids: reservationIds, // Todas las reservas asociadas al pago
            method: "transfer",
            status: "pending",
            payment_type: "full",
            amount: total,
          }),
        })

        const paymentData = await paymentResponse.json()

        if (!paymentResponse.ok) {
          console.error("Error creating payment:", paymentData.error)
          // No fallar la reserva si el pago falla, pero loguear el error
        }
      }

      // Enviar email de confirmación para transferencia bancaria
      try {
        const sendConfirmationResponse = await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: `+54${phone.trim()}`,
            selectedDates,
            weekday,
            time,
            total: formatPrice(total),
            paymentMode,
            paymentMethod: "transfer",
          }),
        })

        if (!sendConfirmationResponse.ok) {
          console.error("Error sending confirmation email:", await sendConfirmationResponse.json())
          // No fallar la inscripción si el email falla
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
        // No fallar la inscripción si el email falla
      }

      // Redirigir a página de confirmación
      const params = new URLSearchParams({
        name: name.trim(),
        email: email.trim(),
        clases: selectedDates.length.toString(),
        total: formatPrice(total),
        dia: weekday.toString(),
        fechas: encodeURIComponent(formatDatesForDisplay()),
        metodo: "transfer",
      })

      router.push(`/taller-de-memoria/inscripcion/confirmacion?${params.toString()}`)
    } catch (err) {
      console.error(err)
      setError("Hubo un error al procesar tu inscripción. Por favor intentá nuevamente.")
      setIsSubmitting(false)
    }
  }

  const currentMonth = MONTH_NAMES[new Date().getMonth()]
  const currentYear = new Date().getFullYear()

  if (step === "payment") {
    return (
      <div className="space-y-6">
        <Button type="button" variant="ghost" onClick={() => setStep("form")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al formulario
        </Button>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-xl">Resumen de tu inscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clases seleccionadas:</span>
              <span className="font-medium">
                {selectedDates.length} clase{selectedDates.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fechas:</span>
              <span className="font-medium text-right">{formatDatesForDisplay()}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total a pagar:</span>
                <span className="font-bold text-primary">{formatPrice(calculateTotal())}</span>
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
                        <p className="text-sm text-muted-foreground">Número de cuenta</p>
                        <p className="font-medium font-mono">{BANK_DETAILS.numeroCuenta}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(BANK_DETAILS.numeroCuenta, "numeroCuenta")}
                      >
                        {copied === "numeroCuenta" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Monto a transferir</p>
                        <p className="font-bold text-lg text-primary">{formatPrice(calculateTotal())}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(calculateTotal().toString(), "monto")}
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
                    Una vez realizada la transferencia, tu inscripción quedará confirmada cuando verifiquemos el pago.
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
              Procesando inscripción...
            </>
          ) : paymentMethod === "mercadopago" ? (
            "Pagar con MercadoPago"
          ) : paymentMethod === "transfer" ? (
            "Confirmar inscripción"
          ) : (
            "Seleccioná un método de pago"
          )}
        </Button>
      </div>
    )
  }

  // Si no hay día seleccionado, mostrar selector
  if (!selectedDay) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Seleccioná tu horario preferido</h2>
          <p className="text-muted-foreground">
            Elegí el día y horario que mejor se adapte a tu disponibilidad
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
            onClick={() => handleDaySelection("miercoles")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Miércoles
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4" />
                  11:00 hs
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleDaySelection("miercoles")}>
                Seleccionar este horario
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
            onClick={() => handleDaySelection("viernes")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Viernes
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4" />
                  16:00 hs
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleDaySelection("viernes")}>
                Seleccionar este horario
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleProceedToPayment} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Tus datos</CardTitle>
              <CardDescription className="text-base">Completá tus datos para inscribirte</CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => {
                setSelectedDay(null)
                setSelectedDates([])
                setUserSelectedMonthly(false)
              }}
              className="gap-2"
            >
              Cambiar horario
            </Button>
          </div>
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
            <Info className="h-5 w-5" />
            Información de precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Pack mensual completo</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700">{formatPrice(monthlyPrice)}</p>
              <p className="text-muted-foreground">por clase</p>
              <p className="text-sm text-green-700 mt-2 font-medium">Mejor precio si abonás el mes completo</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Clases sueltas</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700">{formatPrice(singlePrice)}</p>
              <p className="text-muted-foreground">por clase</p>
              <p className="text-sm text-muted-foreground mt-2">Elegí solo las clases que te convengan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5" />
            Clases de {currentMonth} {currentYear}
          </CardTitle>
          <CardDescription className="text-base">
            Seleccioná los {weekday === 3 ? "miércoles" : "viernes"} a los que querés asistir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableDates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-base">
              No hay clases disponibles para el resto del mes.
            </p>
          ) : (
            <div className="space-y-4">
              {availableNonHoliday.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={selectMonthlyPack}
                  className="w-full h-12 text-base bg-transparent"
                >
                  {isFullMonth && userSelectedMonthly ? "Deseleccionar Pack Mensual" : `Seleccionar Pack Mensual (${availableNonHoliday.length} clases)`}
                </Button>
              )}

              <div className="space-y-3">
                {availableDates.map((classDate) => (
                  <div
                    key={classDate.dateString}
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${classDate.isHoliday
                      ? "bg-muted/50 border-muted cursor-not-allowed opacity-60"
                      : selectedDates.includes(classDate.dateString)
                        ? "bg-primary/10 border-primary"
                        : "bg-background hover:bg-muted/30 border-border hover:border-primary/50"
                      }`}
                  >
                    <Checkbox
                      id={classDate.dateString}
                      onClick={(e) => e.stopPropagation()}
                      checked={selectedDates.includes(classDate.dateString)}
                      onCheckedChange={() => toggleDate(classDate.dateString)}
                      disabled={classDate.isHoliday}
                      className="h-6 w-6"
                    />
                    <label
                      htmlFor={classDate.dateString}
                      className={`flex-1 ${classDate.isHoliday ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span
                          className={`text-lg ${classDate.isHoliday ? "text-muted-foreground line-through" : "font-medium"}`}
                        >
                          {WEEKDAY_NAMES[classDate.date.getDay()]} {classDate.date.getDate()} de {currentMonth}
                        </span>
                        {classDate.isHoliday && (
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {classDate.holidayLabel}
                          </span>
                        )}
                      </div>
                      {!classDate.isHoliday && <span className="text-base text-muted-foreground">{time} hs</span>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Modalidad de pago</CardTitle>
            <CardDescription className="text-base">Elegí cómo preferís abonar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 transition-colors ${isFullMonth
                ? paymentMode === "monthly"
                  ? "bg-primary/10 border-primary cursor-pointer"
                  : "border-border hover:border-primary/50 cursor-pointer"
                : "border-muted bg-muted/30 cursor-not-allowed opacity-60"
                }`}
              onClick={() => isFullMonth && setUserSelectedMonthly(true)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${isFullMonth && paymentMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg font-semibold">Pack mensual completo</h3>
                    {isFullMonth && (
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        Mejor precio
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">{formatPrice(monthlyPrice)} por clase</p>
                  {!isFullMonth && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Seleccioná todas las clases del mes para acceder a este precio
                    </p>
                  )}
                  {isFullMonth && (
                    <p className="text-lg font-semibold text-primary mt-2">
                      Total: {formatPrice(selectedDates.length * monthlyPrice)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMode === "single" ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                }`}
              onClick={() => setUserSelectedMonthly(false)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${paymentMode === "single" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Ticket className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Clases sueltas</h3>
                  <p className="text-muted-foreground mt-1">{formatPrice(singlePrice)} por clase</p>
                  <p className="text-lg font-semibold text-primary mt-2">
                    Total: {formatPrice(calculateTotal())}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDates.length > 0 && (
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
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-base text-destructive text-center">{error}</p>
        </div>
      )}

      {selectedDates.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-lg font-semibold">Total a pagar: {formatPrice(calculateTotal())}</p>
          <p className="text-muted-foreground">
            {selectedDates.length} clase{selectedDates.length !== 1 ? "s" : ""} seleccionada
            {selectedDates.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg"
        disabled={isSubmitting || selectedDates.length === 0 || !termsAccepted}
      >
        Confirmar inscripción
      </Button>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">1. Inscripción</h4>
            <p>
              La inscripción queda confirmada una vez realizado el pago correspondiente. Las vacantes son limitadas y se
              asignan por orden de pago.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">2. Valores y formas de pago</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Pack mensual (todas las clases del mes): <strong>{formatPrice(monthlyPrice)}</strong> por clase.
              </li>
              <li>
                Clases sueltas: <strong>{formatPrice(singlePrice)}</strong> por clase.
              </li>
            </ul>
            <p className="mt-2">Los pagos pueden realizarse mediante transferencia bancaria o MercadoPago.</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">3. Renovación</h4>
            <p>
              La vacante no se renueva automáticamente. A fin de cada mes se enviarán las fechas del mes siguiente y
              cada participante deberá confirmar su continuidad abonando en tiempo y forma.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">4. Cancelaciones y ausencias</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>En caso de no poder asistir, te pedimos avisar con al menos 24 horas de anticipación.</li>
              <li>Las clases no se recuperan ni se reembolsan.</li>
              <li>Si el taller se suspende por motivos de fuerza mayor, se reprogramará o se ofrecerá un reembolso.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">5. Puntualidad</h4>
            <p>
              Se solicita llegar unos minutos antes del inicio de la clase. El ingreso tardío puede interrumpir la
              dinámica del grupo.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">6. Comunicación</h4>
            <p>
              Toda la información se enviará por email y WhatsApp. Asegurate de brindar datos de contacto actualizados.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
