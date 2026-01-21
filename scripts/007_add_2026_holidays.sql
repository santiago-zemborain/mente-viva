-- Add complete Argentine holidays for 2026
INSERT INTO public.holidays (date, label, is_active) VALUES
  ('2026-01-01', 'Año Nuevo', true),
  ('2026-02-16', 'Carnaval', true),
  ('2026-02-17', 'Carnaval', true),
  ('2026-03-24', 'Día de la Memoria', true),
  ('2026-04-02', 'Día del Veterano', true),
  ('2026-04-03', 'Viernes Santo', true),
  ('2026-05-01', 'Día del Trabajador', true),
  ('2026-05-25', 'Día de la Revolución de Mayo', true),
  ('2026-06-15', 'Paso a la Inmortalidad del Gral. Güemes', true),
  ('2026-06-20', 'Paso a la Inmortalidad del Gral. Belgrano', true),
  ('2026-07-09', 'Día de la Independencia', true),
  ('2026-08-17', 'Paso a la Inmortalidad del Gral. San Martín', true),
  ('2026-10-12', 'Día del Respeto a la Diversidad Cultural', true),
  ('2026-11-23', 'Día de la Soberanía Nacional', true),
  ('2026-12-08', 'Inmaculada Concepción de María', true),
  ('2026-12-25', 'Navidad', true)
ON CONFLICT (date) DO NOTHING;
