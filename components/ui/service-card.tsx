import type React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  badge?: string
  disabled?: boolean
  className?: string
}

export function ServiceCard({ title, description, href, icon, badge, disabled, className }: ServiceCardProps) {
  const CardWrapper = disabled ? "div" : Link

  return (
    <CardWrapper
      href={disabled ? undefined : href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-all sm:p-6",
        disabled ? "cursor-not-allowed opacity-60" : "hover:border-primary hover:shadow-lg",
        className,
      )}
    >
      {badge && (
        <span className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary sm:right-4 sm:top-4 sm:px-3 sm:text-sm">
          {badge}
        </span>
      )}
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mb-4 sm:h-14 sm:w-14">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold sm:text-xl">{title}</h3>
      <p className="mb-3 flex-1 text-sm text-muted-foreground sm:mb-4 sm:text-base">{description}</p>
      {!disabled && (
        <div className="flex items-center text-sm font-semibold text-primary sm:text-base">
          Ver más
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
        </div>
      )}
    </CardWrapper>
  )
}
