"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Trash2, Plus, Loader2 } from "lucide-react"

interface HolidayItem {
  id: string
  date: string
  label?: string
  reason?: string
  is_active?: boolean
}

interface HolidayManagerProps {
  type: "holiday" | "closed"
  items: HolidayItem[]
}

export function HolidayManager({ type, items }: HolidayManagerProps) {
  const router = useRouter()
  const [newDate, setNewDate] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) return

    setIsAdding(true)
    const supabase = createClient()

    const table = type === "holiday" ? "holidays" : "closed_dates"
    const data =
      type === "holiday"
        ? { date: newDate, label: newLabel || null, is_active: true }
        : { date: newDate, reason: newLabel || null }

    const { error } = await supabase.from(table).insert(data)

    if (!error) {
      setNewDate("")
      setNewLabel("")
      router.refresh()
    }

    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const table = type === "holiday" ? "holidays" : "closed_dates"

    await supabase.from(table).delete().eq("id", id)
    router.refresh()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1" />
        <Input
          placeholder={type === "holiday" ? "Nombre del feriado" : "Motivo"}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isAdding || !newDate} size="icon">
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      <div className="max-h-80 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatDate(item.date)}</p>
                {(item.label || item.reason) && (
                  <p className="text-sm text-muted-foreground">{item.label || item.reason}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground">No hay fechas registradas</p>}
      </div>
    </div>
  )
}
