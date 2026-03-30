-- ============================================================
-- MIGRATION 006 — Seed Mitesh Kapadia Products
-- Sprint Module 2 · Galoras Platform
-- 2026-03-29
-- ============================================================
-- Seeds 4 enterprise products for Mitesh Kapadia:
--   1. Performance Diagnostic          (diagnostic — entry point)
--   2. Leadership Performance Block    (block      — team level, core revenue)
--   3. Leadership Visibility Program   (enterprise — department level)
--   4. Sport of Business Transformation(enterprise — org-wide)
--
-- All use enquiry / request-proposal flow (cta_url = NULL).
-- Safe to re-run: deletes and re-inserts on coach_id match.
-- ============================================================

DO $$
DECLARE
  v_coach_id UUID;
BEGIN

  -- Locate Mitesh's coaches row by slug
  SELECT id INTO v_coach_id
  FROM   public.coaches
  WHERE  slug = 'mitesh-kapadia'
  LIMIT  1;

  IF v_coach_id IS NULL THEN
    RAISE EXCEPTION '[migration_006] Mitesh Kapadia not found in coaches table. '
                    'Run migration_005 first.';
  END IF;

  -- Remove any previously seeded products for Mitesh (idempotent)
  DELETE FROM public.coach_products WHERE coach_id = v_coach_id;

  -- ── Product 1: Performance Diagnostic ───────────────────────────────────
  INSERT INTO public.coach_products (
    coach_id, product_type, title, summary,
    what_you_get, who_its_for,
    duration_label, format, pricing_band,
    price_display, price_cents,
    cta_label, cta_url, sort_order, is_active
  ) VALUES (
    v_coach_id,
    'diagnostic',
    'Performance Diagnostic – Leadership Visibility & Influence',
    'A targeted leadership diagnostic designed to identify where high-potential leaders are under-leveraged within the organisation. Mitesh assesses visibility gaps, communication effectiveness, and internal influence dynamics that impact promotion readiness and leadership effectiveness. The session surfaces hidden performance blockers—often not capability, but perception and positioning—and provides clear direction to elevate executive presence and organisational impact.',
    ARRAY[
      'Leadership visibility and perception assessment',
      'Identification of key performance and influence blockers',
      'Executive presence and communication gap analysis',
      'Strategic recommendations for immediate improvement',
      'Summary report and debrief for leader (and sponsor if applicable)'
    ],
    'High-potential leaders who are capable but under-leveraged within their organisation',
    '90–120 min session + summary report',
    'hybrid',
    'enterprise',
    NULL,   -- enquiry only
    NULL,
    'Enquire',
    NULL,
    1,
    true
  );

  -- ── Product 2: Performance Block – Team Level ────────────────────────────
  INSERT INTO public.coach_products (
    coach_id, product_type, title, summary,
    what_you_get, who_its_for,
    duration_label, format, pricing_band,
    price_display, price_cents,
    cta_label, cta_url, sort_order, is_active
  ) VALUES (
    v_coach_id,
    'block',
    'Leadership Performance Block – Team',
    'A structured leadership development engagement built on Mitesh''s Pause, Pivot, Play framework, adapted for teams. Focuses on transforming how leaders show up—strengthening executive presence, communication clarity, and influence in high-stakes situations. Leaders navigate internal dynamics, align identity with leadership expectations, and operate with the confidence and strategic visibility that drives recognition and advancement.',
    ARRAY[
      'Initial team diagnostic (individual + group insights)',
      'Weekly group coaching sessions (60–90 min)',
      'Executive presence and communication frameworks',
      'Real-time application to team dynamics and challenges',
      'Midpoint recalibration session',
      'Final team performance summary and recommendations'
    ],
    'Small leadership teams and pods (5–10 leaders)',
    '6–8 weeks · Hybrid',
    'hybrid',
    'enterprise',
    '$7,500 – $15,000',
    NULL,   -- range pricing — no fixed cents
    'Enquire',
    NULL,
    2,
    true
  );

  -- ── Product 3: Department-Level Program ─────────────────────────────────
  INSERT INTO public.coach_products (
    coach_id, product_type, title, summary,
    what_you_get, who_its_for,
    duration_label, format, pricing_band,
    price_display, price_cents,
    cta_label, cta_url, sort_order, is_active
  ) VALUES (
    v_coach_id,
    'enterprise',
    'Leadership Visibility & Influence Program – Department',
    'Build a consistent leadership standard across a function—improving influence, decision-making, and cross-functional credibility. Cohort-based delivery with targeted 1:1 sessions for senior leaders, workshops on executive presence, and a department-specific leadership visibility playbook.',
    ARRAY[
      'Department-wide leadership diagnostic and heatmap',
      'Cohort-based coaching sessions (group learning)',
      'Targeted 1:1 sessions for senior leaders',
      'Workshops: executive presence, communication, and influence',
      'Cross-functional alignment exercises',
      'Leadership visibility playbook (department-specific)',
      'Progress tracking and behavioural shift indicators',
      'Final report and leadership roadmap'
    ],
    'Department leaders — Directors to VPs (10–25 participants)',
    '8–12 weeks · Hybrid cohort',
    'hybrid',
    'enterprise',
    '$20,000 – $50,000',
    NULL,
    'Request Proposal',
    NULL,
    3,
    true
  );

  -- ── Product 4: Org-Wide Transformation ──────────────────────────────────
  INSERT INTO public.coach_products (
    coach_id, product_type, title, summary,
    what_you_get, who_its_for,
    duration_label, format, pricing_band,
    price_display, price_cents,
    cta_label, cta_url, sort_order, is_active
  ) VALUES (
    v_coach_id,
    'enterprise',
    'Sport of Business – Leadership Performance Transformation',
    'Transform how leadership operates across the organisation—aligning identity, communication, and performance to drive business outcomes at scale. Mitesh''s Sport of Business methodology integrates executive coaching, cohort programs, and strategic advisory to build a high-performance leadership culture across all levels.',
    ARRAY[
      'Executive diagnostic (C-suite and senior leadership)',
      'Organisational leadership visibility and influence mapping',
      'Executive coaching (C-suite and senior leaders)',
      'Leadership cohort programs across levels',
      'Sport of Business workshops and offsites',
      'Communication and culture alignment frameworks',
      'Strategic advisory on leadership positioning and org dynamics',
      'KPI alignment: promotion readiness, retention, leadership effectiveness',
      'Final transformation report and scale recommendations'
    ],
    'Executive teams and multi-level leadership (25–100+ leaders)',
    '3–6 months · Phased rollout',
    'hybrid',
    'elite',
    '$75,000 – $250,000+',
    NULL,
    'Request Proposal',
    NULL,
    4,
    true
  );

  RAISE NOTICE '[migration_006] ✓ 4 products seeded for Mitesh Kapadia (coach_id: %)', v_coach_id;

END;
$$;
