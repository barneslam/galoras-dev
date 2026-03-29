-- ============================================================
-- MIGRATION 001 — Structured Profile Core
-- Sprint Module 1 · Galoras Platform
-- 2026-03-29
-- ============================================================
-- Adds lifecycle_status, slug, positioning_statement, methodology,
-- proof_points, tier, audience, and engagement_format to the
-- coaches table. Updates RLS to gate public visibility on
-- lifecycle_status = 'published'. Adds is_active to categories.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add structured columns to coaches table
-- ------------------------------------------------------------

ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (lifecycle_status IN ('draft','submitted','under_review','revision_required','approved','published','rejected')),
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS positioning_statement TEXT,
  ADD COLUMN IF NOT EXISTS methodology TEXT,
  ADD COLUMN IF NOT EXISTS proof_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'standard'
    CHECK (tier IN ('elite','premium','standard')),
  ADD COLUMN IF NOT EXISTS audience TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engagement_format TEXT
    CHECK (engagement_format IN ('online','in_person','hybrid'));

-- Index on lifecycle_status for fast directory queries
CREATE INDEX IF NOT EXISTS idx_coaches_lifecycle_status
  ON public.coaches (lifecycle_status);

-- Index on slug for fast profile lookups
CREATE INDEX IF NOT EXISTS idx_coaches_slug
  ON public.coaches (slug)
  WHERE slug IS NOT NULL;

-- ------------------------------------------------------------
-- 2. Backfill lifecycle_status for existing published coaches
--    Any coach currently with status = 'approved' and
--    onboarding_status = 'published' is promoted to published.
-- ------------------------------------------------------------

UPDATE public.coaches c
SET lifecycle_status = 'published'
WHERE c.status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.coach_applications ca
    WHERE ca.user_id = c.user_id
      AND ca.onboarding_status = 'published'
  );

-- Remaining approved coaches (onboarding not yet published) → 'approved'
UPDATE public.coaches c
SET lifecycle_status = 'approved'
WHERE lifecycle_status = 'draft'
  AND c.status = 'approved';

-- ------------------------------------------------------------
-- 3. Update RLS on coaches table
--    Public can see coaches where lifecycle_status = 'published'.
--    Pre-migration coaches (lifecycle_status still null or draft
--    but status = approved) remain visible via OR clause so
--    existing profiles are not silently hidden mid-migration.
-- ------------------------------------------------------------

-- Drop the old status-only policy
DROP POLICY IF EXISTS "Approved coaches are viewable by everyone" ON public.coaches;

-- New policy: lifecycle_status drives public visibility
CREATE POLICY "Published coaches are viewable by everyone"
  ON public.coaches FOR SELECT
  USING (
    lifecycle_status = 'published'
    OR (status = 'approved' AND lifecycle_status IS NULL)
    OR auth.uid() = user_id
  );

-- ------------------------------------------------------------
-- 4. Add is_active flag to categories (used by directory query)
-- ------------------------------------------------------------

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- All existing categories stay active
UPDATE public.categories SET is_active = true WHERE is_active IS NULL;

-- ------------------------------------------------------------
-- 5. proof_points format comment (for data dictionary)
-- ------------------------------------------------------------
-- proof_points is a JSONB array of objects with the shape:
-- [
--   {
--     "name":    "Client Full Name",
--     "role":    "Job Title",          -- optional
--     "company": "Company Name",       -- optional
--     "outcome": "One-line result",    -- optional
--     "quote":   "Verbatim testimonial text"
--   }
-- ]
COMMENT ON COLUMN public.coaches.proof_points IS
  'Structured testimonials array: [{name, role?, company?, outcome?, quote}]';

COMMENT ON COLUMN public.coaches.lifecycle_status IS
  '7-state coach lifecycle: draft|submitted|under_review|revision_required|approved|published|rejected';

COMMENT ON COLUMN public.coaches.positioning_statement IS
  'Hero pull-quote shown at top of public profile. One to three sentences.';

COMMENT ON COLUMN public.coaches.methodology IS
  'Coach methodology / approach description shown on public profile.';

COMMENT ON COLUMN public.coaches.tier IS
  'Pricing/visibility tier assigned by admin: elite|premium|standard';

COMMENT ON COLUMN public.coaches.audience IS
  'Target audience segments: individual|sme|enterprise|startup|nonprofit|government';

COMMENT ON COLUMN public.coaches.slug IS
  'URL-safe identifier used in /coach/:slug routing. Generated from full_name.';
