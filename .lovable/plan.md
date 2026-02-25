

## Remove Featured Duplication: Image-Only Gallery + Popup

### Overview
The top "Featured Coaches" section currently renders full `CoachCard` components -- identical to the directory list below -- creating visual duplication. This change converts the featured section into a clean **image-only gallery** where clicking a tile opens a **modal preview** of the coach.

No data, logic, routing, or database changes.

### Files to Change

**1. `src/components/coaching/CoachCard.tsx` -- Add `variant` prop**

Add `variant?: "default" | "static"` to the props interface. When `variant="static"`, the outer wrapper becomes a `<div>` instead of a `<Link>` (prevents nested anchors when used inside the modal). All styling and layout remain identical -- only the wrapper element changes.

**2. `src/components/FeaturedCoaches.tsx` -- Full UI rewrite (query logic untouched)**

Remove:
- `CoachCard` usage in the featured grid
- Subtitle paragraph
- Card-style loading skeletons

Replace with:
- `selectedCoach` state (coach object or null)
- 3-column responsive grid of **image-only tiles** (no text, no badge, no overlay)
- Each tile: `aspect-[4/3]`, `rounded-2xl`, `overflow-hidden`, `cursor-pointer`, hover `scale-105`
- Clicking a tile sets `selectedCoach` and opens a Radix `Dialog`
- Modal contains `CoachCard variant="static"` plus a separate "View Full Profile" link button below (outside the card, avoids nested anchors)
- Loading skeletons become simple `aspect-[4/3] rounded-2xl bg-muted animate-pulse` rectangles

**3. `src/pages/coaching/CoachingDirectory.tsx` -- No changes**

The lower directory list stays exactly as-is.

### Technical Details

**CoachCard wrapper logic:**
```text
if variant === "static":
  <div className="group block">{cardContent}</div>
else:
  <Link to={/coaching/${id}} className="group block">{cardContent}</Link>
```

**Modal structure:**
```text
<Dialog open={selectedCoach !== null} onOpenChange={...}>
  <DialogContent className="max-w-lg">
    <DialogTitle className="sr-only">{coach name}</DialogTitle>
    <CoachCard variant="static" ...props />
    <Link to={/coaching/${id}}>
      <Button>View Full Profile</Button>
    </Link>
  </DialogContent>
</Dialog>
```

### Visual Result
```text
/coaching page:
  [Hero + Search]
  [Category Pills]
  [Featured Coaches - "Meet Our Verified Coaches"]
    -> 3-col grid of IMAGE-ONLY tiles (no text anywhere on tiles)
    -> Click tile -> popup with CoachCard preview + "View Full Profile" button
  [All Coaches Section]
    -> 3-col grid of full CoachCard (unchanged, includes featured)
  [CTA Section]
```

### Acceptance Criteria
- Featured tiles show ONLY images (no badge, no bio, no name, no "View Profile")
- Clicking a tile opens a centered modal with the full card design
- Modal uses `variant="static"` CoachCard (no nested anchor tags)
- "View Full Profile" button is outside the card, links to `/coaching/{id}`
- Bottom directory list is completely unchanged
- Featured coaches appear in both sections
- Mobile: tiles stack to 1 column; modal fits viewport
- No data, logic, routing, or database changes

