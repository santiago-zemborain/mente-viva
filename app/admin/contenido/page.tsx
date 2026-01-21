import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Edit } from "lucide-react"

export default async function ContenidoPage() {
  const supabase = await createClient()

  const { data: pages } = await supabase.from("content_pages").select("*").order("slug", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contenido</h1>
        <p className="text-muted-foreground">Editar textos y contenido del sitio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages?.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {page.title}
              </CardTitle>
              <CardDescription>/{page.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Editar contenido
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
