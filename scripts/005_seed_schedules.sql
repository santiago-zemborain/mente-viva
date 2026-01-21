-- Seed workshop schedules
-- First get the product IDs
DO $$
DECLARE
  monthly_product_id UUID;
  trial_product_id UUID;
BEGIN
  SELECT id INTO monthly_product_id FROM public.products WHERE type = 'monthly' AND title LIKE '%Taller de Memoria%' LIMIT 1;
  SELECT id INTO trial_product_id FROM public.products WHERE type = 'trial' LIMIT 1;

  -- Insert schedules for monthly workshop (Miércoles 11hs y Viernes 16hs)
  IF monthly_product_id IS NOT NULL THEN
    INSERT INTO public.schedules (product_id, weekday, time_slot, capacity, current_count, is_closed) VALUES
      (monthly_product_id, 3, '11:00', 13, 0, false),  -- Miércoles 11hs
      (monthly_product_id, 5, '16:00', 13, 0, false);  -- Viernes 16hs
  END IF;

  -- Insert schedules for trial class
  IF trial_product_id IS NOT NULL THEN
    INSERT INTO public.schedules (product_id, weekday, time_slot, capacity, current_count, is_closed) VALUES
      (trial_product_id, 3, '11:00', 13, 0, false),
      (trial_product_id, 5, '16:00', 13, 0, false);
  END IF;
END $$;
