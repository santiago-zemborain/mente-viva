"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { ProductSelector } from "./product-selector"
import { ScheduleSelector } from "./schedule-selector"
import { PaymentSelector } from "./payment-selector"
import { ReservationConfirmation } from "./reservation-confirmation"
import { StepIndicator } from "@/components/ui/step-indicator"

interface ReservationFlowProps {
  userId: string
  userProfile: {
    name: string
    email: string
    phone: string
  }
  products: Product[]
  holidays: string[]
  closedDates: string[]
  bankDetails: Record<string, string> | null
}

const steps = [
  { number: 1, title: "Elegí tu opción" },
  { number: 2, title: "Seleccioná horario" },
  { number: 3, title: "Método de pago" },
  { number: 4, title: "Confirmación" },
]

export function ReservationFlow({
  userId,
  userProfile,
  products,
  holidays,
  closedDates,
  bankDetails,
}: ReservationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<{
    weekday: number
    time: string
    dates: string[]
  } | null>(null)
  const [reservationId, setReservationId] = useState<string | null>(null)

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setCurrentStep(2)
  }

  const handleScheduleSelect = (schedule: { weekday: number; time: string; dates: string[] }) => {
    setSelectedSchedule(schedule)
    setCurrentStep(3)
  }

  const handlePaymentComplete = (resId: string) => {
    setReservationId(resId)
    setCurrentStep(4)
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Reservar Clase</h1>
        <p className="text-lg text-muted-foreground">Seguí los pasos para completar tu reserva</p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} className="mb-8" />

      {currentStep === 1 && <ProductSelector products={products} onSelect={handleProductSelect} />}

      {currentStep === 2 && selectedProduct && (
        <ScheduleSelector
          product={selectedProduct}
          holidays={holidays}
          closedDates={closedDates}
          onSelect={handleScheduleSelect}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && selectedProduct && selectedSchedule && (
        <PaymentSelector
          userId={userId}
          userProfile={userProfile}
          product={selectedProduct}
          schedule={selectedSchedule}
          bankDetails={bankDetails}
          onComplete={handlePaymentComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 4 && reservationId && (
        <ReservationConfirmation reservationId={reservationId} product={selectedProduct} schedule={selectedSchedule} />
      )}
    </div>
  )
}
