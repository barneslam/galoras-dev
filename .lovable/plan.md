

# Phase 1 Adjustments -- Revised Implementation Plan

## Summary of 4 Adjustments

1. **Add Coaching Philosophy** -- new optional short text field (max 300 chars) end-to-end
2. **Fix Years of Coaching Experience** -- correct dropdown options and make required
3. **Conditional field logic** -- enforce mutual exclusivity of `coach_background_detail` vs `certification_interest`
4. **Seed existing test profiles** -- backfill Barnes Lam and Mitesh Kapadia with structured data

---

## Current State

### Database columns (coach_applications)
Existing: `id, full_name, email, phone, linkedin_url, website_url, experience_years (integer), specialties (array), bio, why_galoras, certifications, status, reviewed_at, reviewer_notes, created_at, avatar_url, onboarding_token, onboarding_status, user_id`

New columns from the approved Phase 1 plan (not yet created): `coach_background, coach_background_detail, certification_interest, coaching_experience_years, leadership_experience_years, current_role, coaching_experience_level, primary_join_reason, commitment_level, start_timeline, excitement_note, pillar_specialties`

### Database columns (coaches)
Existing: `id, user_id, headline, bio, specialties, coaching_style, signature_framework, experience_years, hourly_rate, location, timezone, languages, linkedin_url, website_url, status, is_featured, is_enterprise_ready, total_sessions, rating, created_at, updated_at, display_name, avatar_url, cutout_url`

New columns from the approved plan (not yet created): `coach_background, coaching_experience_level, leadership_experience_years, pillar_specialties, current_role`

### Existing test data
- **Barnes Lam** -- `coach_applications` (approved, no onboarding_status) + `coaches` record
- **Mitesh Kapadia** -- `coach_applications` (approved, onboarding_status: needs_changes) + `coaches` record
- **Conor McGowan** -- `coach_applications` (pending, no onboarding)

---

## Adjustment Details

### 1. Add `coaching_philosophy` field

**Schema:**
- Add `coaching_philosophy text` (nullable) to both `coach_applications` and `coaches` tables
- No max-length constraint at DB level; enforced in UI with `maxLength={300}`

**Touchpoints:**
- `Apply.tsx` -- add optional textarea in "About You" section, max 300 chars, with character counter
- `CoachOnboarding.tsx` -- add same field
- `complete-onboarding/index.ts` -- accept and write `coachingPhilosophy`
- `publish-coach/index.ts` -- copy `coaching_philosophy` from application to coaches record
- `ApplicationDetailDialog.tsx` -- display if present
- `CoachProfile.tsx` -- display in a new card section between "About" and "Specialties"

### 2. Fix Years of Coaching Experience dropdown

The original plan reused the leadership experience scale (`0-3, 3-7, 7-15, 15+`) for coaching years. This adjustment provides a distinct, coaching-appropriate scale.

**Corrected dropdown options for `coaching_experience_years`:**
- Less than 1 year
- 1--3 years
- 3--5 years
- 5--10 years
- 10+ years

**Field is required** (was optional in original plan).

The column name `coaching_experience_years` is already distinct from `leadership_experience_years`, so no rename needed.

### 3. Conditional field enforcement

The fields `coach_background_detail` and `certification_interest` share a single conditional slot based on the `coach_background` dropdown value:

| Coach Background | Visible Field | Label |
|---|---|---|
| Certified Professional Coach | `coach_background_detail` | "List Certifications" |
| Executive / Business Leader | `coach_background_detail` | "Most Recent Senior Role" |
| Athlete / Elite Performer | `coach_background_detail` | "Highest Level Competed" |
| Emerging Coach | `certification_interest` | "Interest in Galoras Certification Track" (Yes/No/Maybe) |
| Other Relevant Professional Background | Neither | -- |

**Implementation logic in Apply.tsx and CoachOnboarding.tsx:**
- When `coach_background` changes, clear both `coach_background_detail` and `certification_interest`
- Only render the relevant conditional sub-field
- On form submit, explicitly set the irrelevant field to `null` so stale values are never persisted

### 4. Seed/backfill existing test profiles

A data migration (UPDATE statements) will populate the new structured fields for the two existing coaches so the UI renders complete profiles during demos.

**Barnes Lam** (applications + coaches):
- `coach_background`: "Executive / Business Leader (Operator-Coach)"
- `coach_background_detail`: "Founder & CEO, The Strategy Pitch"
- `coaching_experience_years`: "5--10 years"
- `leadership_experience_years`: "15+ years"
- `current_role`: "Founder & CEO, The Strategy Pitch"
- `coaching_experience_level`: "Executive / Operator Coach"
- `pillar_specialties`: ["Executive Leadership", "Founder & Entrepreneur Coaching", "Sport of Business Coaching"]
- `primary_join_reason`: "Expand my existing coaching business"
- `commitment_level`: "Building full-time coaching practice"
- `start_timeline`: "Immediately"
- `coaching_philosophy`: "Strategy meets execution -- helping leaders close the gap between vision and results."

**Mitesh Kapadia** (applications + coaches):
- `coach_background`: "Certified Professional Coach"
- `coach_background_detail`: "ICF PCC, CTI CPCC"
- `coaching_experience_years`: "10+ years"
- `leadership_experience_years`: "15+ years"
- `current_role`: "Executive Coach"
- `coaching_experience_level`: "Executive / Operator Coach"
- `pillar_specialties`: ["Executive Leadership", "Peak Performance & Execution", "Mindset & Resilience", "Career Transitions"]
- `primary_join_reason`: "Join a high-performance coaching network"
- `commitment_level`: "Already coaching professionally"
- `start_timeline`: "Immediately"
- `coaching_philosophy`: "Unlocking human potential through deep self-awareness and purposeful action."

---

## Implementation Steps

| Step | Description | Files |
|---|---|---|
| 1 | **Database migration** -- add all new columns to `coach_applications` and `coaches` (including `coaching_philosophy`). Backfill Barnes Lam and Mitesh Kapadia with seed data. Single migration. | SQL migration |
| 2 | **Shared constants** -- create `src/lib/coaching-constants.ts` with all dropdown options, pillar taxonomy, and type definitions | New file |
| 3 | **Apply.tsx** -- replace Professional Background, Specialties, and "Why Galoras?" sections with structured dropdowns, conditional fields, pillar multi-select, motivation section, and coaching philosophy textarea | `src/pages/Apply.tsx` |
| 4 | **CoachOnboarding.tsx** -- add same structured fields with conditional logic | `src/pages/coaching/CoachOnboarding.tsx` |
| 5 | **complete-onboarding edge function** -- accept and persist new fields | `supabase/functions/complete-onboarding/index.ts` |
| 6 | **publish-coach edge function** -- copy new fields including `coaching_philosophy` to coaches record | `supabase/functions/publish-coach/index.ts` |
| 7 | **ApplicationDetailDialog** -- display new structured fields with pillar badges | `src/components/admin/ApplicationDetailDialog.tsx` |
| 8 | **Applicants.tsx** -- replace "Copy Link" with "View Profile" in Queue B | `src/pages/admin/Applicants.tsx` |
| 9 | **CoachProfile.tsx** -- display Coach Background, Experience Level, Leadership Experience, Pillar Specialties (grouped), Sport of Business tag, and Coaching Philosophy | `src/pages/coaching/CoachProfile.tsx` |
| 10 | **End-to-end verification** | Manual testing |

---

## Breaking Changes

None. Old columns (`certifications`, `why_galoras`, `specialties`, `experience_years`) are preserved. Existing data is backfilled. New submissions write to new columns.

## Technical Notes

- The seed data for coaches records will be matched by `display_name` since that is how the existing records are identified
- `coaching_philosophy` has a 300-char UI limit but no DB constraint (text type)
- Conditional field clearing happens on the client side before submission
- The `experience_years` integer column on `coach_applications` remains for backward compatibility; the new `coaching_experience_years` text column stores the dropdown range value

