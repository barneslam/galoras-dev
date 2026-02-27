

## Fix Booking URL Browser Validation

### File: `src/pages/Apply.tsx`

**1. Change input type** (line 336): Replace `type="url"` with `type="text"` to prevent browser-native URL validation from blocking submission.

**2. Add light validation in `handleSubmit`** (after line 160, before the payload): Add URL format check after normalization:
```typescript
const normalizedBooking = normalizeUrl(formData.booking_url);

if (normalizedBooking && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(normalizedBooking)) {
  throw new Error("Please enter a valid booking URL.");
}
```
Then use `normalizedBooking` in the payload instead of `normalizeUrl(formData.booking_url)` (line 177).

**3. Update helper text** (line 341): Change to: "Optional -- enter your Calendly or booking page (we'll add https:// if missing)."

### Expected behavior
- `calendly.com/abc` saves as `https://calendly.com/abc`
- `https://calendly.com/abc` saves as-is
- Blank saves as `null`
- No browser validation popup; our own code handles it

