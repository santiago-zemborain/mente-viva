-- Allow guest reservations (user_id IS NULL) for unauthenticated users
-- This policy allows anyone to create reservations with user_id IS NULL
-- Note: This complements the existing "Users can create reservations" policy

-- Drop existing policy if it exists and recreate with explicit guest support
DROP POLICY IF EXISTS "Anyone can create guest reservations" ON public.reservations;

CREATE POLICY "Anyone can create guest reservations" ON public.reservations 
  FOR INSERT 
  WITH CHECK (user_id IS NULL);

