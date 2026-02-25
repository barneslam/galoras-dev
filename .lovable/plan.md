

## Add Structured Intake Columns with Indexes and Update All Touchpoints

### 1. Database Migration

Add 10 new columns to `coach_applications` and indexes for filterability:

```sql
ALTER TABLE public.coach_applications
  ADD COLUMN IF NOT EXISTS primary_pillar TEXT,
  ADD COLUMN IF NOT EXISTS secondary_pillars TEXT[],
  ADD COLUMN IF NOT EXISTS industry_focus TEXT[],
  ADD COLUMN IF NOT EXISTS coaching_style TEXT[],
  ADD COLUMN IF NOT EXISTS engagement_model TEXT,
  ADD COLUMN IF NOT EXISTS availability_status TEXT,
  ADD COLUMN IF NOT EXISTS founder_stage_focus TEXT[],
  ADD COLUMN IF NOT EXISTS founder_function_strength TEXT[],
  ADD COLUMN IF NOT EXISTS exec_level TEXT,
  ADD COLUMN IF NOT EXISTS exec_function TEXT[];

-- Indexes for filterability
CREATE INDEX IF NOT EXISTS idx_coach_apps_background ON public.coach_applications (coach_background);
CREATE INDEX IF NOT EXISTS idx_coach_apps_primary_pillar ON public.coach_applications (primary_pillar);
CREATE INDEX IF NOT EXISTS idx_coach_apps_availability ON public.coach_applications (availability_status);
CREATE INDEX IF NOT EXISTS idx_coach_apps_engagement ON public.coach_applications (engagement_model);
CREATE INDEX IF NOT EXISTS idx_coach_apps_secondary_pillars ON public.coach_applications USING GIN (secondary_pillars);
CREATE INDEX IF NOT EXISTS idx_coach_apps_industry_focus ON public.coach_applications USING GIN (industry_focus);
CREATE INDEX IF NOT EXISTS idx_coach_apps_coaching_style ON public.coach_applications USING GIN (coaching_style);
CREATE INDEX IF NOT EXISTS idx_coach_apps_founder_stage ON public.coach_applications USING GIN (founder_stage_focus);
CREATE INDEX IF NOT EXISTS idx_coach_apps_exec_function ON public.coach_applications USING GIN (exec_function);
```

### 2. Taxonomy Note

- `primary_pillar` (single TEXT) + `secondary_pillars` (TEXT[]) become the **source-of-truth** for filtering and matching going forward.
- The existing `pillar_specialties` column remains in the DB for legacy/descriptive purposes but will be treated as secondary in the UI (labeled "Detailed Specialties" rather than primary taxonomy).

### 3. Constants Update (`src/lib/coaching-constants.ts`)

Add new option arrays:

| Constant | Values |
|----------|--------|
| `PRIMARY_PILLAR_OPTIONS` | Leadership, Performance, Transition, Mindset & Alignment, Galoras Signature |
| `INDUSTRY_FOCUS_OPTIONS` | Technology, Finance & Banking, Healthcare, Sports & Athletics, Education, Consulting, Non-Profit, Government, Media & Entertainment, Other |
| `COACHING_STYLE_OPTIONS` | Directive, Facilitative, Socratic, Solution-Focused, Transformational, Holistic |
| `ENGAGEMENT_MODEL_OPTIONS` | 1:1 Coaching, Group Coaching, Workshop Facilitation, Hybrid (1:1 + Group) |
| `AVAILABILITY_STATUS_OPTIONS` | Available Now, Limited Availability, Waitlist Only, Not Currently Available |
| `FOUNDER_STAGE_OPTIONS` | Pre-Seed / Idea Stage, Seed, Series A, Series B+, Growth / Scale, Post-Exit |
| `FOUNDER_FUNCTION_OPTIONS` | Product, Engineering, Sales, Marketing, Operations, Finance, People / HR |
| `EXEC_LEVEL_OPTIONS` | C-Suite, VP, Director, Senior Manager |
| `EXEC_FUNCTION_OPTIONS` | Operations, Finance, Marketing, Sales, Engineering, Product, HR / People, Strategy |

### 4. Form Updates

**Both `src/pages/Apply.tsx` and `src/pages/coaching/CoachOnboarding.tsx`:**

- Add `primary_pillar` (single select from pillar names)
- Add `secondary_pillars` (multi-select checkboxes from pillar names, excluding the selected primary)
- Add `industry_focus` (multi-select checkboxes)
- Add `coaching_style` (multi-select checkboxes)
- Add `engagement_model` (single select)
- Add `availability_status` (single select)
- Conditional Founder fields (shown when `coach_background` contains "Founder" or matches the "Executive / Business Leader" option):
  - For Founder: `founder_stage_focus` (multi-select), `founder_function_strength` (multi-select)
  - For Executive: `exec_level` (single select), `exec_function` (multi-select)
- All new fields included in the insert/submit payloads
- Relabel the existing `pillar_specialties` section as "Detailed Specialties (Optional)" since `primary_pillar` + `secondary_pillars` is now the primary taxonomy

### 5. Edge Function Update (`supabase/functions/complete-onboarding/index.ts`)

Accept and persist all 10 new fields in the update call:
- `primary_pillar`, `secondary_pillars`, `industry_focus`, `coaching_style`, `engagement_model`, `availability_status`
- Conditional: `founder_stage_focus`, `founder_function_strength`, `exec_level`, `exec_function`

### 6. Admin Detail Dialog Update (`src/components/admin/ApplicationDetailDialog.tsx`)

- Add display for all new fields
- Show conditional fields only when they have values
- Group Founder and Executive fields under their respective headings

### Files Changed

| File | Change |
|------|--------|
| New migration SQL | Add 10 columns + 9 indexes |
| `src/lib/coaching-constants.ts` | Add 8 new option arrays |
| `src/pages/Apply.tsx` | Add new form fields + conditional logic + submit payload |
| `src/pages/coaching/CoachOnboarding.tsx` | Mirror same new fields + submit payload |
| `supabase/functions/complete-onboarding/index.ts` | Accept + persist 10 new fields |
| `src/components/admin/ApplicationDetailDialog.tsx` | Display all new fields |

