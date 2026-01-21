import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function VerificarEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">¡Revisá tu email!</CardTitle>
            <CardDescription className="text-base">
              Te enviamos un enlace de confirmación a tu correo electrónico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Hacé clic en el enlace que te enviamos para activar tu cuenta y poder iniciar sesión.
            </p>
            <p className="text-sm text-muted-foreground">
              Si no encontrás el email, revisá tu carpeta de spam o correo no deseado.
            </p>
            <Button asChild variant="outline" className="mt-4 bg-transparent">
              <Link href="/auth/login">Volver a iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
