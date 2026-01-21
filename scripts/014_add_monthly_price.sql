-- Add monthly_price column to products table
-- This allows each class to have a different price when purchased as part of a monthly pack

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS monthly_price DECIMAL(10,2);

-- Add comment to explain the column
COMMENT ON COLUMN public.products.monthly_price IS 'Precio por clase cuando se compra el pack mensual completo. Si es NULL, se usa el precio normal (price).';

