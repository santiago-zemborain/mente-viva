import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Plus } from "lucide-react"

export default async function EventosAdminPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*, reservations(count)")
    .eq("type", "event")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos y Charlas</h1>
          <p className="text-muted-foreground">Gestionar eventos públicos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo evento
        </Button>
      </div>

      <div className="grid gap-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>
                      {product.is_free ? "Gratuito" : `$${product.price.toLocaleString("es-AR")}`} -{" "}
                      {product.modality || "Presencial"}
                    </CardDescription>
                  </div>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Activo" : "Finalizado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{product.reservations?.[0]?.count || 0} inscriptos</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No hay eventos registrados</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
