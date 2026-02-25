

## Unify Coach Card Design to Match Reference Site

### Overview
Replace the current CoachCard (circular avatar, centered layout) and FeaturedCoaches (cinematic gallery with TiltCard, grayscale, negative margins) with a single unified card design matching galoras-feature-coaches.lovable.app. This is a UI-only change -- no data, logic, routing, or database modifications.

### Reference Design (per card)
- Full-width hero image (h-56 / md:h-64) with gradient overlay
- "Verified Galoras Coach" badge (top-left, primary-colored pill)
- Small circular portrait + name + role overlaid at bottom-left of image
- Content area with headline (primary color), bio (2-line clamp), credential icons (specialty + location), and "View Profile" text with arrow
- Entire card is a single `<Link>` -- "View Profile" is a styled `<span>`, not a nested link
- Hover: border-primary/50, shadow-lg, image scale-105

### Files to Change

**1. `src/components/coaching/CoachCard.tsx` -- Full Rewrite**

Replace entire component with the reference card design:
- Wrap in `<Link to={/coaching/${id}}>` (react-router-dom, not next/link)
- Hero image section: h-56 md:h-64, object-cover, group-hover:scale-105
- Gradient overlay: from-black/70 via-black/20 to-transparent
- "Verified Galoras Coach" badge top-left (always shown since all listed coaches are approved)
- Portrait circle (w-14 h-14) + display_name + current_role (fallback: first specialty) at bottom-left of image
- Content: headline in primary, bio with line-clamp-2, Award icon + first specialty, MapPin icon + location, "View Profile" span + ArrowRight icon
- Updated props: add `bio`, `location`, `currentRole` (all optional/nullable strings)
- Remove old imports: Button, Badge. Add: MapPin, ArrowRight from lucide-react. Keep Award.

**2. `src/components/FeaturedCoaches.tsx` -- Replace with Simple Grid**

Remove entirely:
- TiltCard import and usage
- framer-motion (motion, variants)
- Cinematic overlapping gallery layout
- Grayscale treatment
- EXTERNAL_COACH_IMAGES map and getExternalImage helper
- Placeholder image import and fallback section
- "View All Coaches" link
- cn import

Replace with:
- Section: `py-20 bg-secondary/30`
- Title: "Meet Our **Verified Coaches**" (primary color on "Verified Coaches")
- Subtitle text
- 3-column responsive grid using CoachCard component
- Same fetch query (queryKey `["featured-coaches"]`) and logic unchanged
- Also select `bio, location, current_role` in the query's baseSelect string
- Pass new props (bio, location, currentRole) to each CoachCard

**3. `src/pages/coaching/CoachingDirectory.tsx` -- Pass New Props**

Update the CoachCard usage in the lower coaches grid to pass additional fields:
- Add `bio={coach.bio}`, `location={coach.location}`, `currentRole={coach.current_role}`
- Also add `bio, location, current_role` to the select in the coaches query (currently selects `*` so this is already covered)
- No other changes -- search, filter, category pills, routing all stay the same

### Layout on /coaching After Change

```text
[Hero + Search]
[Category Pills]
[Featured Coaches - "Meet Our Verified Coaches"]
  -> 3-col responsive grid of CoachCard
[All Coaches Section]
  -> 3-col responsive grid of CoachCard (includes featured)
[CTA Section]
```

### What Is NOT Changing
- Database schema
- Featured flag logic / queries
- Admin logic
- Routing (`/coaching/:id`)
- Search/filter logic
- Category pills
- Featured coaches appear in both sections
- Query keys and data fetching logic (except adding fields to FeaturedCoaches select)
