-- ============================================================
-- MIGRATION 004 — Reconcile Live Schema
-- Sprint Module 2 · Galoras Platform
-- 2026-03-29
-- ============================================================
-- Brings the live Supabase DB (which was bootstrapped by Lovable
-- and partially patched by hand) in line with the schema that
-- migrations 001–003 intended, adapted for the real live structure.
--
-- Safe to run multiple times: uses IF NOT EXISTS / IF EXISTS guards
-- and normalises data before adding CHECK constraints.
-- ============================================================

-- ============================================================
-- SECTION 1 — coaches: clean up junk columns
-- ============================================================

-- Drop the typo duplicate ("positioning _statement" has a space)
ALTER TABLE public.coaches
  DROP COLUMN IF EXISTS "positioning _statement";

-- Drop the capitalised duplicate (lower-case "tier" already exists)
ALTER TABLE public.coaches
  DROP COLUMN IF EXISTS "Tier";

-- ============================================================
-- SECTION 2 — coaches: add missing columns
-- ============================================================

ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS user_id                    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url                 TEXT,
  ADD COLUMN IF NOT EXISTS booking_url                TEXT,
  ADD COLUMN IF NOT EXISTS specialties                TEXT[],
  ADD COLUMN IF NOT EXISTS coach_background           TEXT,
  ADD COLUMN IF NOT EXISTS coach_background_detail    TEXT,
  ADD COLUMN IF NOT EXISTS coaching_experience_level  TEXT,
  ADD COLUMN IF NOT EXISTS leadership_experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS pillar_specialties         TEXT[],
  ADD COLUMN IF NOT EXISTS current_role               TEXT,
  ADD COLUMN IF NOT EXISTS coaching_philosophy        TEXT,
  ADD COLUMN IF NOT EXISTS primary_pillar             TEXT,
  ADD COLUMN IF NOT EXISTS secondary_pillars          TEXT[],
  ADD COLUMN IF NOT EXISTS industry_focus             TEXT,
  ADD COLUMN IF NOT EXISTS coaching_style             TEXT,
  ADD COLUMN IF NOT EXISTS engagement_model           TEXT,
  ADD COLUMN IF NOT EXISTS availability_status        TEXT;

-- ============================================================
-- SECTION 3 — coaches: normalise data before adding constraints
-- ============================================================

-- Normalise tier to lowercase (live data has 'Elite' instead of 'elite')
UPDATE public.coaches
SET tier = lower(tier)
WHERE tier IS NOT NULL AND tier <> lower(tier);

-- Set sensible defaults for existing rows where columns are NULL
UPDATE public.coaches
SET
  lifecycle_status = COALESCE(lifecycle_status, 'draft'),
  tier             = COALESCE(tier, 'standard'),
  proof_points     = COALESCE(proof_points, '[]'::jsonb),
  audience         = COALESCE(audience, '{}')
WHERE lifecycle_status IS NULL OR tier IS NULL OR proof_points IS NULL OR audience IS NULL;

-- ============================================================
-- SECTION 4 — coaches: add defaults and constraints
-- ============================================================

ALTER TABLE public.coaches
  ALTER COLUMN lifecycle_status SET DEFAULT 'draft',
  ALTER COLUMN tier             SET DEFAULT 'standard',
  ALTER COLUMN proof_points     SET DEFAULT '[]'::jsonb,
  ALTER COLUMN audience         SET DEFAULT '{}';

-- CHECK constraints (drop first if already present to keep idempotent)
ALTER TABLE public.coaches
  DROP CONSTRAINT IF EXISTS coaches_lifecycle_status_check,
  DROP CONSTRAINT IF EXISTS coaches_tier_check,
  DROP CONSTRAINT IF EXISTS coaches_engagement_format_check;

ALTER TABLE public.coaches
  ADD CONSTRAINT coaches_lifecycle_status_check
    CHECK (lifecycle_status IN (
      'draft','submitted','under_review','revision_required',
      'approved','published','rejected'
    )),
  ADD CONSTRAINT coaches_tier_check
    CHECK (tier IN ('elite','premium','standard')),
  ADD CONSTRAINT coaches_engagement_format_check
    CHECK (engagement_format IN ('online','in_person','hybrid'));

-- UNIQUE on slug (NULLs are not unique — existing NULLs are safe)
ALTER TABLE public.coaches
  DROP CONSTRAINT IF EXISTS coaches_slug_key;
ALTER TABLE public.coaches
  ADD CONSTRAINT coaches_slug_key UNIQUE (slug);

-- ============================================================
-- SECTION 5 — coaches: indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_coaches_slug
  ON public.coaches (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_coaches_lifecycle_status
  ON public.coaches (lifecycle_status)
  WHERE lifecycle_status = 'published';

CREATE INDEX IF NOT EXISTS idx_coaches_user_id
  ON public.coaches (user_id)
  WHERE user_id IS NOT NULL;

-- ============================================================
-- SECTION 6 — coaches: RLS (replace open-read with lifecycle gate)
-- ============================================================

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read"              ON public.coaches;
DROP POLICY IF EXISTS "Allow public select on coaches" ON public.coaches;
DROP POLICY IF EXISTS "Published coaches are publicly viewable" ON public.coaches;

-- Public: see published coaches (or legacy approved where lifecycle not yet set)
CREATE POLICY "Published coaches are publicly viewable"
  ON public.coaches FOR SELECT
  USING (lifecycle_status = 'published' OR status = 'approved');

-- Coaches: update their own row (matched by auth user_id)
DROP POLICY IF EXISTS "Coaches can update their own record" ON public.coaches;
CREATE POLICY "Coaches can update their own record"
  ON public.coaches FOR UPDATE
  USING (user_id = auth.uid());

-- Admins: full access
DROP POLICY IF EXISTS "Admins have full access to coaches" ON public.coaches;
CREATE POLICY "Admins have full access to coaches"
  ON public.coaches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- SECTION 7 — coach_applications: add missing columns
-- ============================================================

ALTER TABLE public.coach_applications
  ADD COLUMN IF NOT EXISTS user_id                      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS onboarding_token             TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_token_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_status            TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS avatar_url                   TEXT,
  ADD COLUMN IF NOT EXISTS booking_url                  TEXT,
  ADD COLUMN IF NOT EXISTS coaching_philosophy          TEXT,
  ADD COLUMN IF NOT EXISTS coach_background             TEXT,
  ADD COLUMN IF NOT EXISTS coach_background_detail      TEXT,
  ADD COLUMN IF NOT EXISTS certification_interest       TEXT,
  ADD COLUMN IF NOT EXISTS coaching_experience_years    INTEGER,
  ADD COLUMN IF NOT EXISTS leadership_experience_years  INTEGER,
  ADD COLUMN IF NOT EXISTS current_role                 TEXT,
  ADD COLUMN IF NOT EXISTS coaching_experience_level    TEXT,
  ADD COLUMN IF NOT EXISTS pillar_specialties           TEXT[],
  ADD COLUMN IF NOT EXISTS primary_join_reason          TEXT,
  ADD COLUMN IF NOT EXISTS commitment_level             TEXT,
  ADD COLUMN IF NOT EXISTS start_timeline               TEXT,
  ADD COLUMN IF NOT EXISTS excitement_note              TEXT,
  ADD COLUMN IF NOT EXISTS primary_pillar               TEXT,
  ADD COLUMN IF NOT EXISTS secondary_pillars            TEXT[],
  ADD COLUMN IF NOT EXISTS industry_focus               TEXT,
  ADD COLUMN IF NOT EXISTS coaching_style               TEXT,
  ADD COLUMN IF NOT EXISTS engagement_model             TEXT,
  ADD COLUMN IF NOT EXISTS availability_status          TEXT,
  ADD COLUMN IF NOT EXISTS founder_stage_focus          TEXT,
  ADD COLUMN IF NOT EXISTS founder_function_strength    TEXT,
  ADD COLUMN IF NOT EXISTS exec_level                   TEXT,
  ADD COLUMN IF NOT EXISTS exec_function                TEXT,
  ADD COLUMN IF NOT EXISTS specialties                  TEXT[],
  ADD COLUMN IF NOT EXISTS reviewer_notes               TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at                  TIMESTAMPTZ;

-- onboarding_status CHECK (add constraint, allow the 3 valid states)
ALTER TABLE public.coach_applications
  DROP CONSTRAINT IF EXISTS coach_applications_onboarding_status_check;
ALTER TABLE public.coach_applications
  ADD CONSTRAINT coach_applications_onboarding_status_check
    CHECK (onboarding_status IN ('pending','needs_changes','completed','published'));

-- Unique index on onboarding_token so token lookups are fast and tokens are distinct
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_applications_onboarding_token
  ON public.coach_applications (onboarding_token)
  WHERE onboarding_token IS NOT NULL;

-- ============================================================
-- SECTION 8 — coach_products: add missing columns
-- ============================================================

ALTER TABLE public.coach_products
  ADD COLUMN IF NOT EXISTS what_you_get  TEXT[],
  ADD COLUMN IF NOT EXISTS who_its_for   TEXT,
  ADD COLUMN IF NOT EXISTS duration_label TEXT,
  ADD COLUMN IF NOT EXISTS price_display  TEXT,
  ADD COLUMN IF NOT EXISTS price_cents    INTEGER,
  ADD COLUMN IF NOT EXISTS cta_label      TEXT NOT NULL DEFAULT 'Book Now',
  ADD COLUMN IF NOT EXISTS cta_url        TEXT,
  ADD COLUMN IF NOT EXISTS sort_order     INTEGER NOT NULL DEFAULT 0;

-- CHECK constraints
ALTER TABLE public.coach_products
  DROP CONSTRAINT IF EXISTS coach_products_type_check,
  DROP CONSTRAINT IF EXISTS coach_products_format_check;

ALTER TABLE public.coach_products
  ADD CONSTRAINT coach_products_type_check
    CHECK (product_type IN ('diagnostic','block','program','enterprise')),
  ADD CONSTRAINT coach_products_format_check
    CHECK (format IN ('online','in_person','hybrid'));

-- ============================================================
-- SECTION 9 — coach_products: indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_coach_products_coach_id
  ON public.coach_products (coach_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_coach_products_type
  ON public.coach_products (product_type)
  WHERE is_active = true;

-- ============================================================
-- SECTION 10 — coach_products: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_coach_products_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_coach_products_updated_at ON public.coach_products;
CREATE TRIGGER trg_coach_products_updated_at
  BEFORE UPDATE ON public.coach_products
  FOR EACH ROW EXECUTE FUNCTION public.set_coach_products_updated_at();

-- ============================================================
-- SECTION 11 — coach_products: RLS
-- ============================================================

ALTER TABLE public.coach_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active products are publicly viewable"  ON public.coach_products;
DROP POLICY IF EXISTS "Coaches can manage their own products"  ON public.coach_products;
DROP POLICY IF EXISTS "Admins can manage all products"         ON public.coach_products;

-- Public: see active products for published/approved coaches
CREATE POLICY "Active products are publicly viewable"
  ON public.coach_products FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_id
        AND (c.lifecycle_status = 'published' OR c.status = 'approved')
    )
  );

-- Coaches: manage their own products (matched via coaches.user_id)
CREATE POLICY "Coaches can manage their own products"
  ON public.coach_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_id
        AND c.user_id = auth.uid()
    )
  );

-- Admins: full access
CREATE POLICY "Admins can manage all products"
  ON public.coach_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- SECTION 12 — Column comments (data dictionary)
-- ============================================================

COMMENT ON COLUMN public.coaches.user_id IS
  'Links to auth.users. Set by publish-coach edge function. NULL until coach completes onboarding.';
COMMENT ON COLUMN public.coaches.booking_url IS
  'Calendly / other booking link. Shown as primary CTA on public profile.';
COMMENT ON COLUMN public.coaches.lifecycle_status IS
  'draft|submitted|under_review|revision_required|approved|published|rejected';
COMMENT ON COLUMN public.coaches.tier IS
  'Admin-assigned tier: elite|premium|standard';
COMMENT ON COLUMN public.coaches.proof_points IS
  'Structured testimonials JSONB array: [{name, role?, company?, outcome?, quote}]';

COMMENT ON COLUMN public.coach_applications.onboarding_token IS
  'Single-use token emailed to coach. Used by validate-onboarding-token function.';
COMMENT ON COLUMN public.coach_applications.onboarding_status IS
  'pending|needs_changes|completed|published. Drives onboarding flow gating.';
