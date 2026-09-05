# Responsive Plan — Mobile / Tablet / Laptop

Status: proposed — baseline re-measured 27 August 2026 at `ccfcf75`
Scope: `fox-passport-republic-app`
Role: input to [`TOMORROW.md`](./TOMORROW.md), which holds the running order.

This plan is written against the current code, not a generic checklist. Every
claim below was verified in the tree.

---

## 1. Where we actually are

Re-measured 27 August 2026. The original figures (26 Aug, in brackets) were taken
against a tree that has since grown ~15%, so the *proportions* below are the part
worth trusting — not any single count.

| Signal | Value | Was |
|---|---|---|
| Routes (`page.tsx`) | **71** | 66 |
| `.tsx` files in `src/` | **308** | 267 |
| Files with **no** breakpoint prefix at all | **159 (52%)** | 145 (54%) |
| `sm:` / `md:` / `lg:` / `xl:` / `2xl:` usages | 683 / 292 / 261 / **7** / **0** | 524 / 296 / 177 / 7 / 0 |
| Admin tables with `overflow-x` guards | 8 of 8 | *"10 of 10" — miscounted; there are eight `Admin*Table.tsx` files* |
| Touch / pointer event handlers in the whole app | **1 file** | 0 |

The `xl` / `2xl` numbers are still the story, and a month of work has not moved
them: layouts are built for one desktop width and one phone width, with very
little in between and **nothing at all above ~1280px**. The growth since the
first pass went into `sm:` and `lg:`, not the wide end.

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

### 2.3 Admin — mobile-*capable*, but not a mobile *target*

> **Corrected 27 August 2026.** This section previously read *"desktop-only is an
> acceptable answer"* and recommended scoping admin to `lg` and above. **That was
> wrong.** It was inferred from counting breakpoint prefixes per file — the same
> metric that missed the experience builder entirely (see §4.2). Checked directly,
> admin was already ~90% mobile-capable, so adopting the old advice would have
> meant **deleting working code**. Full workings in
> [`api-audit.md`](./api-audit.md) §3.4c.

| Feature | Files w/o breakpoints | Notes |
|---|---|---|
| `admin` | 3 / 16 | `AdminBookingsTable`, `AdminContent`, `AdminAuthGuard` |

What was already true before any work:

| Piece | State |
|---|---|
| Sidebar | Already an off-canvas drawer (`-translate-x-full` / `lg:translate-x-0`) |
| Content offset | `lg:pl-64` correctly drops the gutter below `lg` |
| Tables | All 8 table files carry `overflow-x` guards |
| Charts | Percentage-based CSS bars, not fixed SVG — they scale |
| **KPI cards** | **The one genuinely broken piece** — fixed, see below |

`AdminKPISection` was `grid-cols-1` at base with full desktop sizing (`p-6`, a
48px icon block, `text-4xl` values, a 100px decorative glyph), so four short
numbers each took a ~180px full-width row. One component made the whole page look
unbuilt.

**The guidance:** admin stays mobile-*capable* — the layout must not break at any
width, which is cheap and already true — but it is not a mobile *target*. Do not
optimise the data-dense tables for phones; a nine-column bookings table on a
400px screen scrolls horizontally whatever you do, and that is fine for a
spot-check.

Already done, both KPI rows (the Foxer dashboard's `KPICards` was worse — it did
not go 2-up until `md`, so even a large phone in landscape got one column):

- [x] `AdminKPISection` — 2-up at base, padding/type/icons scale up rather than
      starting at desktop size
- [x] `KPICards` — same treatment, so the two KPI rows behave identically
- [x] `AdminContent` page padding `p-8` → `p-4 sm:p-6 lg:p-8`
- [x] `AdminChartsSection` — card padding, gaps and bar-chart gutters scaled;
      seven bars with 16px gutters was mostly gutter on a phone

### 2.4 Shared primitives — fix these first, they lift everything

18 of 26 files in `src/shared/components` have no breakpoint prefix:

**Layout:** `BrandLogo`, `FileUploader`, `SessionTimeoutModal`

**Tally is stale as of 3 Sep** and not re-counted here. `navbar/BrowseDropdown`
was on the Layout line and `feat/map` deleted it with the rest of the navbar;
the same commit added `VenuesMap`, `VenuePolygonMapPicker`, `NavigationOverlay`
and `PageLoader`, none of which have been audited for breakpoints. The directory
now holds 27 files. Re-count before working this section.

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

`/host` and `/mayor` are widely assumed to be redirect shims — the assumption was
attributed to `CONTEXT.md` here, which does not in fact mention routes at all.
Whatever its source, it is only partly true:

| Route | Reality |
|---|---|
| `/host`, `/host/assets`, `/host/events`, `/host/venues`, `/host/services`, `/host/calendar`, `/host/apply`, all `[id]/edit` | redirect (fine) |
| **`/host/stripe-dashboard`** | **real page — `StripeDashboardClient.tsx` is byte-identical to the `/creator-dashboard` copy** |
| **`/host/stripe-onboard`** | **real page — same duplication** |
| **`/mayor/apply`**, **`/mayor/create-venue`** | **real pages, not shims** |

Deduplicate these **before** the responsive sweep, or the same layout work gets
done twice and the copies drift.

> **Still true on 27 August, with one wrinkle.** The two Stripe clients are still
> content-identical, but they no longer compare equal: the `/host` pair is CRLF
> and the `/creator-dashboard` pair is LF, so `diff` reports every line as
> changed. That is fallout from the `.gitattributes` added without
> `--renormalize` ([`api-audit.md`](./api-audit.md) §4.8) — files normalise as
> they are touched. Compare with `diff --strip-trailing-cr` until both sides have
> been rewritten, or the duplication looks like divergence.

---

## 3. Bugs to fix before any new work

Defects, not gaps. Cheap, and they should land first.

### 3.1 Navbar dead zone at 640–767px

- [x] **Fixed — but at `lg`, not the `md` this section prescribed.**

The defect as found: the hamburger was `flex sm:hidden` (gone at >=640px) while
the menu panel was `md:hidden`, so between 640px and 767px there was **no
navigation at all** — a band covering small tablets and most phones in landscape.

The fix that shipped moved *both* sides to `lg` rather than both to `md`:

| | Then | Line |
|---|---|---|
| Hamburger | `flex lg:hidden` | `src/shared/components/layout/Navbar.tsx:97` |
| Menu panel | `lg:hidden` | `navbar/NavMobileMenu.tsx:47` |

They agreed, so the dead zone was gone. But that decision moved the navigation
breakpoint to **1024**, which is what §3.3 is now about — do not "re-fix" this
one to `md` without reading that first.

**Overtaken 3 Sep, and the defect has inverted.** `feat/map` (#47) deleted both
files in that table along with the rest of the navbar, and `LandingHeader` took
over as the navigation component. Its desktop nav is `hidden md:flex` — visible
from **768** up — while `MobileBottomNav` is still `lg:hidden`, visible below
**1024**. So where 640–767 once had *no* navigation, **768–1023 now has two at
once**. Same root cause as the original defect: two halves of one navigation
disagreeing about where mobile ends. See `TOMORROW.md` §0a; the fix is a
one-line breakpoint change, but §3.3 below decides which line. Do not treat the
table above as current state.

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

### 3.3 Breakpoint semantics still disagree — the numbers just changed

- [ ] **Decide: is the mobile/desktop line `md` (768) or `lg` (1024)?**

| Source | Mobile cutoff | Was (26 Aug) |
|---|---|---|
| `src/shared/hooks/useMobile.ts:5` | 768 (`md`) | 768 (`md`) |
| `MobileBottomNav:175` | 1024 (`lg`) | — |
| `tailwind.config.ts` `2xl` | overridden to 1400px | same |
| ~~Navbar hamburger + `NavMobileMenu`~~ | *deleted 3 Sep* | 640 (`sm`) |

Fixing §3.1 closed the gap between the hamburger and its own panel, but it did
so by moving navigation to `lg` — so the disagreement with `useMobile` survived
and only its numbers changed. §5 below still declares `md` "the mobile/desktop
line", which `MobileBottomNav` still contradicts.

The navbar's deletion did not settle this — it made it worse. The replacement,
`LandingHeader`, put its desktop nav at `md` while `MobileBottomNav` stayed at
`lg`, so the two halves of the current navigation now disagree by a full
breakpoint and both render between 768 and 1023 (§3.1). `useMobile` at 768 makes
three voices, two of which are live in the same component tree.

This is now the blocking item rather than a tidy-up: **§3.1 cannot be fixed
without answering it**, because the one-line fix is choosing which of `md` or
`lg` both halves move to. Answer it here, then apply it in `LandingHeader` and
`MobileBottomNav` together.

This is a real decision, not a defect: `lg` is defensible for a nav bar with this
many items, and `MobileBottomNav` already assumes it. Either move `useMobile` and
§5 to `lg`, or move the navbar back to `md`. **Do not leave two answers in the
tree** — that is what produced the original dead zone.

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

### 4.2 The experience builder — the one on the citizen path

Added 27 August 2026. The original sweep missed this entirely: it counts
breakpoint prefixes per file, and this component has twelve, so it scored as
"handled". It is drag-and-drop, so it does nothing under a finger — and unlike
the event and venue builders, **a citizen hits it while browsing a venue**.

It exists twice, and neither copy is a file named `CustomExperienceBuilder`, so
grepping that name finds nothing and reads as "already done":

- `src/features/venue/components/detail/ExperienceBuilder.tsx` — the component,
  rendered from `VenueDetailClient`
- `CustomExperienceBuilder` — declared **inline** at
  `src/app/event/[eventId]/page.tsx:21`, inside a 1,483-line page, with its own
  `draggable` / `onDragStart` handlers

Dedupe before fixing, or the touch work gets done twice. Same Option A / Option B
choice as §4 above applies once there is one copy.

---

## 5. Breakpoint contract

Tailwind defaults, documented so people stop guessing. Only `2xl` is customised
(already 1400px in `tailwind.config.ts`).

| Token | Min width | Target | Layout intent |
|---|---|---|---|
| *(base)* | 0 | Phone portrait | Single column. Drawers, not sidebars. Bottom-anchored primary actions. |
| `sm` | 640 | Phone landscape / small tablet | Still single column; allow 2-up cards. |
| `md` | 768 | Tablet portrait | **The mobile/desktop line.** Sidebars may dock. ~~Nav switches here.~~ — nav now switches at `lg`; see §3.3, undecided. |
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

- [x] Navbar hamburger dead zone closed — shipped as `lg:hidden` on both the
      toggle and the panel, not the `md` originally prescribed (3.1)
- [ ] Align `useMobile` / navbar / §5 on one line — `md` (768) or `lg` (1024).
      Still two answers in the tree (3.3)
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
- ~~Cesium map touch handling~~ — dropped, not deferred: there is no Cesium
  component anywhere in `src/`, only an unused dependency, webpack external,
  CSS import and env token. Nothing to give touch handling to yet. See
  `ARCHITECTURE.md`'s "External services" section.
- ~~Admin below `lg`~~ — that advice was wrong and has been replaced; admin is
  mobile-*capable* and stays that way (see 2.3)
