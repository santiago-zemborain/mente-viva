-- Add 'pending_payment' status to reservations table
-- This status is used when a reservation is created but payment is still pending

ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'cancelled'));

