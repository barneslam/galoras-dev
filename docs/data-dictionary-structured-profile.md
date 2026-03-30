# Data Dictionary — Structured Profile Core
Galoras Platform · Sprint Module 1 · April 2026

## Table: `public.coaches`

### New Structured Fields (added in migration_001)

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `lifecycle_status` | TEXT | `'draft'` | CHECK: draft\|submitted\|under_review\|revision_required\|approved\|published\|rejected | Drives public visibility. Only `published` coaches appear in the directory. |
| `slug` | TEXT | NULL | UNIQUE | URL-safe identifier. Used in `/coach/:slug` routing. Generated from `full_name` (e.g. `mitesh-kapadia`). |
| `positioning_statement` | TEXT | NULL | — | Hero pull-quote shown at the top of the public profile. 1–3 sentences. Replaces plain bio in the hero section. |
| `methodology` | TEXT | NULL | — | Coach's approach and framework description. 1–3 paragraphs. Displayed in the Methodology section of the public profile. |
| `proof_points` | JSONB | `'[]'` | — | Structured testimonials array. See format below. Falls back to `testimonials` table if empty. |
| `tier` | TEXT | `'standard'` | CHECK: elite\|premium\|standard | Admin-assigned visibility tier. Controls badge display on profile and directory card. |
| `audience` | TEXT[] | `'{}'` | — | Target audience segments. Valid values: `individual`, `sme`, `enterprise`, `startup`, `nonprofit`, `government`. |
| `engagement_format` | TEXT | NULL | CHECK: online\|in_person\|hybrid | Coaching delivery format displayed on public profile. |

---

### `proof_points` JSON Format

Each element in the array must follow this shape:

```json
{
  "name":    "Client Full Name or Role",   // required
  "role":    "Job Title",                   // optional
  "company": "Company Name",               // optional
  "outcome": "One-line measurable result", // optional — shown as headline
  "quote":   "Verbatim testimonial text"   // required
}
```

**Example:**
```json
[
  {
    "name":    "Senior Leader",
    "company": "Tech Company",
    "outcome": "Jumped two levels in title and secured a 20% salary increase",
    "quote":   "Jumped two levels in title and secured a 20% salary increase after redefining her leadership presence and visibility."
  }
]
```

---

### `lifecycle_status` State Machine

```
draft → submitted → under_review → revision_required → approved → published
                                 ↘ rejected
```

| Status | Meaning | Who sets it |
|---|---|---|
| `draft` | Coach record created, not yet submitted | System |
| `submitted` | Application received, awaiting review | System |
| `under_review` | Admin is actively reviewing | Admin |
| `revision_required` | Admin requested changes | Admin |
| `approved` | Application approved, onboarding in progress | Admin |
| `published` | Profile live on public directory | Admin |
| `rejected` | Application rejected | Admin |

**RLS rule:** Public directory (`/coaching`) shows coaches where `lifecycle_status = 'published'`.

---

### `tier` Values

| Value | Display | Usage |
|---|---|---|
| `elite` | ⭐ Elite | Top-tier coaches. Amber badge. |
| `premium` | Premium | Mid-tier coaches. Blue badge. |
| `standard` | Standard | Default tier. Muted badge. |

---

### `audience` Valid Values

| Value | Display label |
|---|---|
| `individual` | Individuals |
| `sme` | SME |
| `enterprise` | Enterprise |
| `startup` | Startups |
| `nonprofit` | Non-Profit |
| `government` | Government |

---

## Table: `public.categories`

### New Field (added in migration_001)

| Column | Type | Default | Description |
|---|---|---|---|
| `is_active` | BOOLEAN | `true` | Controls whether a category appears in the directory filter. Inactive categories are hidden from the UI. |

---

## Migrations

| File | Description |
|---|---|
| `20260329000001_migration_001_structured_profile_core.sql` | Adds all structured columns, indexes, and updated RLS to `coaches`. Adds `is_active` to `categories`. Backfills `lifecycle_status` for existing coaches. |
| `20260329000002_migration_002_seed_mitesh_kapadia.sql` | Seeds structured profile fields for Mitesh Kapadia. Safe to re-run. |
