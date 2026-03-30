-- ============================================================
-- MIGRATION 002 — Data Normalisation: Mitesh Kapadia
-- Sprint Module 1 · Galoras Platform
-- 2026-03-29
-- ============================================================
-- Seeds structured profile fields for Mitesh Kapadia:
-- slug, lifecycle_status, positioning_statement, methodology,
-- proof_points, tier, audience, engagement_format.
--
-- Strategy: looks up Mitesh's record via coach_applications
-- (by name) to get the user_id, then updates the coaches row.
-- Safe to re-run — uses UPDATE not INSERT.
-- ============================================================

DO $$
DECLARE
  v_coach_id  UUID;
  v_user_id   UUID;
BEGIN

  -- ── Step 1: Locate Mitesh's user_id via coach_applications ──
  SELECT ca.user_id INTO v_user_id
  FROM   public.coach_applications ca
  WHERE  lower(ca.full_name) LIKE '%mitesh%kapadia%'
    AND  ca.status = 'approved'
  ORDER  BY ca.created_at DESC
  LIMIT  1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '[migration_002] Mitesh Kapadia not found in coach_applications (approved). '
                 'Ensure his application has been approved and published via the admin panel '
                 'before re-running this migration.';
    RETURN;
  END IF;

  -- ── Step 2: Locate the coaches row ──────────────────────────
  SELECT id INTO v_coach_id
  FROM   public.coaches
  WHERE  user_id = v_user_id
  LIMIT  1;

  IF v_coach_id IS NULL THEN
    RAISE NOTICE '[migration_002] No coaches record found for Mitesh Kapadia (user_id: %). '
                 'Run the publish-coach edge function from the admin panel first, then '
                 're-run this migration.', v_user_id;
    RETURN;
  END IF;

  -- ── Step 3: Apply all structured fields ─────────────────────
  UPDATE public.coaches SET

    -- Slug — drives /coach/mitesh-kapadia URL
    slug                  = 'mitesh-kapadia',

    -- Lifecycle — makes profile publicly visible
    lifecycle_status      = 'published',

    -- Hero pull-quote shown at top of public profile
    positioning_statement = 'I help high-performing but overlooked leaders get seen, heard, and promoted—without working harder or losing who they are. By shifting how they show up, they gain the visibility, confidence, and executive presence needed to step into the roles they deserve.',

    -- Methodology — Pause, Pivot, Play framework
    methodology           = 'Mitesh''s coaching approach centers on helping high-performing leaders shift how they show up, rather than simply doing more. His work integrates executive presence, communication clarity, and emotional intelligence to address the real barriers to visibility and advancement—often rooted in internal narratives, misaligned identity, and unspoken workplace dynamics.

Through his Pause, Pivot, Play framework, clients first pause to quiet internal noise and identify what is truly holding them back. They then pivot into a more aligned and intentional leadership identity—one that reflects both their capability and ambition. Finally, they play full out by stepping into strategic visibility, confident communication, and leadership behaviors that earn recognition, respect, and advancement in complex organizational environments.',

    -- Tier
    tier                  = 'premium',

    -- Audience segments
    audience              = ARRAY['individual', 'enterprise', 'startup'],

    -- Engagement format
    engagement_format     = 'hybrid',

    -- Proof points — structured testimonials
    proof_points          = '[
      {
        "name":    "Senior Leader",
        "company": "Tech Company",
        "outcome": "Jumped two levels in title and secured a 20% salary increase",
        "quote":   "Jumped two levels in title and secured a 20% salary increase after redefining her leadership presence and visibility."
      },
      {
        "name":    "Director",
        "company": "Corporate Environment",
        "outcome": "Earned respect from senior leadership and began operating as a true peer",
        "quote":   "Earned respect from senior leadership and began operating as a true peer instead of being overlooked."
      },
      {
        "name":    "Executive",
        "company": "High-Growth Company",
        "outcome": "Reduced 15-hour workdays and gained recognition without overworking",
        "quote":   "Reduced 15-hour workdays, set clear boundaries, and gained recognition without overworking."
      },
      {
        "name":    "Laid-off Professional",
        "outcome": "Overcame self-doubt and successfully landed a desired role in a highly competitive market",
        "quote":   "Overcame self-doubt and successfully landed a desired role in a highly competitive market."
      }
    ]'::jsonb

  WHERE id = v_coach_id;

  RAISE NOTICE '[migration_002] ✓ Mitesh Kapadia structured profile seeded successfully (coach_id: %)', v_coach_id;

END;
$$;
