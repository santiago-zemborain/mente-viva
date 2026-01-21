-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can send contact message" ON public.contact_messages 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view contact messages" ON public.contact_messages 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can update contact messages" ON public.contact_messages 
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete contact messages" ON public.contact_messages 
  FOR DELETE USING (public.is_admin());
