-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closed_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can update all profiles" ON public.profiles 
  FOR UPDATE USING (public.is_admin());

-- INTERVIEW REQUESTS POLICIES (public can insert, admin can see all)
CREATE POLICY "Anyone can create interview request" ON public.interview_requests 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view all interview requests" ON public.interview_requests 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can update interview requests" ON public.interview_requests 
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete interview requests" ON public.interview_requests 
  FOR DELETE USING (public.is_admin());

-- PRODUCTS POLICIES (public can read active, admin can manage)
CREATE POLICY "Anyone can view active products" ON public.products 
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can view all products" ON public.products 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can insert products" ON public.products 
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update products" ON public.products 
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete products" ON public.products 
  FOR DELETE USING (public.is_admin());

-- SCHEDULES POLICIES
CREATE POLICY "Anyone can view open schedules" ON public.schedules 
  FOR SELECT USING (is_closed = false);
CREATE POLICY "Admin can view all schedules" ON public.schedules 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can manage schedules" ON public.schedules 
  FOR ALL USING (public.is_admin());

-- RESERVATIONS POLICIES
CREATE POLICY "Users can view own reservations" ON public.reservations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON public.reservations 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admin can view all reservations" ON public.reservations 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can manage reservations" ON public.reservations 
  FOR ALL USING (public.is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "Users can view own payments" ON public.payments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservations r 
      WHERE r.id = reservation_id AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create payments" ON public.payments 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservations r 
      WHERE r.id = reservation_id AND (r.user_id = auth.uid() OR r.user_id IS NULL)
    )
  );
CREATE POLICY "Admin can view all payments" ON public.payments 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can manage payments" ON public.payments 
  FOR ALL USING (public.is_admin());

-- HOLIDAYS POLICIES (public read, admin manage)
CREATE POLICY "Anyone can view holidays" ON public.holidays 
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage holidays" ON public.holidays 
  FOR ALL USING (public.is_admin());

-- CLOSED DATES POLICIES
CREATE POLICY "Anyone can view closed dates" ON public.closed_dates 
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage closed dates" ON public.closed_dates 
  FOR ALL USING (public.is_admin());

-- CONTENT PAGES POLICIES
CREATE POLICY "Anyone can view content pages" ON public.content_pages 
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage content pages" ON public.content_pages 
  FOR ALL USING (public.is_admin());

-- SITE SETTINGS POLICIES
CREATE POLICY "Anyone can view site settings" ON public.site_settings 
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage site settings" ON public.site_settings 
  FOR ALL USING (public.is_admin());

-- AUDIT LOG POLICIES (admin only)
CREATE POLICY "Admin can view audit log" ON public.audit_log 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can insert audit log" ON public.audit_log 
  FOR INSERT WITH CHECK (public.is_admin());

-- WAITLIST POLICIES
CREATE POLICY "Anyone can join waitlist" ON public.waitlist 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view waitlist" ON public.waitlist 
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can manage waitlist" ON public.waitlist 
  FOR ALL USING (public.is_admin());
