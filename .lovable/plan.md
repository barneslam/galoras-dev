

## Add Featured Coach Checkbox + Filter Featured Gallery

### Overview
Add an independent "Featured Coach" toggle in the admin console that controls which coaches appear in the Featured gallery on `/coaching`. The `is_featured` column already exists on the `coaches` table. We need to add optional columns (`featured_rank`, `featured_at`), create an edge function for admin toggling (since RLS doesn't allow admin updates to coaches), update the admin UI, and remove the backfill logic from the Featured gallery.

### 1. Database Migration

Add two optional columns to the `coaches` table:

```sql
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS featured_rank integer;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS featured_at timestamptz;
```

No RLS changes needed -- the edge function will use the service role key.

### 2. New Edge Function: `toggle-featured-coach`

Create `supabase/functions/toggle-featured-coach/index.ts`:
- Accepts `{ coachId: string, isFeatured: boolean }`
- Verifies caller is admin (same pattern as `publish-coach`)
- Uses service role client to update the `coaches` table:
  - `is_featured` = the provided value
  - `featured_at` = `now()` when enabling, `null` when disabling
  - `featured_rank` = `null` when disabling
- Returns success/error

### 3. Admin UI: Add Featured Toggle

**File: `src/pages/admin/Applicants.tsx`**

The admin manages `coach_applications`, not `coaches` directly. The featured toggle only makes sense for **published** coaches. Changes:

- After publishing a coach, the admin needs to be able to toggle featured status
- Add a "Featured" column header in the **All** tab and **Profiles** tab tables
- For rows where `onboarding_status === "published"`, show a `Checkbox` (from `@/components/ui/checkbox`) labeled "Featured"
- On toggle, call the `toggle-featured-coach` edge function
- Need to look up the coach ID from the application -- will query `coaches` table by `display_name` matching `full_name` (same pattern used in `publish-coach` for idempotency), or store the coach_id on the application after publish

**Implementation approach:**
- After a coach is published, fetch the matching coach record ID
- Store a local map of `applicationId -> coachId + isFeatured` by querying coaches for published applications
- Render checkbox bound to that state; on change, call the edge function and refresh

**Safety gate:** The checkbox is only enabled when `onboarding_status === "published"`. For non-published coaches, the checkbox is disabled/hidden.

### 4. Featured Gallery: Remove Backfill Logic

**File: `src/components/FeaturedCoaches.tsx`**

Current behavior: fetches `is_featured = true` coaches, then backfills with other approved coaches up to 7 if not enough featured.

New behavior:
- Fetch ONLY coaches where `is_featured = true` and `status = 'approved'`
- Order by `featured_rank ASC NULLS LAST`, then `featured_at DESC`
- No backfill -- if no featured coaches, hide the section entirely (return `null`)
- Remove the secondary query and backfill logic completely

### Files Summary

| File | Change |
|---|---|
| Database migration | Add `featured_rank` and `featured_at` columns |
| `supabase/functions/toggle-featured-coach/index.ts` | New edge function for admin to toggle featured |
| `src/pages/admin/Applicants.tsx` | Add Featured checkbox column for published coaches |
| `src/components/FeaturedCoaches.tsx` | Remove backfill logic, filter strictly by `is_featured = true` |

### What Is NOT Changing
- Coach approval status workflow
- Routing
- CoachCard component
- Bottom directory list on `/coaching`
- Featured gallery visual design (image-only tiles + modal)
- Database schema for existing columns

