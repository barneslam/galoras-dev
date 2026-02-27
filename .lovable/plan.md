

## Step 1 Verification: Confirm booking_url Persistence

### Overview
Add URL normalization, round-trip DB verification, and updated helper text to `src/pages/Apply.tsx` to confirm `booking_url` is being persisted correctly.

### Changes to `src/pages/Apply.tsx`

**1. Add `normalizeUrl` helper** (inside the component, before `handleSubmit` around line 123):
```typescript
const normalizeUrl = (url: string) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
```

**2. Replace the insert call** (lines 155-174) with a payload variable + `.select().single()` round-trip check:
- Build the payload object separately
- Use `normalizeUrl(formData.booking_url)` instead of `formData.booking_url || null`
- Chain `.select("id, booking_url").single()` onto the insert
- After insert, compare `normalizeUrl(formData.booking_url)` against `data?.booking_url` -- if user provided a URL but DB returned null, throw a descriptive error
- Log `data` to console for diagnostic confirmation

**3. Update helper text** (line 320): Change from "Optional -- must start with https://" to "Optional -- if you omit https:// we'll add it automatically."

### No other files changed
- No schema changes
- No routing changes
- This is diagnostic-only to confirm DB persistence
