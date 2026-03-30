-- ============================================================
-- MIGRATION 005 — Seed Mitesh Kapadia (coaches row)
-- Sprint Module 1 · Galoras Platform
-- 2026-03-29
-- ============================================================
-- Inserts Mitesh Kapadia's public profile into the coaches table.
-- Uses ON CONFLICT (slug) DO UPDATE so it is safe to re-run.
--
-- NOTE: user_id is left NULL. Once Mitesh's Supabase auth account
-- is created, update coaches SET user_id = '<uuid>'
-- WHERE slug = 'mitesh-kapadia';
-- ============================================================

INSERT INTO public.coaches (
  display_name,
  slug,
  status,
  lifecycle_status,
  tier,
  engagement_format,
  audience,
  positioning_statement,
  methodology,
  proof_points
)
VALUES (
  'Mitesh Kapadia',
  'mitesh-kapadia',
  'approved',
  'published',
  'premium',
  'hybrid',
  ARRAY['individual', 'enterprise', 'startup'],

  -- Hero pull-quote
  'I help high-performing but overlooked leaders get seen, heard, and promoted—without working harder or losing who they are. By shifting how they show up, they gain the visibility, confidence, and executive presence needed to step into the roles they deserve.',

  -- Methodology — Pause, Pivot, Play framework
  E'Mitesh''s coaching approach centers on helping high-performing leaders shift how they show up, rather than simply doing more. His work integrates executive presence, communication clarity, and emotional intelligence to address the real barriers to visibility and advancement—often rooted in internal narratives, misaligned identity, and unspoken workplace dynamics.\n\nThrough his Pause, Pivot, Play framework, clients first pause to quiet internal noise and identify what is truly holding them back. They then pivot into a more aligned and intentional leadership identity—one that reflects both their capability and ambition. Finally, they play full out by stepping into strategic visibility, confident communication, and leadership behaviors that earn recognition, respect, and advancement in complex organizational environments.',

  -- Proof points
  '[
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
)
ON CONFLICT (slug) DO UPDATE SET
  display_name          = EXCLUDED.display_name,
  status                = EXCLUDED.status,
  lifecycle_status      = EXCLUDED.lifecycle_status,
  tier                  = EXCLUDED.tier,
  engagement_format     = EXCLUDED.engagement_format,
  audience              = EXCLUDED.audience,
  positioning_statement = EXCLUDED.positioning_statement,
  methodology           = EXCLUDED.methodology,
  proof_points          = EXCLUDED.proof_points,
  updated_at            = now();

-- Confirm
DO $$
DECLARE v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.coaches WHERE slug = 'mitesh-kapadia';
  IF v_id IS NULL THEN
    RAISE EXCEPTION '[migration_005] Failed to seed Mitesh Kapadia';
  ELSE
    RAISE NOTICE '[migration_005] ✓ Mitesh Kapadia seeded (coach_id: %)', v_id;
  END IF;
END;
$$;
