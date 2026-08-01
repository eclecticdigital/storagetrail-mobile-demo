# StorageTrail — Mobile Listings Page (spec build)

A working implementation of the approved **Listings** mobile mockup, built as a sample for the
mobile page redesign project. Milestone 1 covers Listings and List Your Property; this is the
Listings half, delivered as a live page you can open on a real phone.

**Live demo:** https://eclecticdigital.github.io/storagetrail-mobile-demo/

> This is an unaffiliated spec build produced for a project proposal. It is not connected to the
> production StorageTrail site and does not process real data.

---

## What was matched from the mockup

| Mockup element | Status |
| --- | --- |
| Header: logo, search icon, orange menu button | Built |
| Hero: "Browse Storage / Nationwide" over photo with navy scrim | Built |
| Stats card overlapping the hero, four across | Built |
| Search field plus Filters and Map buttons | Built and wired |
| Horizontal category chips with active orange state | Built and wired |
| "All Storage Spaces" heading, result count, sort dropdown | Built and wired |
| Listing cards: availability pill, favourite heart, Featured / Instant Book badges, eyebrow, title, location, meta, price, View Details | Built |
| "Have unused space?" CTA banner | Built |
| Trust footer | Built |

## Brand tokens

These were sampled from the live site rather than guessed, so the demo already sits inside the
existing StorageTrail brand:

| Token | Value | Source |
| --- | --- | --- |
| Primary orange | `#e87722` | most-used hex on storagetrail.com |
| Secondary orange | `#f4650d` | second most-used |
| Deep navy | `#0a1e32` | headings and dark surfaces |
| Darkest navy | `#031a31` | scrim and footer strip |
| Border grey | `#d2d8e3` | input and card borders |
| Heading font | Manrope | loaded by the live site |
| Body font | Geist | loaded by the live site |
| Logo | actual `logo.png` from the live site | storagetrail.com |

## What is interactive

Everything the mockup shows a control for actually works, because "preserve all existing
functionality" is the core requirement of this project:

- **Search** filters listings live by name, city, state, and type, with a clear button
- **Category chips** filter by property type, and **More** reveals the overflow categories
- **Sort** reorders by newest, price low to high, and price high to low
- **Filters sheet** is a bottom sheet with a price range slider, indoor/outdoor segments, and an
  Instant Book toggle. The Apply button live-counts matching results before you commit, and the
  Filters button shows a dot when non-default filters are active
- **Favourite hearts** toggle with an accessible pressed state and a confirmation toast
- **Map** toggles a panel with price pins; tapping a pin scrolls to and highlights that listing
- **Empty state** appears when a filter combination returns nothing, with a reset action

## How this maps to the production build

The live site is **WordPress** running the **Bricks** theme with a `bricks-child` child theme, plus
these relevant plugins:

- `storagetrail-listings` — the listings engine behind the Listings page
- `stlys-list-space` — the List Your Space flow
- `contact-form-7` with `cf7-redirection` and a drag-and-drop upload addon
- `max-addons-for-bricks`

That means the production implementation restyles the existing plugin output rather than rebuilding
it. All custom CSS and template overrides belong in **`bricks-child`**, so plugin and theme updates
never wipe the styling, and the search, filters, and backend integrations keep running on exactly
the code path they use today.

## Notes

- **Photography is placeholder.** Images are royalty-free stock standing in for the real listing
  photos, which come from the live listings database in production.
- **Listing data is static** in this demo. In production the same markup is populated by the
  existing `storagetrail-listings` query.
- Fully responsive: single column on phones, two columns from 640px, three from 1040px.
- No frameworks and no build step. One HTML file, one stylesheet, one script.
- Images are WebP with explicit dimensions and lazy loading below the fold, so there is no layout
  shift and the page stays fast on mobile data.

## Run locally

```bash
npx serve . -l 3007
```

Then open `http://localhost:3007`.
