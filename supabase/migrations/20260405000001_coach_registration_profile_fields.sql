-- Add coach profile fields to coach_registrations
-- These are collected during the registration completion step (pre-approval)
ALTER TABLE public.coach_registrations
  ADD COLUMN IF NOT EXISTS coach_current_role    TEXT,
  ADD COLUMN IF NOT EXISTS company               TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url          TEXT,
  ADD COLUMN IF NOT EXISTS bio                   TEXT,
  ADD COLUMN IF NOT EXISTS specialties           TEXT[],
  ADD COLUMN IF NOT EXISTS years_experience      INTEGER;
