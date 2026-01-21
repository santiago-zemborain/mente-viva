-- Seed initial site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('bank_details', '{"bank": "Banco Nación", "account_holder": "Mente Viva", "cbu": "0000000000000000000000", "alias": "MENTE.VIVA.ESPACIO"}'),
  ('contact', '{"phone": "+54 11 2579 0108", "email": "mentevivaespacio@gmail.com", "whatsapp": "+5411 2579 0108"}'),
  ('workshop_price', '{"value": 25000, "currency": "ARS"}'),
  ('workshop_location', '{"name": "Palacio Balcarce", "address": "Quintana 161"}'),
  ('youtube_enabled', '{"enabled": false}')
ON CONFLICT (key) DO NOTHING;

-- Seed Argentine holidays for 2025-2026
INSERT INTO public.holidays (date, label, is_active) VALUES
  ('2025-01-01', 'Año Nuevo', true),
  ('2025-02-24', 'Carnaval', true),
  ('2025-02-25', 'Carnaval', true),
  ('2025-03-24', 'Día de la Memoria', true),
  ('2025-04-02', 'Día del Veterano', true),
  ('2025-04-18', 'Viernes Santo', true),
  ('2025-05-01', 'Día del Trabajador', true),
  ('2025-05-25', 'Día de la Revolución de Mayo', true),
  ('2025-06-16', 'Paso a la Inmortalidad del Gral. Güemes', true),
  ('2025-06-20', 'Paso a la Inmortalidad del Gral. Belgrano', true),
  ('2025-07-09', 'Día de la Independencia', true),
  ('2025-08-18', 'Paso a la Inmortalidad del Gral. San Martín', true),
  ('2025-10-12', 'Día del Respeto a la Diversidad Cultural', true),
  ('2025-11-24', 'Día de la Soberanía Nacional', true),
  ('2025-12-08', 'Inmaculada Concepción de María', true),
  ('2025-12-25', 'Navidad', true),
  ('2026-01-01', 'Año Nuevo', true)
ON CONFLICT (date) DO NOTHING;

-- Seed the main workshop product
INSERT INTO public.products (type, title, description, short_description, price, capacity, duration_minutes, location, is_active) VALUES
  ('monthly', 'Taller de Memoria Mente Viva', 
   'Un espacio de estimulación cognitiva grupal con enfoque en Terapia Ocupacional. Trabajamos la memoria, atención, lenguaje y funciones ejecutivas en un ambiente cálido y contenedor.',
   'Estimulación cognitiva grupal con enfoque en Terapia Ocupacional.',
   25000, 13, 90, 'Palacio Balcarce (Quintana 161)', true),
  ('trial', 'Clase de Prueba', 
   'Una clase para conocer el espacio, la metodología y el grupo antes de inscribirte al taller mensual.',
   'Conocé el taller antes de inscribirte.',
   25000, 13, 90, 'Palacio Balcarce (Quintana 161)', true)
ON CONFLICT DO NOTHING;

-- Seed content pages
INSERT INTO public.content_pages (slug, title, body) VALUES
  ('home', 'Inicio', '{"hero_title": "MENTE VIVA", "hero_subtitle": "Espacio de salud cognitiva", "hero_description": "Promovemos la salud cognitiva desde una mirada global y humana, integrando cuerpo, mente y entorno. Nuestro enfoque de Terapia Ocupacional busca potenciar tus capacidades y acompañarte en cada etapa de la vida."}'),
  ('about', 'Acerca de nosotros', '{"title": "Sobre Mente Viva", "description": "Somos un espacio dedicado a la salud integral con enfoque en Terapia Ocupacional. Creemos en el poder de la estimulación cognitiva y el acompañamiento profesional para mejorar la calidad de vida."}'),
  ('faq', 'Preguntas Frecuentes', '{"questions": []}'),
  ('privacy', 'Política de Privacidad', '{"content": ""}'),
  ('terms', 'Términos y Condiciones', '{"content": ""}'),
  ('payment-policy', 'Políticas de Pago y Cancelación', '{"content": ""}')
ON CONFLICT (slug) DO NOTHING;
