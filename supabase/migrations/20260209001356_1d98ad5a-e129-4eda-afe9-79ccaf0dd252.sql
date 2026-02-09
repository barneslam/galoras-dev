-- Add RLS policies for admins to manage coach applications

-- Allow admins to view all coach applications
CREATE POLICY "Admins can view all coach applications"
ON public.coach_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update coach applications (approve/reject)
CREATE POLICY "Admins can update coach applications"
ON public.coach_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));