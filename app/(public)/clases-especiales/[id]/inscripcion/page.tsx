import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { SpecialClassRegistrationForm } from "@/components/forms/special-class-registration-form"

interface Props {
  params: Promise<{ id: string }>
}

// Esta página requiere datos dinámicos del producto, usar ISR
export const revalidate = 3600 // 1 hora

export default async function SpecialClassInscripcionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, reservations(count)")
    .eq("id", id)
    .eq("type", "special")
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  const reservationsCount = Array.isArray(product.reservations)
    ? product.reservations[0]?.count || 0
    : product.reservations?.count || 0
  const spotsLeft = product.capacity - reservationsCount

  if (spotsLeft <= 0) {
    redirect("/clases-especiales?error=sin_cupos")
  }

  return (
    <main className="py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
          {product.month_label && (
            <p className="text-muted-foreground text-lg">{product.month_label}</p>
          )}
        </div>

        <SpecialClassRegistrationForm product={product} />
      </div>
    </main>
  )
}

