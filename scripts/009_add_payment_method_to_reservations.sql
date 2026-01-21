-- Add payment_method column to reservations table
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('mercadopago', 'transfer'));

-- Update the constraint for payment_mode to also allow null values
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS reservations_payment_mode_check;

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_payment_mode_check 
CHECK (payment_mode IS NULL OR payment_mode IN ('monthly', 'single'));
