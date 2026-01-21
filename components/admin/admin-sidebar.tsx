"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  GraduationCap,
  Users,
  Settings,
  FileText,
  History,
  CalendarOff,
  Mail,
  UserPlus,
  CalendarCheck,
} from "lucide-react"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Nuevos (Entrevistas)", href: "/admin/entrevistas", icon: UserPlus },
  { name: "Inscripciones", href: "/admin/inscripciones", icon: CalendarCheck },
  { name: "Mensajes", href: "/admin/mensajes", icon: Mail },
  { name: "Taller Regular", href: "/admin/taller", icon: Calendar },
  { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
  { name: "Clases Especiales", href: "/admin/clases-especiales", icon: Calendar },
  { name: "Formación", href: "/admin/formacion", icon: GraduationCap },
  { name: "Eventos", href: "/admin/eventos", icon: Users },
  { name: "Feriados/Fechas", href: "/admin/feriados", icon: CalendarOff },
  { name: "Contenido", href: "/admin/contenido", icon: FileText },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  { name: "Historial", href: "/admin/historial", icon: History },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-card lg:block">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <Image
          src="/images/logo-20mente-20viva-20espacio.png"
          alt="Mente Viva"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <div>
          <span className="font-bold text-primary">Mente Viva</span>
          <span className="block text-xs text-muted-foreground">Panel de Admin</span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4" aria-label="Navegación admin">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
