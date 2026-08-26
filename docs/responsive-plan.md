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

### 3.4 Supabase is dead code — remove it

Supabase is fully orphaned. Nothing in the app reaches it: the real data layer is
`src/shared/lib/server/data.ts` (axios against `NEXT_PUBLIC_API_URL`) and auth is
cookie/JWT based (`server/auth.ts`, `jose`).

| Artifact | Reality |
|---|---|
| `src/shared/lib/supabase.ts` | browser client — **0 importers** |
| `src/shared/lib/server/supabase.ts` | server client — imported only by `business.ts` |
| `src/shared/lib/server/business.ts` | `createEvent` / `createVenue` / `cancelBooking` — **0 importers**, not re-exported by `server/index.ts` |
| `@supabase/ssr`, `@supabase/supabase-js` | 2 deps in `package.json` |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | placeholder values in `.github/workflows/ci.yml:20-21` |

`business.ts` is also unsafe if anyone ever wired it up — `data: any` params and a
null deref on `booking.user_id` when the row is missing. Deleting it is strictly
better than fixing it.

**Fix:** delete the three files, `pnpm remove @supabase/ssr @supabase/supabase-js`,
drop the two CI env lines. No runtime behaviour changes. Not responsive work, but
it is three files off the 145-file unhandled count and removes a second, phantom
auth path that will confuse anyone touching `server/`.

**The API had the same dead footprint** (found while checking the Stripe return
URLs, see 8.2): `fox-passport-republic-api/src/utils/supabase.ts` held three
storage-upload helpers with **no importers** — real uploads go through S3
(`utils/s3.ts`, `services/s3.service.ts`). Its `createClient(...)` ran at module
load against env vars that are commented out, so importing it at all would have
crashed the server on boot. Removed along with the three `config.ts` exports, the
`@supabase/supabase-js` dep, and the env entries in `.env` / `.env.docker`.
Supabase is now gone from **both** repos.

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

Rules — width:

1. `md` is the only place a layout may change from "stacked" to "docked".
2. Any fixed `w-[Npx]` or `w-80` must have a `max-w-full` or a breakpoint guard.
3. Anything wider than its container scrolls **inside itself** (`overflow-x-auto`),
   never on `body`. The admin tables already do this — match them.

### 5.1 The second axis: input, not width

Width is only half of responsive, and the half this document was originally built
to measure. A component can score perfectly on breakpoint coverage and still be
unusable on a phone, because prefix-counting measures whether someone *thought
about* small screens — not whether the thing works on one.

`ExperienceBuilder.tsx` is the proof: 13 breakpoint prefixes, carefully built
`grid-cols-1 md:grid-cols-2 xl:grid-cols-3` layouts, **not named anywhere in the
original audit** — and completely non-functional on touch, because its core
interaction is HTML5 drag-and-drop. It looks right and does nothing. See section 4.

Tailwind v4 ships `pointer-coarse:` / `pointer-fine:` variants, so this axis is
expressible in the same place as everything else. **Zero of the 267 files used
them before this plan.**

Rules — input:

4. **No control may be revealed only on `hover:`.** Pair it with a pointer
   variant. Write the base state as visible and restrict the reveal to fine
   pointers, not the other way round:

   ```
   opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100
   ```

   Written this way, an ordering surprise leaves the control *visible*. The
   inverse (`... pointer-coarse:opacity-100` appended) fails *hidden* — which is
   the bug being fixed. Note `opacity-0` still receives taps, so a hover-gated
   button on touch is not dead, it is **invisible but tappable**: undiscoverable,
   and hit by accident.
5. **Any drag interaction needs a tap path.** HTML5 drag-and-drop
   (`draggable` / `onDragStart` / `onDrop`) never fires on touch — this is a
   property of the API, not a bug. A drag-only affordance is desktop-only by
   construction.
6. **Interactive targets are >=44px on coarse pointers.** `TrendingSection.tsx:137`
   already does this (`h-11 w-11 sm:h-10 sm:w-10`) — match it.

Why this was never caught: it produces no crash, no console error and no layout
break, and **checking a breakpoint by resizing the browser window keeps the
mouse**. Every routine check exercises width and none exercise input. The durable
fix is a Playwright project with `hasTouch: true` — `@playwright/test` is already
a devDependency with no config file (see Phase 4).

---

## 6. Phased work

### Phase 0 — Defects and dedup (small, do first) — **DONE**

- [x] Navbar dead zone (3.1) — all three toggles moved to `md`, not just the
      hamburger: the search and Sign In buttons were also `hidden sm:flex` and
      are redundant below `md` because `NavMobileMenu` already carries Log In /
      Sign Up. One breakpoint now, per section 5 rule 1.
- [x] Align `useIsMobile` / navbar / docs on `md` = 768 (3.3) — `useMobile.ts`
      was **already** 768; only the navbar disagreed. No hook change needed.
- [x] Interstitial below `md` for all **three** builder shells (4, Option B) —
      `shared/components/layout/BuilderDesktopOnly.tsx`. The plan said "both
      builders"; there are three host pages sharing one `fixed inset-0` shell:
      `foxer/create-event`, `mayor/create-venue`, `creator-dashboard/venues/[id]/edit`.
      CSS-only (`md:hidden`), not `useIsMobile` — renders on the server and never
      flashes the broken builder during hydration.
- [x] Deduplicate `/host/stripe-*` (2.6) — both byte-identical copies replaced
      with redirect shims. Redirect rather than delete, so any Stripe Connect
      `return_url` generated server-side still lands. `/host` is now 100% shims,
      which is what `CONTEXT.md` always claimed.
- [x] Decide on `/mayor/*` (2.6) — **keep as real pages.** They are the only
      implementation of those two flows and are linked from six call sites in
      `dashboard`, `onboarding` and `venue`. `CONTEXT.md` line 126 was wrong and
      has been corrected so nobody "cleans them up" into redirects later.
- [x] Remove Supabase — 3 dead files, 2 deps, 2 CI env vars (3.4)
- [x] Regression test — `src/__tests__/responsive/Navbar.test.tsx` locks the
      breakpoint agreement and the builder guards so 3.1 cannot silently return.

Verified after: `tsc --noEmit` clean, `eslint src/` clean, `next build` clean,
14/14 responsive tests pass.

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


---

## 8. Open items — tracked

Everything found so far that is not yet closed. Phase 0 is done (see section 6);
these are what remain.

### 8.1 Decisions that need an owner — not mine to make

- [ ] **Touch support for the builders (section 4).** Option B shipped, so
      phone-only Foxers now get "open this on a larger screen" with no date
      attached. Decide whether that stands or Option A gets scheduled.
      `@dnd-kit/core` is **not** currently a dependency, so A is a new dep plus a
      refactor of `useEventBuilder`, `ResourceCard` and `CorePackageDropZone`.
- [ ] **Finish the `/mayor` rename, or keep the old vocabulary in URLs.**
      `/mayor/apply` and `/mayor/create-venue` are kept (2.6) because they are the
      only implementation of those flows, but they keep pre-rename wording in
      user-visible URLs. Migrating them to `/creator-dashboard/*` with shims left
      behind is its own ticket — not a responsive change.
- [ ] **Commit and branch.** Frontend work sits staged on
      `chore/dedupe-data-fetching`; API work is unstaged on `main`. The API changes
      are unrelated to that branch's subject and probably want their own.

### 8.2 Cross-repo defects found on the way — fixed

- [x] **Stripe Connect onboarding could not complete.**
      `STRIPE_CONNECT_RETURN_URL` / `_REFRESH_URL` were read with a bare
      `as string` cast in `api/src/config.ts` and were **not set in `.env`**, so
      `undefined` reached `stripe.accountLinks.create` in
      `services/stripe-connect.service.ts` (both call sites). The cast is what hid
      it from the typechecker. Now defaulted off the existing `FRONTEND_URL`.
- [x] **The only documented sample pointed at routes that do not exist.**
      `api/.env.docker` used `/dashboard/payouts/return` and `/refresh`; the
      frontend has no `/dashboard` segment and no `payouts` route. Anyone copying
      that sample sent providers to a 404 at the end of Stripe-hosted onboarding.
      Repointed at `/creator-dashboard/stripe-dashboard` and `/stripe-onboard`.
- [x] **Supabase removed from the API too** — see 3.4.

### 8.2b Input-modality sweep — the blind spot in section 1's metric

Section 1 counts breakpoint prefixes. That metric cannot see whether a component
works on touch (section 5.1). Swept the whole tree for the class it misses:

| Class | Result |
|---|---|
| Right-click / double-click affordances | **0** |
| Mouse-event-driven state | 2 files |
| Hover-reveal | 18 files — nearly all decorative (glows, badges, several `pointer-events-none`) |
| **Hover-gated actual controls** | **4 buttons in 2 files** |

The class is small and bounded — it is the drag-and-drop surfaces plus four
buttons, not systemic rot.

- [x] Four hover-gated remove/cancel controls fixed with `pointer-fine:`
      (`EventGallery.tsx:73,105`, `event/[eventId]/page.tsx:447,488`). All were
      `opacity-0 group-hover:opacity-100` — invisible but tappable on touch.
- [x] Section 5 extended with the input axis (rules 4-6).
- [ ] **`CustomExperienceBuilder` exists twice, in two separate implementations.**
      `src/app/event/[eventId]/page.tsx:19` defines one locally; `VenueDetailClient`
      imports a different one from
      `src/features/venue/components/detail/ExperienceBuilder.tsx`. Same flow, two
      copies — the same trap as the Stripe pages in 2.6. **Deduplicate before**
      doing tap-to-place (8.1), or the work gets done twice and the copies drift.
- [ ] **Playwright touch harness.** `@playwright/test` is a devDependency with no
      config file. A project with `hasTouch: true` covering the three DnD surfaces
      makes this entire class catchable in CI, and is the same harness Phase 4
      needs for the `scrollWidth` check — an argument for pulling it forward.
- [ ] Sweep for the remaining modality-dependent affordances not covered here:
      keyboard-only focus traps, and the 2 files with mouse-driven state.

### 8.3 Nits from verifying this document

- [ ] `SearchFilters.tsx:268` has a lone `onTouchEnd`, so the "0 touch handlers"
      figure in section 1 is really 1. Does not change the argument — the builders
      still have none — but the number should be corrected if this doc is reused.
- [x] Route count is 65, not 66.

### 8.4 Remaining phases

- [ ] Phase 1 — shared primitives (`FormSection`, `StepperControl`, `input`,
      `glass-card`, then the other 14, then map surfaces)
- [ ] Phase 2 — citizen-facing, `search` first
- [ ] Phase 3 — supply-side, including wiring the `inDrawer` drawers that already
      exist and `QRScannerClient`
- [ ] Phase 4 — wide screens, `max-w-full` audit, Playwright viewport smoke test
      (note: `@playwright/test` is a devDependency but there is **no Playwright
      config yet** — that task is a harness setup, not an incremental test add)
