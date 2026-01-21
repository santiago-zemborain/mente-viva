"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Home, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"

const mobileNav = [
  { name: "Dashboard", href: "/admin" },
  { name: "Entrevistas", href: "/admin/entrevistas" },
  { name: "Taller Regular", href: "/admin/taller" },
  { name: "Pagos", href: "/admin/pagos" },
  { name: "Clases Especiales", href: "/admin/clases-especiales" },
  { name: "Formación", href: "/admin/formacion" },
  { name: "Eventos", href: "/admin/eventos" },
  { name: "Configuración", href: "/admin/configuracion" },
]

export function AdminHeader({ userName }: { userName: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <nav className="mt-8 flex flex-col gap-2">
              {mobileNav.map((item) => (
                <Link key={item.name} href={item.href} className="rounded-lg px-3 py-2 text-base hover:bg-muted">
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">Panel de Administración</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">{userName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Ir al sitio
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
