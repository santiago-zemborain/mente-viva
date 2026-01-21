"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"

export function InterviewRequestForm() {
  const router = useRouter()
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
      phone: formData.get("phone") as string,
      comments: formData.get("comments") as string,
    }

    const supabase = createClient()

    const { error: insertError } = await supabase.from("interview_requests").insert([data])

    if (insertError) {
      setError("Hubo un error al enviar tu solicitud. Por favor, intentá de nuevo.")
      setIsLoading(false)
      return
    }

    try {
      await fetch("/api/send-interview-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } catch (emailError) {
      // Don't fail the form submission if email fails
      console.log("[v0] Email notification failed, but form submitted successfully")
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">¡Solicitud enviada!</CardTitle>
          <CardDescription className="text-base text-green-700">
            Recibimos tu solicitud de entrevista. Nos pondremos en contacto pronto para coordinar el día y horario.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-green-700">
            Revisá tu email y celular, te contactaremos en las próximas 48 horas hábiles.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de contacto</CardTitle>
        <CardDescription>Completá tus datos para que podamos contactarte</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre completo *
            </Label>
            <Input id="name" name="name" required placeholder="Tu nombre y apellido" className="text-base" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">
              Celular *
            </Label>
            <div className="flex gap-2">
              <div className="flex h-10 w-16 items-center justify-center rounded-md border border-input bg-muted px-3 text-base text-muted-foreground">
                +54
              </div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="11 1234 5678"
                className="flex-1 text-base"
              />
            </div>
            <p className="text-sm text-muted-foreground">Incluí el código de área sin el 0</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email *
            </Label>
            <Input id="email" name="email" type="email" required placeholder="tu@email.com" className="text-base" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments" className="text-base">
              Comentarios adicionales (opcional)
            </Label>
            <Textarea
              id="comments"
              name="comments"
              placeholder="¿Hay algo que quieras contarnos antes de la entrevista?"
              className="min-h-[100px] text-base"
            />
            <p className="mt-3 text-sm text-muted-foreground italic">
              Nos estaremos comunicando con vos para conocer lo que estás buscando y orientarte hacia el espacio más
              adecuado para tus necesidades.
            </p>
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
              "Enviar solicitud de entrevista"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Al enviar, aceptás que nos comuniquemos con vos por email y celular.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
