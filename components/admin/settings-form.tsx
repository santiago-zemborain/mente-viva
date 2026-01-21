"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"

interface Field {
  name: string
  label: string
  type: "text" | "email" | "number" | "textarea"
}

interface SettingsFormProps {
  settingKey: string
  currentValue: Record<string, unknown>
  fields: Field[]
}

export function SettingsForm({ settingKey, currentValue, fields }: SettingsFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, unknown>>(currentValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (name: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("site_settings").upsert(
      {
        key: settingKey,
        value: values,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

    if (!error) {
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type={field.type}
            value={(values[field.name] as string | number) || ""}
            onChange={(e) =>
              handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)
            }
          />
        </div>
      ))}
      <Button type="submit" disabled={isLoading} className="gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar
      </Button>
    </form>
  )
}
