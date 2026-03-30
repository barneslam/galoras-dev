-- ============================================================
-- MIGRATION 003 — Product Layer Core: coach_products table
-- Sprint Module 2 · Galoras Platform
-- 2026-03-29
-- ============================================================
-- Creates the coach_products table. Each row represents one
-- purchasable offering a coach makes available on their profile.
-- Supports diagnostics, coaching blocks, programs, and enterprise.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create coach_products table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.coach_products (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id         UUID        NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,

  -- Product classification
  product_type     TEXT        NOT NULL
    CHECK (product_type IN ('diagnostic', 'block', 'program', 'enterprise')),

  -- Display content
  title            TEXT        NOT NULL,
  summary          TEXT,
  what_you_get     TEXT[],           -- bullet list of deliverables
  who_its_for      TEXT,             -- short audience qualifier

  -- Engagement details
  duration_label   TEXT,             -- human-readable: "60 mins", "4 sessions over 6 weeks"
  duration_minutes INTEGER,          -- machine-readable for sorting / filtering
  format           TEXT
    CHECK (format IN ('online', 'in_person', 'hybrid')),

  -- Pricing
  pricing_band     TEXT,             -- admin tier: 'standard' | 'premium' | 'elite'
  price_display    TEXT,             -- shown on card: "$500" or "$1,500 – $3,000"
  price_cents      INTEGER,          -- exact price in cents (NULL = enquiry / custom)

  -- CTA
  cta_label        TEXT        NOT NULL DEFAULT 'Book Now',
  cta_url          TEXT,             -- NULL until Stripe checkout is wired (Module 3)

  -- Control
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  sort_order       INTEGER     NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_coach_products_coach_id
  ON public.coach_products (coach_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_coach_products_type
  ON public.coach_products (product_type)
  WHERE is_active = true;

-- ------------------------------------------------------------
-- 3. Auto-update updated_at
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_coach_products_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_coach_products_updated_at
  BEFORE UPDATE ON public.coach_products
  FOR EACH ROW EXECUTE FUNCTION public.set_coach_products_updated_at();

-- ------------------------------------------------------------
-- 4. RLS policies
-- ------------------------------------------------------------

ALTER TABLE public.coach_products ENABLE ROW LEVEL SECURITY;

-- Public can view active products for published coaches
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

-- Coaches can manage their own products
CREATE POLICY "Coaches can manage their own products"
  ON public.coach_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_id
        AND c.user_id = auth.uid()
    )
  );

-- Admins can manage all products
CREATE POLICY "Admins can manage all products"
  ON public.coach_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 5. Column comments (data dictionary)
-- ------------------------------------------------------------

COMMENT ON TABLE  public.coach_products IS
  'Purchasable offerings a coach makes available on their public profile.';
COMMENT ON COLUMN public.coach_products.product_type IS
  'diagnostic | block | program | enterprise';
COMMENT ON COLUMN public.coach_products.what_you_get IS
  'Bulleted deliverables list shown on product card e.g. ["60-min session","Written summary","Action plan"]';
COMMENT ON COLUMN public.coach_products.pricing_band IS
  'Admin-assigned tier: standard | premium | elite. Mirrors coaches.tier.';
COMMENT ON COLUMN public.coach_products.price_cents IS
  'Exact price in cents. NULL means enquiry-based or custom pricing.';
COMMENT ON COLUMN public.coach_products.cta_url IS
  'Stripe checkout URL (populated in Module 3). NULL shows "Enquire" CTA instead.';
