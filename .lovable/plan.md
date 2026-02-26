

## Fix 401 Invalid JWT on create-onboarding-link

### Root Cause
The edge function creates a single service-role client and calls `supabase.auth.getUser(jwt)`. The service-role client doesn't properly validate user JWTs this way. Other edge functions (`publish-coach`, `toggle-featured-coach`) already use the correct two-client pattern.

### Changes

**1. `supabase/functions/create-onboarding-link/index.ts` -- Two-client pattern**

Replace the current steps 2-4 (lines 47-88) with:

- Load `SUPABASE_ANON_KEY` in addition to URL and service role key (with env var guard)
- Create a `userClient` using `anonKey` + caller's `Authorization` header for `auth.getUser()`
- Create an `adminClient` using `serviceRoleKey` for all DB operations
- Rename all subsequent `supabase.from(...)` calls to `adminClient.from(...)`

This matches the pattern already used by `publish-coach` and `toggle-featured-coach`.

**2. `src/pages/admin/Applicants.tsx` -- Session guard (lines 165-184)**

Add a session check before invoking the edge function in `approveApplication` and `regenerateLink`:

```text
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) {
  throw new Error("Session expired. Please sign in again.");
}
```

This prevents calling with an expired/missing token and gives a clear error message.

### Files Summary

| File | Change |
|---|---|
| `supabase/functions/create-onboarding-link/index.ts` | Split into userClient (anon key + JWT) + adminClient (service role); add SUPABASE_ANON_KEY env var |
| `src/pages/admin/Applicants.tsx` | Add session guard before edge function invocations |

### Why this fixes it
`auth.getUser(jwt)` on a service-role client doesn't reliably validate user JWTs. Using an anon-key client with the caller's Authorization header (the pattern already proven in other edge functions) resolves the 401.
