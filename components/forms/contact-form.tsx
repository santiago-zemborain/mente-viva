"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Loader2 } from "lucide-react"

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      subject: (formData.get("subject") as string) || null,
      message: formData.get("message") as string,
    }

    const supabase = createClient()
    const { error: insertError } = await supabase.from("contact_messages").insert([data])

    if (insertError) {
      setError("Hubo un error al enviar tu mensaje. Por favor, intentá de nuevo.")
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-green-800">¡Mensaje enviado!</h3>
        <p className="text-green-700">Te responderemos a la brevedad.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact-name" className="text-base">
          Nombre *
        </Label>
        <Input id="contact-name" name="name" required placeholder="Tu nombre" className="text-base" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email" className="text-base">
          Email *
        </Label>
        <Input id="contact-email" name="email" type="email" required placeholder="tu@email.com" className="text-base" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone" className="text-base">
          Teléfono (opcional)
        </Label>
        <Input id="contact-phone" name="phone" type="tel" placeholder="+54 11 1234 5678" className="text-base" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject" className="text-base">
          Asunto
        </Label>
        <Select name="subject">
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Seleccioná un tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="taller">Taller de Memoria</SelectItem>
            <SelectItem value="clases">Clases Especiales</SelectItem>
            <SelectItem value="formacion">Formación Profesional</SelectItem>
            <SelectItem value="eventos">Eventos y Charlas</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-base">
          Mensaje *
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          placeholder="Escribí tu consulta..."
          className="min-h-[120px] text-base"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar mensaje"
        )}
      </Button>
    </form>
  )
}
