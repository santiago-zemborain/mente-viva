import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InterviewList } from "@/components/admin/interview-list"

export default async function EntrevistasPage() {
  const supabase = await createClient()

  const { data: pendingInterviews } = await supabase
    .from("interview_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const { data: approvedInterviews } = await supabase
    .from("interview_requests")
    .select("*")
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(50)

  const { data: rejectedInterviews } = await supabase
    .from("interview_requests")
    .select("*")
    .eq("status", "rejected")
    .order("updated_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Entrevistas</h1>
        <p className="text-muted-foreground">Gestionar solicitudes de entrevista para el Taller de Memoria</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pendingInterviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <InterviewList interviews={pendingInterviews || []} status="pending" />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <InterviewList interviews={approvedInterviews || []} status="approved" />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <InterviewList interviews={rejectedInterviews || []} status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
