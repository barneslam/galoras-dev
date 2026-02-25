

## Add "Founder / Entrepreneur" to Coach Background and Wire Conditional Fields

### Problem

The `COACH_BACKGROUND_OPTIONS` array does not include a "Founder / Entrepreneur" option. The helper functions `isFounderBackground()` and `isExecutiveBackground()` both return true for `"Executive / Business Leader (Operator-Coach)"`, meaning:
- There is no way to select "Founder" as a background
- Founder-specific fields (stage focus, function strengths) only appear when "Executive" is selected
- Founder and Executive conditional fields are bundled into a single UI block

### Changes

**1. `src/lib/coaching-constants.ts`**

- Add `"Founder / Entrepreneur"` to `COACH_BACKGROUND_OPTIONS` (after the Executive option)
- Add entry in `BACKGROUND_DETAIL_CONFIG` for `"Founder / Entrepreneur"` with `{ field: "detail", label: "Company / Venture Name" }`
- Fix `isFounderBackground()` to return true when `bg === "Founder / Entrepreneur"`
- Fix `isExecutiveBackground()` to return true only when `bg === "Executive / Business Leader (Operator-Coach)"` (no change needed here, it's already correct for exec -- just decouple from founder)

Updated constants:

```text
COACH_BACKGROUND_OPTIONS:
  - Certified Professional Coach
  - Executive / Business Leader (Operator-Coach)
  - Founder / Entrepreneur               <-- NEW
  - Athlete / Elite Performer
  - Emerging Coach (Interested in Galoras Certification Track)
  - Other Relevant Professional Background

isFounderBackground(bg):
  return bg === "Founder / Entrepreneur"

isExecutiveBackground(bg):
  return bg === "Executive / Business Leader (Operator-Coach)"
```

**2. `src/pages/Apply.tsx`**

- Split the combined "Founder / Executive Details" conditional block into two separate blocks:
  - **Founder block** (shown when `isFounderBackground`): founder_stage_focus + founder_function_strength only
  - **Executive block** (shown when `isExecutiveBackground`): exec_level + exec_function only
- Update the submit payload: founder fields use `isFounderBackground`, exec fields use `isExecutiveBackground` (already correct in code, will work once helpers are fixed)

**3. `src/pages/coaching/CoachOnboarding.tsx`**

- Same split: separate the combined conditional block into Founder-only and Executive-only sections
- Submit payload already uses `isFounderBackground` / `isExecutiveBackground` -- will work once helpers are fixed

**4. `supabase/functions/complete-onboarding/index.ts`**

- No changes needed -- already accepts and persists `founderStageFocus` and `founderFunctionStrength` as arrays

**5. No database migration needed**

The columns `founder_stage_focus` and `founder_function_strength` already exist as TEXT[] in `coach_applications`.

### Summary of file changes

| File | Change |
|------|--------|
| `src/lib/coaching-constants.ts` | Add "Founder / Entrepreneur" to options, add config entry, fix `isFounderBackground` |
| `src/pages/Apply.tsx` | Split combined Founder/Executive conditional block into two separate blocks |
| `src/pages/coaching/CoachOnboarding.tsx` | Same split as Apply.tsx |

### Verification Steps

After implementation:
1. Go to /apply, select "Founder / Entrepreneur" as Coach Background
2. Confirm Founder fields (stage focus, function strengths) appear -- Executive fields do NOT
3. Select "Executive / Business Leader" -- confirm Executive fields appear, Founder fields do NOT
4. Submit a Founder application with stage focus and function strengths selected
5. Check database: `coach_background` = "Founder / Entrepreneur", `founder_stage_focus` and `founder_function_strength` populated as arrays
6. Filter in DB UI on `coach_background = "Founder / Entrepreneur"` to confirm filterability
