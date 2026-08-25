# Responsive Plan — Mobile / Tablet / Laptop

Status: proposed
Scope: `fox-passport-republic-app`

This plan is written against the current code, not a generic checklist. Every
claim below was verified in the tree.

---

## 1. Where we actually are

| Signal | Value |
|---|---|
| Routes (`page.tsx`) | 66 |
| `.tsx` files in `src/` | 267 |
| Files with **no** breakpoint prefix at all | **145 (54%)** |
| `sm:` / `md:` / `lg:` / `xl:` / `2xl:` usages | 524 / 296 / 177 / **7** / **0** |
| Admin tables with `overflow-x` guards | 10 of 10 |
| Touch / pointer event handlers in the whole app | **0** |

The `xl` / `2xl` numbers are the story: layouts are built for one desktop width
and one phone width, with very little in between and nothing above ~1280px.

---

## 2. Feature inventory

Everything that needs responsive work, grouped by who actually uses it on a
phone. **Priority follows audience, not file count** — a citizen browsing venues
on a phone matters more than an admin on a laptop.

### 2.1 Citizen-facing — highest mobile traffic, do first

| Feature | Files w/o breakpoints | Specific gaps |
|---|---|---|
| `landing` | 0 / 10 | Done |
| `category` | 0 / 10 | Done |
| `match` | 0 / 2 | Done |
| `notifications` | 0 / 2 | Done |
| `onboarding` | 0 / 1 | Done |
| **`search`** | **5 / 7** | `SearchFilters`, `SearchResultCard`, `EventTemplatesSection`, `GearServiceBento`, `MapboxLocationPicker` |
| `booking` | 4 / 18 | `AvailabilityCalendar`, `StripePaymentForm`, `CancelBookingModal`, `WaitlistButton` |
| `venue` | 6 / 14 | `BookingWidget`, `VenueHeader`, `VenueCard` (+ builder, see 4.1) |
| `user` | 4 / 14 | `UserWallet`, `UserJourney`, `UserSavedVibes`, `AvatarUploader` |
| `gamification` | 2 / 5 | `BadgeModal`, `CircularProgress` |
| `review` | 1 / 5 | `ReviewReplyModal` |
| `cancellation-policy` | 1 / 1 | `CancellationPolicyPicker` |
| `auth` | 2 / 8 | `AuthInput`, `RequireAuth` |

`search` is the standout: it is a primary citizen surface and 5 of its 7
components have no responsive handling at all. **Highest-value target in the
whole plan.** `AvailabilityCalendar` and `StripePaymentForm` are next — both sit
directly on the booking/payment path.

### 2.2 Supply-side (Foxer) — desktop-leaning but must not be broken

| Feature | Files w/o breakpoints | Specific gaps |
|---|---|---|
| `dashboard` | 8 / 20 | `HostCalendarClient`, `QRScannerClient`, `SidebarWidgets`, `StripeConnectSection`, `PaginationBar`, `EmptyState`, `LockedSection`, `StatusBadge` |
| `event` | **6 / 9** | `EventHeader`, `EventGallery`, `DateTimePicker`, `ResourceCard`, `CorePackageDropZone`, `EventCard` |
| `asset` | **4 / 5** | `ListingHeader`, `ListingSidebar`, `ListingPreviewCard`, `ListingStatusPanel` |
| `role-application` | 1 / 5 | `SpecializationPicker` |

`QRScannerClient` deserves attention — check-in is scanned **on a phone at a
venue**. It is currently in the unhandled pile despite being the most
mobile-native workflow in the product.

`asset` at 4/5 is effectively an unstyled-for-mobile feature.

### 2.3 Admin — desktop-only is an acceptable answer

| Feature | Files w/o breakpoints | Notes |
|---|---|---|
| `admin` | 3 / 16 | `AdminBookingsTable`, `AdminContent`, `AdminAuthGuard` |

All 10 admin tables already have `overflow-x` guards. Admin is in better shape
than most citizen-facing features. Recommend explicitly scoping admin to
`lg` and above rather than spending effort here.

### 2.4 Shared primitives — fix these first, they lift everything

18 of 26 files in `src/shared/components` have no breakpoint prefix:

**Layout:** `BrandLogo`, `FileUploader`, `SessionTimeoutModal`, `navbar/BrowseDropdown`

**UI:** `input`, `avatar`, `separator`, `collapsible`, `dropdown-menu`,
`glass-card`, `kpi-card`, `FormSection`, `StepperControl`, `ProgressIndicator`,
`DynamicIcon`, `EscrowTimeline`, `LocationMap`, `MapboxLocationInput`

`FormSection`, `StepperControl`, `input` and `glass-card` are used across nearly
every builder and form. Fixing those four propagates further than any individual
feature fix.

`LocationMap` / `MapboxLocationInput` / `MapboxLocationPicker` are map surfaces —
they need touch gesture handling, not just width classes. Treat as their own task.

### 2.5 Route-level gaps

Most `page.tsx` files are thin wrappers around feature components, so a missing
breakpoint there is usually harmless. These are the routes with **real layout
markup and no responsive handling**:

| Route | Size |
|---|---|
| `/creator-dashboard/venues/[id]/edit` | 205 lines, 22 classNames |
| `/creator-dashboard/events/[id]/edit` | 186 lines, 22 classNames |
| `/creator-dashboard/assets/[id]/edit` | 185 lines, 20 classNames |
| `/creator-dashboard/services/[id]/edit` | 172 lines, 20 classNames |
| `/search` (`SearchClient`) | 237 lines, 18 classNames |
| `/creator-dashboard/stripe-dashboard` | 169 lines, 16 classNames |
| `/creator-dashboard/stripe-onboard` | 132 lines, 12 classNames |

The four `[id]/edit` routes are the same layout four times over — fix one
pattern, apply it four times.

### 2.6 Duplicated work warning

`CONTEXT.md` states `/host` and `/mayor` are redirect shims. That is only
partly true:

| Route | Reality |
|---|---|
| `/host`, `/host/assets`, `/host/events`, `/host/venues`, `/host/services`, `/host/calendar`, `/host/apply`, all `[id]/edit` | redirect (fine) |
| **`/host/stripe-dashboard`** | **real page — `StripeDashboardClient.tsx` is byte-identical to the `/creator-dashboard` copy** |
| **`/host/stripe-onboard`** | **real page — same duplication** |
| **`/mayor/apply`**, **`/mayor/create-venue`** | **real pages, not shims** |

Deduplicate these **before** the responsive sweep, or the same layout work gets
done twice and the copies drift.

---

## 3. Bugs to fix before any new work

Defects, not gaps. Cheap, and they should land first.

### 3.1 Navbar has a dead zone at 640–767px

- Desktop menu is `hidden md:flex` → appears at **>=768px** — `src/shared/components/layout/Navbar.tsx:43`
- Hamburger is `flex sm:hidden` → disappears at **>=640px** — `src/shared/components/layout/Navbar.tsx:91`

Between 640px and 767px **there is no navigation at all**. That band covers
small tablets and most phones in landscape. The mobile menu panel itself is
`md:hidden` (`navbar/NavMobileMenu.tsx:47`), so the panel already agrees with
`md` — only the toggle button is wrong.

**Fix:** change the hamburger to `md:hidden`. One-word change.

### 3.2 Event builder sidebars vanish with no way to reopen them

`ResourcePalette` and `EventBlueprint` both accept an `inDrawer` prop and default
to `hidden md:flex`:

- `src/features/event/components/event-builder/ResourcePalette.tsx:30`
- `src/features/event/components/event-builder/EventBlueprint.tsx:33`

The behaviour is even covered by tests (`src/__tests__/responsive/EventBuilder.test.tsx`).
But `src/app/foxer/create-event/page.tsx` **never passes `inDrawer` and never
renders a drawer**. Below `md` the palette and blueprint simply disappear and the
page becomes a dead form.

**Fix:** wire the existing `src/shared/components/ui/sheet.tsx` primitive to two
toggle buttons in `EventHeader`, passing `inDrawer`. The components are already
built for this — only the host page is missing.

### 3.3 Breakpoint semantics disagree with each other

| Source | Mobile cutoff |
|---|---|
| `src/shared/hooks/useMobile.ts` | 768 (`md`) |
| Navbar hamburger | 640 (`sm`) |
| `tailwind.config.ts` `2xl` | overridden to 1400px |

Pick `md` (768) as *the* mobile/desktop line and make everything agree.

---

## 4. The hard problem: the builders are touch-dead

Both builders are driven by **HTML5 drag-and-drop** (`draggable`, `onDragStart`,
`onDrop`) — `ResourceCard.tsx`, `CorePackageDropZone.tsx`, and
`src/features/event/hooks/useEventBuilder.ts`.

There are **zero** `onTouchStart` / `onPointerDown` handlers anywhere in `src/`.

HTML5 DnD does not fire on touch devices. The event builder and the venue
builder — the two core supply-side workflows — **cannot be used on any phone or
tablet at all**, regardless of layout work. No amount of Tailwind prefixes fixes
this.

**Option A — make them work on touch.** Replace HTML5 DnD with pointer events
(`@dnd-kit/core` supports mouse and touch), or add a tap-to-select then
tap-to-place fallback below `md`. Tap-to-place is far less work and arguably
better on a small screen than dragging.

**Option B — declare them desktop-only.** Show an explicit "open this on a larger
screen" interstitial below `md` instead of a broken page.

Recommendation: **Option B now, Option A later.** B is about a day and stops
users hitting a dead page; A is a real refactor that should not block this plan.

### 4.1 Venue builder has no responsive work whatsoever

Unlike the event builder, the venue builder panes are hardcoded:

- `venue-builder/VenueResourcePalette.tsx:93` — `w-80`, no responsive variant
- `venue-builder/RevenueProjector.tsx:27` — `w-80`, no responsive variant

640px of fixed sidebar before any content. On a 768px tablet that leaves 128px
for the canvas. Needs the same `inDrawer` treatment the event builder already
has — copy that pattern rather than inventing a second one.

---

## 5. Breakpoint contract

Tailwind defaults, documented so people stop guessing. Only `2xl` is customised
(already 1400px in `tailwind.config.ts`).

| Token | Min width | Target | Layout intent |
|---|---|---|---|
| *(base)* | 0 | Phone portrait | Single column. Drawers, not sidebars. Bottom-anchored primary actions. |
| `sm` | 640 | Phone landscape / small tablet | Still single column; allow 2-up cards. |
| `md` | 768 | Tablet portrait | **The mobile/desktop line.** Sidebars may dock. Nav switches here. |
| `lg` | 1024 | Tablet landscape / small laptop | Two-pane layouts. Tables stop scrolling horizontally. |
| `xl` | 1280 | Laptop / desktop | Three-pane builders. Full blueprint sidebar. |
| `2xl` | 1400 | Large desktop | Cap content width; do not let line lengths run away. |

Rules:

1. `md` is the only place a layout may change from "stacked" to "docked".
2. Any fixed `w-[Npx]` or `w-80` must have a `max-w-full` or a breakpoint guard.
3. Anything wider than its container scrolls **inside itself** (`overflow-x-auto`),
   never on `body`. The admin tables already do this — match them.

---

## 6. Phased work

### Phase 0 — Defects and dedup (small, do first)

- [ ] Navbar hamburger `sm:hidden` to `md:hidden` (3.1)
- [ ] Align `useIsMobile` / navbar / docs on `md` = 768 (3.3)
- [ ] Interstitial below `md` for both builders (4, Option B)
- [ ] Deduplicate `/host/stripe-*` and decide on `/mayor/*` (2.6)

### Phase 1 — Shared primitives (highest leverage)

- [ ] `FormSection`, `StepperControl`, `input`, `glass-card` (2.4)
- [ ] Remaining 14 shared components
- [ ] Map surfaces (`LocationMap`, `MapboxLocationInput`, `MapboxLocationPicker`) as a separate touch task

### Phase 2 — Citizen-facing, by traffic

- [ ] `search` — all 5 components (2.1)
- [ ] `booking` — `AvailabilityCalendar`, `StripePaymentForm` first
- [ ] `venue` — `BookingWidget`, `VenueHeader`, `VenueCard`
- [ ] `user`, `gamification`, `review`, `auth`, `cancellation-policy`

### Phase 3 — Supply-side

- [ ] Wire `sheet.tsx` drawers + `inDrawer` in `create-event/page.tsx` (3.2)
- [ ] Same `inDrawer` pattern for the venue builder (4.1)
- [ ] `QRScannerClient` — mobile-native workflow, treat as citizen priority
- [ ] `asset` (4/5), `event` (6/9), rest of `dashboard`
- [ ] The four `[id]/edit` routes — one pattern, applied four times (2.5)

### Phase 4 — Wide screens and guardrails

- [ ] Audit the 12 distinct fixed `w-[Npx]` values (`w-[1600px]`, `w-[950px]`,
      `w-[800px]`, `w-[500px]`, ...) for `max-w-full`
- [ ] Add `lg:` / `xl:` layouts where only `sm:` / `md:` exist
- [ ] Cap content width at `2xl` (currently **0** usages)
- [ ] Extend `src/__tests__/responsive/` — it already asserts breakpoint classes
      in jsdom, which is cheap and fast
- [ ] Playwright viewport smoke test at 375 / 768 / 1024 / 1440 asserting
      `document.body.scrollWidth <= window.innerWidth`

---

## 7. Deliberately not in scope

- Rewriting the drag-and-drop engine (section 4, Option A) — sized on its own
- Native apps, PWA, or offline support
- Cesium map touch handling — vendor surface, needs its own investigation
- Admin below `lg` (see 2.3)
