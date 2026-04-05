-- ── coach_applications ─────────────────────────────────────────
ALTER TABLE public.coach_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert applications"
  ON public.coach_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read applications"
  ON public.coach_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON public.coach_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── user_roles ─────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read user roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ── bookings ───────────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can read their bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coaches
      WHERE coaches.id = bookings.coach_id
      AND coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());
