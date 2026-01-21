-- Add selected_date column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS selected_date DATE;

-- Add payment_mode column to reservations table
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS payment_mode TEXT CHECK (payment_mode IN ('monthly', 'single'));
