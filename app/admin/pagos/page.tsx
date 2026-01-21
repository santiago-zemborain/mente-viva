import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentList } from "@/components/admin/payment-list"

export default async function PagosPage() {
  const supabase = await createClient()

  // Verificar que el usuario sea admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>No autorizado</div>
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return <div>No autorizado</div>
  }

  // Query para pagos pendientes - sin join automático (hay dos relaciones posibles)
  const { data: pendingPaymentsData, error: pendingError } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Query para pagos confirmados
  const { data: confirmedPaymentsData, error: confirmedError } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "confirmed")
    .order("confirmed_at", { ascending: false })
    .limit(50)

  // Query para pagos rechazados
  const { data: rejectedPaymentsData, error: rejectedError } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "rejected")
    .order("updated_at", { ascending: false })
    .limit(50)

  // Obtener todas las reservas relacionadas con estos pagos
  // Hay dos formas: por reservation_id (pagos antiguos) o por payment_id (pagos nuevos)
  const allPaymentIds = [
    ...(pendingPaymentsData?.map((p) => p.id) || []),
    ...(confirmedPaymentsData?.map((p) => p.id) || []),
    ...(rejectedPaymentsData?.map((p) => p.id) || []),
  ]

  const allReservationIds = [
    ...(pendingPaymentsData?.map((p) => p.reservation_id).filter(Boolean) || []),
    ...(confirmedPaymentsData?.map((p) => p.reservation_id).filter(Boolean) || []),
    ...(rejectedPaymentsData?.map((p) => p.reservation_id).filter(Boolean) || []),
  ]

  // Buscar reservas por payment_id (nuevo método - pagos múltiples)
  const { data: reservationsByPaymentId } = await supabase
    .from("reservations")
    .select("*, products(title, type)")
    .in("payment_id", allPaymentIds)

  // Buscar reservas por reservation_id (método antiguo - pagos de una sola reserva)
  const { data: reservationsByReservationId } = await supabase
    .from("reservations")
    .select("*, products(title, type)")
    .in("id", allReservationIds)

  // Crear un mapa de payment_id -> reservas (puede haber múltiples)
  const reservationsByPaymentMap = new Map<string, any[]>()
  reservationsByPaymentId?.forEach((reservation) => {
    if (reservation.payment_id) {
      if (!reservationsByPaymentMap.has(reservation.payment_id)) {
        reservationsByPaymentMap.set(reservation.payment_id, [])
      }
      reservationsByPaymentMap.get(reservation.payment_id)!.push(reservation)
    }
  })

  // Crear un mapa de reservation_id -> reserva (una sola)
  const reservationsByIdMap = new Map<string, any>()
  reservationsByReservationId?.forEach((reservation) => {
    reservationsByIdMap.set(reservation.id, reservation)
  })

  // Obtener todos los user_ids únicos de las reservas
  const allUserIds = new Set<string>()
  reservationsByPaymentId?.forEach((r) => {
    if (r.user_id) allUserIds.add(r.user_id)
  })
  reservationsByReservationId?.forEach((r) => {
    if (r.user_id) allUserIds.add(r.user_id)
  })

  // Obtener perfiles para todos los user_ids
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, name, email, phone")
    .in("id", Array.from(allUserIds))

  // Crear un mapa de user_id -> profile
  const profilesMap = new Map(
    profilesData?.map((p) => [p.id, { name: p.name, email: p.email, phone: p.phone }]) || []
  )

  // Función helper para enriquecer reservas con profiles
  const enrichReservations = (reservations: any[]) => {
    return reservations.map((reservation) => ({
      ...reservation,
      profiles: reservation.user_id ? profilesMap.get(reservation.user_id) || null : null,
    }))
  }

  // Combinar datos: para cada pago, obtener sus reservas
  const pendingPayments = pendingPaymentsData?.map((payment) => {
    // Priorizar reservas por payment_id (nuevo método)
    let reservations = reservationsByPaymentMap.get(payment.id) || []
    
    // Si no hay reservas por payment_id, buscar por reservation_id (método antiguo)
    if (reservations.length === 0 && payment.reservation_id) {
      const reservation = reservationsByIdMap.get(payment.reservation_id)
      if (reservation) {
        reservations = [reservation]
      }
    }

    // Tomar la primera reserva para compatibilidad con el componente (que espera una sola)
    const firstReservation = reservations[0] || null

    return {
      ...payment,
      reservations: firstReservation
        ? {
            ...firstReservation,
            profiles: firstReservation.user_id ? profilesMap.get(firstReservation.user_id) || null : null,
          }
        : null,
      // Agregar información sobre múltiples reservas si las hay
      reservationsCount: reservations.length,
      allReservations: enrichReservations(reservations),
    }
  })

  const confirmedPayments = confirmedPaymentsData?.map((payment) => {
    let reservations = reservationsByPaymentMap.get(payment.id) || []
    if (reservations.length === 0 && payment.reservation_id) {
      const reservation = reservationsByIdMap.get(payment.reservation_id)
      if (reservation) {
        reservations = [reservation]
      }
    }
    const firstReservation = reservations[0] || null

    return {
      ...payment,
      reservations: firstReservation
        ? {
            ...firstReservation,
            profiles: firstReservation.user_id ? profilesMap.get(firstReservation.user_id) || null : null,
          }
        : null,
      reservationsCount: reservations.length,
      allReservations: enrichReservations(reservations),
    }
  })

  const rejectedPayments = rejectedPaymentsData?.map((payment) => {
    let reservations = reservationsByPaymentMap.get(payment.id) || []
    if (reservations.length === 0 && payment.reservation_id) {
      const reservation = reservationsByIdMap.get(payment.reservation_id)
      if (reservation) {
        reservations = [reservation]
      }
    }
    const firstReservation = reservations[0] || null

    return {
      ...payment,
      reservations: firstReservation
        ? {
            ...firstReservation,
            profiles: firstReservation.user_id ? profilesMap.get(firstReservation.user_id) || null : null,
          }
        : null,
      reservationsCount: reservations.length,
      allReservations: enrichReservations(reservations),
    }
  })

  if (pendingError) {
    console.error("Error fetching pending payments:", pendingError)
  }
  if (confirmedError) {
    console.error("Error fetching confirmed payments:", confirmedError)
  }
  if (rejectedError) {
    console.error("Error fetching rejected payments:", rejectedError)
  }

  // Mostrar errores si los hay
  const hasErrors = pendingError || confirmedError || rejectedError

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">Gestionar confirmaciones de pago</p>
      </div>

      {hasErrors && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <h3 className="font-semibold text-destructive">Errores al cargar pagos:</h3>
          {pendingError && (
            <p className="text-sm text-destructive">Pendientes: {pendingError.message}</p>
          )}
          {confirmedError && (
            <p className="text-sm text-destructive">Confirmados: {confirmedError.message}</p>
          )}
          {rejectedError && (
            <p className="text-sm text-destructive">Rechazados: {rejectedError.message}</p>
          )}
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pendingPayments?.length || 0})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmados ({confirmedPayments?.length || 0})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazados ({rejectedPayments?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <PaymentList payments={pendingPayments || []} status="pending" />
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          <PaymentList payments={confirmedPayments || []} status="confirmed" />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <PaymentList payments={rejectedPayments || []} status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
