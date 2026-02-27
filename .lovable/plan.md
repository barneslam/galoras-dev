

## Fix Apply Form Submission — SELECT After INSERT Fails for Anonymous Users

### Root Cause
The insert itself works fine (the RLS INSERT policy is permissive and public). The problem is on line 188-190 of `Apply.tsx`:

```typescript
const { data, error } = await supabase
  .from("coach_applications")
  .insert(payload as any)
  .select("id, booking_url")  // <-- THIS FAILS
  .single();                    // <-- throws because 0 rows returned
```

The only SELECT policy on `coach_applications` is admin-only. So the anonymous/unauthenticated user's insert succeeds, but the chained `.select().single()` returns no rows, causing `.single()` to throw a "no rows" error. The catch block then shows the generic "Failed to submit" toast.

### Fix (File: `src/pages/Apply.tsx`, lines 186-199)

**Remove the `.select().single()` chain and the round-trip verification block.** The insert doesn't need to return data for the public form — we just need to confirm no error was thrown.

Replace:
```typescript
const { data, error } = await supabase
  .from("coach_applications")
  .insert(payload as any)
  .select("id, booking_url")
  .single();

if (error) throw error;

// Round-trip verification
const expected = normalizeUrl(formData.booking_url);
if (expected && !data?.booking_url) {
  console.error("Booking URL not persisted:", { expected, returned: data });
  throw new Error("Booking link was not saved...");
}

console.log("Saved application:", data);
```

With:
```typescript
const { error } = await supabase
  .from("coach_applications")
  .insert(payload as any);

if (error) throw error;
```

This removes the SELECT dependency entirely. The insert will succeed for anonymous users without needing read-back permission.

### Also: Normalize linkedin_url and website_url

While we're in the file, update the payload (lines 171-172) to use `normalizeUrl` for consistency:
```typescript
linkedin_url: normalizeUrl(formData.linkedin_url),
website_url: normalizeUrl(formData.website_url),
```

### Summary
- 1 file changed: `src/pages/Apply.tsx`
- No database/RLS changes needed (the INSERT policy is correct)
- No edge function changes needed
