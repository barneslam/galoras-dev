

## Premium Featured Gallery + Divider + Coaching Team Header

### Overview
Visual-only changes to the `/coaching` page: upgrade the Featured section styling, add a divider between sections, and add a "Galoras Coaching Team" header above the regular coach grid. No logic, data, or routing changes.

### Changes

**1. `src/components/FeaturedCoaches.tsx`**

- **Heading**: Replace "Meet Our Verified Coaches" with cleaner "Featured Coaches" using `text-2xl md:text-3xl font-semibold` plus a subtle subtitle
- **Section spacing**: Change `py-20 bg-secondary/30` to `py-14 md:py-16` (no background tint needed, or keep subtle)
- **Tile styling**: Upgrade from `aspect-[16/9] rounded-2xl` to `aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 shadow-sm` with hover lift (`hover:shadow-md hover:-translate-y-0.5`)
- **Divider**: Add `<div className="mx-auto mt-12 md:mt-14 h-px w-2/3 bg-white/10" />` after the grid, before the Dialog
- **Loading skeleton**: Match new tile styling (`aspect-[4/3] rounded-3xl`)

All rotation logic, modal behavior, and query logic remain untouched.

**2. `src/pages/coaching/CoachingDirectory.tsx`**

- Insert a "Galoras Coaching Team" header block above the coach grid (line ~217, before the grid section content):
  - `<h2>` with "Galoras Coaching Team" and a subtitle "Explore our full roster of approved coaches."
  - Placed inside the existing section, above the loading/grid/empty conditional

No changes to grid logic, CoachCard, filters, or search.

### Acceptance Criteria
- Featured heading reads "Featured Coaches" with lighter styling
- Featured tiles use rounded-3xl, subtle border/shadow, hover lift, aspect 4:3
- Subtle divider line between Featured and Coaching Team sections
- "Galoras Coaching Team" title appears above the regular coach grid
- All existing logic (rotation, modal, filters, directory) unchanged

