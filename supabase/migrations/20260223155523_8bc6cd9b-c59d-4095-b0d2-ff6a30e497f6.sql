
-- Create onboarding_links table
CREATE TABLE public.onboarding_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id text NOT NULL UNIQUE,
  application_id uuid NOT NULL REFERENCES public.coach_applications(id),
  onboarding_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  used_at timestamptz
);

-- Enable RLS with no public policies (service-role only)
ALTER TABLE public.onboarding_links ENABLE ROW LEVEL SECURITY;

-- Add onboarding_short_id to coach_applications
ALTER TABLE public.coach_applications ADD COLUMN IF NOT EXISTS onboarding_short_id text;
