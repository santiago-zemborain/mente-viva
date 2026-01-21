import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewSpecialClassDialog } from "@/components/admin/new-special-class-dialog"
import { EditSpecialClassButton } from "@/components/admin/edit-special-class-button"
import { ExportReservationsButton } from "@/components/admin/export-reservations-button"

export default async function ClasesEspecialesAdminPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*, reservations(count)")
    .eq("type", "special")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clases Especiales</h1>
          <p className="text-muted-foreground">Gestionar clases especiales mensuales</p>
        </div>
        <NewSpecialClassDialog />
      </div>

      <div className="grid gap-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>{product.month_label || "Sin mes asignado"}</CardDescription>
                  </div>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {product.reservations?.[0]?.count || 0} inscriptos - ${product.price.toLocaleString("es-AR")}
                </div>
                <div className="flex gap-2">
                  <ExportReservationsButton productId={product.id} productTitle={product.title} />
                  <EditSpecialClassButton product={product} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay clases especiales registradas
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
