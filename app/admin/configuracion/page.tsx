import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "@/components/admin/settings-form"

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase.from("site_settings").select("*")

  const settingsMap: Record<string, Record<string, unknown>> = {}
  settings?.forEach((s) => {
    settingsMap[s.key] = s.value as Record<string, unknown>
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Configuraciones generales del sitio</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos bancarios</CardTitle>
            <CardDescription>Información que se muestra para pagos por transferencia</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settingKey="bank_details"
              currentValue={settingsMap.bank_details || {}}
              fields={[
                { name: "bank", label: "Banco", type: "text" },
                { name: "account_holder", label: "Titular", type: "text" },
                { name: "cbu", label: "CBU", type: "text" },
                { name: "alias", label: "Alias", type: "text" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
            <CardDescription>Información de contacto del sitio</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settingKey="contact"
              currentValue={settingsMap.contact || {}}
              fields={[
                { name: "phone", label: "Teléfono", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "whatsapp", label: "WhatsApp", type: "text" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precios del taller</CardTitle>
            <CardDescription>Valor por clase del Taller de Memoria</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settingKey="workshop_price"
              currentValue={settingsMap.workshop_price || {}}
              fields={[{ name: "value", label: "Precio (ARS)", type: "number" }]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
