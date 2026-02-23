
-- Allow admin users to insert into onboarding_links
CREATE POLICY "Admins can insert onboarding links"
ON public.onboarding_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
