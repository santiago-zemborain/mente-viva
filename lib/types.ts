export interface Profile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: "admin" | "user"
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface InterviewRequest {
  id: string
  name: string
  email: string
  phone: string
  preferred_schedule: string | null
  comments: string | null
  status: "pending" | "approved" | "rejected"
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  type: "trial" | "monthly" | "special" | "training" | "event"
  title: string
  description: string | null
  short_description: string | null
  price: number
  mp_payment_link: string | null
  requires_deposit: boolean
  deposit_percent: number
  capacity: number
  duration_minutes: number
  location: string | null
  instructor_name: string | null
  instructor_bio: string | null
  instructor_photo: string | null
  target_audience: string | null
  modality: "presencial" | "virtual" | "hibrido" | null
  is_active: boolean
  is_free: boolean
  month_label: string | null
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  product_id: string
  weekday: number | null
  time_slot: string | null
  specific_date: string | null
  start_at: string | null
  end_at: string | null
  capacity: number
  current_count: number
  is_closed: boolean
  created_at: string
}

export interface Reservation {
  id: string
  product_id: string | null
  schedule_id: string | null
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  status: "pending" | "confirmed" | "cancelled"
  terms_accepted_at: string | null
  selected_weekday: number | null
  selected_time: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  reservation_id: string
  method: "mp_link" | "transfer"
  status: "pending" | "confirmed" | "rejected"
  payment_type: "full" | "deposit" | "balance"
  receipt_url: string | null
  amount: number | null
  admin_notes: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface Holiday {
  id: string
  date: string
  label: string | null
  is_active: boolean
  created_at: string
}

export interface ContentPage {
  id: string
  slug: string
  title: string
  body: Record<string, unknown> | null
  last_updated: string
}

export interface SiteSetting {
  id: string
  key: string
  value: Record<string, unknown> | null
  updated_at: string
}

export interface AuditLog {
  id: string
  action: string
  entity: string | null
  entity_id: string | null
  admin_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export interface Waitlist {
  id: string
  product_id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

// Workshop schedule options
export const WORKSHOP_SCHEDULES = [
  { weekday: 3, time: "11:00", label: "Miércoles 11:00" },
  { weekday: 5, time: "16:00", label: "Viernes 16:00" },
] as const

export const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
