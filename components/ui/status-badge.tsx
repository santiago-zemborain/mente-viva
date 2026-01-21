import { cn } from "@/lib/utils"

type Status = "pending" | "confirmed" | "rejected" | "cancelled" | "deposit_paid" | "balance_pending"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmado",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  deposit_paid: {
    label: "Seña pagada",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  balance_pending: {
    label: "Saldo pendiente",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
