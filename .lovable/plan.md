

# Phase A + Phase B: Masked Onboarding Links

## Phase A -- Immediate UI Fix

### File: `src/pages/admin/Applicants.tsx`

**"All" tab (lines 391-396):** Replace the "Copy Link" button block with two buttons:

1. **"Open Onboarding"** (primary) -- opens `/coaching/onboarding?token=...` in a new tab using `window.open()`. Note: uses `/coaching/onboarding` (not `/coach/onboarding`).
2. **"Copy Link"** (secondary/ghost, smaller) -- keeps existing clipboard copy behavior but also uses the corrected `/coaching/onboarding` route.

**Also fix `copyOnboardingLink` function (line 189-193):** Update the URL from `/coach/onboarding` to `/coaching/onboarding`.

**Add `openOnboardingLink` function:** Opens the onboarding URL in a new tab.

**Route fix in `App.tsx` (line 39):** Change `/coach/onboarding` to `/coaching/onboarding` for route consistency. Keep old route as a redirect or alias to avoid breaking any existing links.

No other tabs (Queue A, Queue B) are affected -- they don't show Copy Link buttons.

---

## Phase B -- Masked Onboarding Route

### Step 1: Database Migration

**New table `onboarding_links`:**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Default gen_random_uuid() |
| short_id | text (unique, not null) | 10-12 char base62 random string |
| application_id | uuid (FK) | References coach_applications.id |
| onboarding_token | text (not null) | The real token (plaintext initially, service-role-only access) |
| created_at | timestamptz | Default now() |
| expires_at | timestamptz | Default now() + 30 days |
| used_at | timestamptz | NULL until onboarding is completed |

RLS: Enable RLS on the table with NO public policies. Only the edge function (service role) accesses this table, so no RLS policies are needed for anon/authenticated roles.

**New column on `coach_applications`:**
- `onboarding_short_id text` (nullable) -- stores the short ID for quick admin reference

### Step 2: New Edge Function -- `resolve-onboarding-link`

- **Config:** `verify_jwt = false` in `supabase/config.toml`
- **Runs with service role** (uses `SUPABASE_SERVICE_ROLE_KEY`)
- Accepts `{ shortId }` in request body
- Looks up `onboarding_links` by `short_id`
- Validates: `expires_at > now()` (not expired)
- Does **NOT** mark `used_at` on resolve (allows retries and device switches)
- Returns `{ token }` to the client
- Returns 404 if expired or not found

**Single-use marking:** `used_at` is set only when `complete-onboarding` edge function runs successfully. A small update to `complete-onboarding/index.ts` will add: after marking the application as completed, also update `onboarding_links` SET `used_at = now()` WHERE `onboarding_token = token`.

### Step 3: Short ID Generation

Use a URL-safe base62 alphabet (A-Z, a-z, 0-9), generating a 12-character random string. Implementation in the edge function or in `Applicants.tsx`:

```text
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateShortId(length = 12) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, b => BASE62[b % 62]).join('');
}
```

### Step 4: New Frontend Route -- `/onboard/:shortId`

**New file: `src/pages/coaching/OnboardRedirect.tsx`**
- Reads `shortId` from URL params
- Calls `resolve-onboarding-link` edge function
- On success: navigates to `/coaching/onboarding?token={token}` (internal redirect via `useNavigate`)
- On failure: shows "Invalid or expired link" error page
- Shows loading spinner during resolution

**Update `App.tsx`:**
- Add route: `<Route path="/onboard/:shortId" element={<OnboardRedirect />} />`
- Keep `/coaching/onboarding` route (still accepts `?token=` for the redirect target)

### Step 5: Update `approveApplication` in `Applicants.tsx`

After generating the `onboarding_token` and saving it to `coach_applications`:
1. Generate a 12-char base62 `shortId`
2. Insert into `onboarding_links` table: `{ short_id, application_id, onboarding_token, expires_at }`
3. Update `coach_applications` with `onboarding_short_id = shortId`
4. Update local state with the short ID

### Step 6: Update Admin UI Buttons (replaces Phase A raw-token buttons)

- **"Open Onboarding"** now opens `/onboard/{shortId}` (not the raw token URL)
- **"Copy Link"** copies the `/onboard/{shortId}` URL
- Both functions check: if `onboarding_short_id` exists, use masked URL; otherwise fall back to raw token URL (backward compatibility for existing approved applications)

### Step 7: Update `complete-onboarding/index.ts`

After successfully marking `onboarding_status = 'completed'`, also:
```sql
UPDATE onboarding_links SET used_at = now() WHERE onboarding_token = token
```
This marks the link as used only after successful completion.

---

## Token Storage Security Note

The `onboarding_token` is stored as plaintext in `onboarding_links` for this phase. This is acceptable because:
- The table has RLS enabled with zero public policies
- Only the edge function accesses it via `SUPABASE_SERVICE_ROLE_KEY`
- The token is never exposed in admin UI (admin only sees/shares the `shortId`)
- Hashing can be added in a future phase if needed

---

## Masking Scope Confirmation

- Raw onboarding token is never shown in Admin UI buttons or text
- Admin copies/shares only `/onboard/{shortId}`
- Token appears in the final onboarding URL (`/coaching/onboarding?token=...`) after the redirect -- this is acceptable per requirements

---

## Files Changed Summary

| File | Phase | Change |
|---|---|---|
| `src/App.tsx` | A+B | Fix route `/coach/onboarding` to `/coaching/onboarding`, add `/onboard/:shortId` route |
| `src/pages/admin/Applicants.tsx` | A+B | Add "Open Onboarding" button, generate shortId on approve, use masked URLs |
| SQL migration | B | Create `onboarding_links` table, add `onboarding_short_id` to `coach_applications` |
| `supabase/functions/resolve-onboarding-link/index.ts` | B | New edge function |
| `supabase/config.toml` | B | Add `verify_jwt = false` for resolve-onboarding-link |
| `src/pages/coaching/OnboardRedirect.tsx` | B | New redirect page component |
| `supabase/functions/complete-onboarding/index.ts` | B | Mark `used_at` on onboarding_links after completion |

## No Blockers

All adjustments are straightforward. Phase A and B will be implemented together in a single pass.
