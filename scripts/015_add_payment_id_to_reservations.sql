-- Add payment_id column to reservations table
-- This allows multiple reservations to be associated with a single payment
-- (e.g., when buying a monthly pack of classes)

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-- Make reservation_id nullable in payments table
-- For single reservation payments, reservation_id will still be used
-- For multiple reservation payments, reservation_id will be null and all reservations will have the same payment_id
ALTER TABLE public.payments
ALTER COLUMN reservation_id DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_payment_id ON public.reservations(payment_id);

