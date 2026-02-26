

## Fix Approve Edge Function Failure + Step Logging + CORS + UI Error Surfacing

### Overview
Three changes to make the admin Approve flow reliable and debuggable: update the edge function's admin check, add step tracing, expand CORS headers, and improve client-side error messages.

### Changes

**1. `supabase/functions/create-onboarding-link/index.ts` — Full update**

**CORS headers**: Replace current `corsHeaders` with expanded set including `x-supabase-client-platform` and related headers. Change OPTIONS response body from `null` to `"ok"`.

**Step variable**: Add `let step = "start"` at the top of the handler. Set `step` before each major block:
- `auth_header`, `env`, `get_user`, `admin_check`, `parse_body`, `fetch_application`, `revoke_old_links`, `update_application`, `insert_onboarding_link`, `done`

Include `step` in every error response JSON.

**Admin check**: Replace the `supabase.rpc("has_role", ...)` call with a direct query:
```typescript
step = "admin_check";
const { data: roleRow, error: roleError } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", user.id)
  .eq("role", "admin")
  .maybeSingle();

if (roleError || !roleRow) {
  return new Response(
    JSON.stringify({ step, error: "Admin access required" }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

This uses the service-role client (bypasses RLS), so it will always succeed for valid admins regardless of RLS policies on `user_roles`.

**Structured logging**: Add `console.log("[create-onboarding-link]", { step, ... })` after:
- `get_user` (log userId)
- `admin_check` success
- `fetch_application` (log onboarding_status)
- `update_application` (log applicationId)
- `insert_onboarding_link` (log shortId)
- `done`

**Catch block**: Return `{ step, error, message: String(error) }` instead of just `{ error }`.

**2. `src/pages/admin/Applicants.tsx` — Better error surfacing**

Update `approveApplication` and `regenerateLink` error handling to extract the real error body:

```typescript
// Current pattern:
if (res.error) throw res.error;
if (res.data?.error) throw new Error(res.data.error);

// Updated pattern:
if (res.error) {
  const detail = res.data?.error || res.data?.message || res.error.message;
  const stepInfo = res.data?.step ? ` [step: ${res.data.step}]` : "";
  console.error("Approve failed:", { error: res.error, data: res.data });
  throw new Error(`${detail}${stepInfo}`);
}
if (res.data?.error) throw new Error(res.data.error);
```

Apply the same pattern to `publishCoach` and `toggleFeatured` for consistency.

### Files Summary

| File | Change |
|---|---|
| `supabase/functions/create-onboarding-link/index.ts` | Replace `has_role` RPC with direct `user_roles` query, add step tracing to all errors, expand CORS headers, add structured logging |
| `src/pages/admin/Applicants.tsx` | Extract real error body + step from edge function responses, add `console.error` with full payload |

### Why this fixes the issue
The `has_role` RPC function uses `SECURITY DEFINER` but is called via the service-role client, which should work. However, replacing it with a direct table query eliminates any potential issue with the RPC function resolution. The service-role client bypasses RLS on `user_roles`, so the direct query will always find admin rows. The step logging will immediately reveal the failing step if any other issue occurs.

### Acceptance Criteria
- Approve no longer fails due to admin check
- All error responses include `step` field for traceability
- CORS preflight handles all Supabase client headers
- UI toast shows meaningful error with step info on failure
- Edge function logs identify exactly which step fails

