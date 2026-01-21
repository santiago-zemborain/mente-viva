import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Algo salió mal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {params?.error && <p className="text-sm text-muted-foreground">Error: {params.error}</p>}
            <p className="text-muted-foreground">Hubo un problema con la autenticación. Por favor, intentá de nuevo.</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/login">Volver a intentar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Ir al inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
