"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5491125790108?text=Hola!%20Quiero%20consultar%20sobre%20los%20talleres%20de%20Mente%20Viva"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
      aria-label="Contactar por WhatsApp"
    >
      <Button
        size="lg"
        className="h-16 w-16 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] sm:h-auto sm:w-auto sm:rounded-xl sm:px-6 sm:py-4"
      >
        <MessageCircle className="h-7 w-7 sm:mr-2" />
        <span className="sr-only sm:not-sr-only sm:text-lg sm:font-semibold">¿Necesitás ayuda?</span>
      </Button>
    </a>
  )
}
