# Next

**The running order.** Rewritten 2 Sep 2026, revised 4 Sep after `main` took
role assignment and `feat/map`, again 7 Sep for the auth hardening chain, and
9 Sep when the API work moved to its own `NEXT.md` — the previous 916-line
version had 47 completed items in it and is in git history if the reasoning
behind any of them is ever needed.

**This file is the app.** The API has its own running order at
`../fox-passport-republic-api/docs/NEXT.md`; the live work is there, not
here.

| Document | Role |
|---|---|
| `NEXT.md` (this file) | **What to do next.** Nothing else. |
| `VERIFY.md` | The browser runbook. **Fully run 12 Sep** — all 16 checks driven at least once, all passing except B1's caveat (see below) and B3 (indirect coverage only). |
| `RBAC.md` | Target state, migration history (invariants, prior art), and template-boundary conformance. `RBAC-PLAN.md` was folded in here 13 Sep now that the migration is done. |
| `ARCHITECTURE.md` | The system as built — now also carries the durable parts of `app-architecture.md` (template-gap inventory, the two "don't fix these" call-outs), folded in 13 Sep once Feature Isolation hit 0 violations and the rest of that doc was just stale violation-tracking. |
| `api-audit.md` | The record: API, data-fetching and auth findings. 8 open (re-audited 12 Sep — §3.4c closed, §4.12 partially closed). |
| `BUSINESS-STRATEGY-MASTER.md` | Business Strategy layer, one level above `DYNAMIC-EVENTS-PRODUCT-MASTER.md` in the Strategic Hierarchy. Added 14 Sep, reconciled the same day against current implementation — see its §1a for what was adjusted and why. |
| `responsive-plan.md` | Responsive and touch backlog. 21 open. |
| `roles-and-spaces.md` | The Foxer role model and the page split. 12 open (3 resolved — `useRoleAccess` blocker closed, `LockedSection` removed, hint added). |
| `CENTRAL-PAYMENT-FRONTEND-PLAN.md` | Central Payment frontend. Built and reviewed 13 Sep — one panel deliberately not built, see the doc. |
| `SPATIAL-PLAN.md` | The spatial vision and counter-plan: what already exists, and the order to build in. `FoxPassportSpatialIntelligence.md`'s still-valid principles were folded in here 13 Sep; its wrong stack/sequencing assumptions were not. |

---

## 0·0aa. `proxy.ts` (formerly `middleware.ts`) does not run at all — found 12 Sep, upstream bug

**Every one of the 16 `PROTECTED_ROUTES` trees serves a plain 200 with real
page markup to a signed-out `curl` request — no redirect, at the HTTP level,
at all.** Found running `VERIFY.md` C1. Confirmed not a data leak: each
tree's own `requireAuth()`/`requireAdmin()` layout guard still fires
correctly (the `NEXT_REDIRECT;replace;/;307` digest is present in the
streamed RSC payload), so a real, JS-executing browser still ends up
redirected to `/` — which is exactly why unit tests and casual clicking
around never caught this. What's actually gone is the fast pre-render
redirect, and the only protection a non-JS client (a bot, a crawler, a
disabled-JS browser) ever had.

**Root cause: Next.js 16.3.4 doesn't wire up `middleware.ts`/`proxy.ts` at
all**, in dev (webpack or Turbopack) or a real `next build` — reproduced with
both filenames, at both the project root and `src/`.
`.next/{dev/,}server/middleware-manifest.json` stays `{ "middleware": {} }`
regardless. Traced into `next`'s own source: the file is detected (the
middleware-to-proxy deprecation warning fires correctly) but the variable
that detects it is never read again to actually register an entry. This
looks like an upstream bug in the mid-migration state of this exact Next.js
version, not anything fixable in this repo. Full writeup, including what was
traced and how, is in `VERIFY.md`'s C1 result — **read that before
re-investigating, so the same ground doesn't get covered twice.**

**Renamed `middleware.ts` → `proxy.ts` anyway** (also updated
`src/__tests__/auth/middlewareSecrets.test.ts`, which read it by literal
path) since it's the correct target regardless of the current bug and
removes the deprecation warning. `pnpm test` 144/144 green.

- [ ] **Watch for a Next.js patch release** and re-test C1 after any Next.js
      version bump — this may simply resolve itself.
- [ ] **Consider filing an upstream issue** if one doesn't already exist
      (searched briefly, didn't find an exact match for this symptom).
- [ ] **Not urgent to work around** — the real security boundary
      (`requireAuth`/`requireAdmin` plus the API's own 401/403) is intact.
      The only exposure is a bot/crawler/no-JS client seeing an empty page
      shell (title, layout chrome, no real data) for a protected route
      instead of being redirected.

---

## 0·0ab. A citizen's disputed booking is invisible to every admin — found 12 Sep

**`PATCH /bookings/:id/dispute` (the plain `Booking` model) sets a real
status and fires the `disputes` socket topic, but `GET /admin/disputes` only
ever queries `Refund` rows** — a disputed booking never appears in the admin
Disputes tab, at all. The frame that announces it is real and correctly
formed; it just triggers a refetch of a list that structurally cannot contain
the row. Full writeup, including how it was found and confirmed, is in
`VERIFY.md`'s B1 result.

**Not currently exploitable/user-facing**, which is the only reason it's
survived: the one UI action that calls a "dispute" endpoint
(`reportNoShow()`) is typed to asset/service bookings only, which correctly
feed their own separate, properly-wired panels
(`/admin/asset-bookings/disputes`, `/admin/service-bookings/disputes`) —
confirmed working. The generic `Booking.dispute()` path has no caller in the
app today, so nothing currently relies on it working.

- [x] **Decided and done, 13 Sep: deleted.** Confirmed zero UI callers (the
      only "dispute" action in the app always hits the type-scoped
      `/asset/bookings/:id/dispute` / `/service/bookings/:id/dispute`, never
      this generic one) and zero admin-side usage. Route, controller, service
      and repository method all removed, along with `"disputed"` as an
      allowed value on the generic `PATCH /:id/status` endpoint — a second,
      equally invisible door onto the same dead state. `fox-passport-republic-api`
      commit `58298fe`.
- [ ] **Check this stayed deleted.** As of 24 Sep no dispute route is
      registered in the api's `booking.routes.ts`/`booking.controller.ts`, but
      a comment in `booking.service.ts` (above `updateStatus`) now speaks of
      giving the Event-flow `Booking` "the same active/disputed lifecycle" as
      asset bookings. Either the comment is loose wording, or `disputed` is
      coming back onto the generic path — in which case this whole finding
      re-opens, because `GET /admin/disputes` still only reads `Refund` rows.

---

## 0·0ac. Central Payment frontend landed and reviewed — 13 Sep

The api's Central Payment backend (Invoice/Checkout/Payment/Payout/Voucher/
PricingEngine, plus bidding and partnership) had zero frontend integration as
of `api-audit.md`'s last pass — see `CENTRAL-PAYMENT-FRONTEND-PLAN.md` for
the full plan. Both the backend HTTP layer (`fox-passport-republic-api`
commit `09e893e`) and this app's integration have now landed and been
reviewed; that plan document carries the full "Built and reviewed" record.

**The one bug worth knowing about even without opening that doc:** the
plan's own testing checklist named "pay successfully → browser redirects →
webhook hasn't landed yet → success page must show confirming, not a false
state" as the check most likely to be skipped — and it was, and it did
produce a real bug. `useInvoiceStatusPoll` and `CentralPaymentStatusClient`
both polled/rendered on `status === "processing"`, a value **nothing in the
API ever sets** — the real pre-webhook state is `"pending"`. A citizen
landing on the success page right after paying would see a raw
`Status: pending` line and the page would never poll again. Fixed; see the
plan doc for the rest (a viewer-scoping gap on the sponsorship "Pay Now"
button, and `refunded`/`partially_refunded` not being handled as terminal at
all).

**Since done:** the `EventPaymentPanel.tsx` breakdown, which was deliberately
left out at review time (the plan called it "the bigger of the two frontend
pieces"). The panel now renders a "What you're paying for" list — per
venue/asset/service line with provider name, amount and discount — landed in
`12e45af`. Confirmed in code 24 Sep; not yet driven in a browser.

## 0·0a. The booking page could not hear the socket — fixed 10 Sep

`BookingDetailClient` fetched in a `useEffect` and held the booking in component
state, which put it outside React Query and therefore out of reach of every
`data:invalidate` the server sends. A payment would settle, the frame would
arrive 73ms later, and the page would go on reading **Pending** until someone
reloaded it.

This is the same defect `VERIFY.md` B3 records for the bookings *list* at
`/booking`, one screen further in. The list was converted; the detail page was
missed, and nothing pointed at it because a screen that never updates looks
exactly like a socket that has nothing to say.

Found by actually running B4 - see `VERIFY.md`, which now carries the result.
After the fix the page flips in 585ms. **If another screen ever "doesn't update",
check whether it is on React Query before checking anything else.**

---

## 0·0. Picking this up on another machine

Written 4 Sep. **Read this before cloning anywhere new.** The repositories carry
the code; they do not carry the two things most likely to waste your first hour.

### Where the work lives

**See §0 for the current branches**, and `git branch -vv` for what is pushed —
§0 deliberately no longer counts. As of 9 Sep the live work is **in the API
repository**, on `feat/redis-backed-rate-limiting`, and it is large: caching,
the controller extraction, and a test database. A fresh clone of the app gets
all of the app, and none of that. The app's own unmerged half is
`feat/auth-03-api-cookies`.

The `refactor/api-structure` / `refactor/app-structure` branches this section
used to name are **merged**, as are `feat/role-assignment` and
`fix/secretary-admin-console`. The empty `docs/role-model` branch in the app
still holds nothing and can still be deleted.

### What does not travel

- **The database.** A clone has no data. `prisma migrate deploy` then
  `pnpm exec tsx prisma/seed.ts` gives you 148 users, 128 venues, 128 assets,
  298 services, and both an `admin` and an `admin_secretary` — which the RBAC
  boundary work needs.
- **`.env`.** Gitignored in both repos, and `.env.example` does not carry
  secrets. The API refuses to start on a missing or weak token secret, which is
  deliberate, so this fails loudly rather than quietly.
- **`node_modules` and `.next`.** Expected — but note a **stale `.next` makes
  `tsc` report errors that are not real**, naming a route group deleted weeks
  ago. `rm -rf .next` clears it. See §5.

### A fresh clone is the *safe* case for migrations

Worth stating plainly, because the opposite is true of the machine this was
written on. The migration sequence is order-dependent: main's older migrations
reference pre-rename table names, so a database that applied
`20260904140000_rename_tables_to_snake_case` *before* them breaks.

A fresh database replays all 58 in order and lands correctly — verified against
a throwaway database. **So a new machine is fine.** Only a database that was
mid-refactor can be in the broken state, and `prisma migrate reset` fixes it.

### First commands

```
# api — see that repo's docs/NEXT.md, which is authoritative for it
pnpm install
pnpm exec prisma generate          # the client is not committed
pnpm exec prisma migrate deploy
pnpm exec tsx prisma/seed.ts
pnpm validate
pnpm exec vitest run               # expect: 313 passing, 27 files, 0 errors

# app
pnpm install
pnpm type-check && pnpm test       # expect: clean, 180 passing (26 files, 24 Sep)
node tools/validate-architecture.mjs   # expect: clean — currently 16 violations, see below
```

The API count was 198 here until 9 Sep, and the command carried two
`--exclude`s because two specs deleted from the development database. Both are
fixed: that suite has its own database now and runs whole (380 passing specs).

**Do not reach for `pnpm db:setup`.** It is
`prisma generate && prisma migrate dev`, and `migrate dev` is the command that
offers to reset the database when it sees drift — it wiped 148 users and
everything else on 4 Sep. It is harmless against a genuinely empty database, but
the explicit commands above never prompt, so use them and keep the habit.

**The count is 0, as of `e507f9a` (13 Sep).** Baseline was 150, then 72, then 20,
then 26 (measured 12 Sep — the 20 in `republic` and 6 in `user`/`follow`/`block`
were all Feature Isolation Boundary violations; the shared-kernel rule was
already at zero). `e507f9a` finished the follow/block/messages boundary
refactor and closed out the remainder. The command now exits zero and stays
that way — if it goes non-zero again, something regressed.

- [ ] **It regressed — 16 violations as of 24 Sep**, all Feature Isolation
      Boundary, all in committed code (none from the uncommitted checkout
      work). The clusters: `messages/MessageButton` (and `useMessages`,
      `useChatWindowsStore`, `SharePostModal`) imported from `booking`,
      `gamification`, `investment`, `venue` and `republic`;
      `booking/api/bookings` + `AvailabilityCalendar` imported from `asset`
      and `service`; `event` → `venue-affiliation`; `venue-affiliation` →
      `search`; `investment` → `venue/api`. Re-run the command for the
      current list rather than trusting this one.

### Read first, in this order

1. `api/docs/GOTCHAS.md` — ten things that fail quietly, one of which drops 26
   tables. Before touching migrations, the schema, or moving files.
2. This document, §1 onward — the running order.

Everything else is lookup. `api-audit.md`, `RBAC.md` and `RBAC-PLAN.md` are
records rather than instructions; grep them, do not read them.

---

## 0. In flight — as of 9 Sep

**The live work is in the API repository**, and its running order is
[`../fox-passport-republic-api/docs/NEXT.md`](../../fox-passport-republic-api/docs/NEXT.md).
Nothing in the app is in flight. What follows is what the app still owes.

**Auth hardening. All six are written; the browser pass is what is left.** The
api half merged to `main` via PR #77 on 8 Sep, and **the app half merged 12 Sep
via PR #60** (`merge-auth-03-into-main`, a real merge against a `main` that had
moved a lot since the branch was cut — `feat/map`, `feat/foxcommunity`, role
assignment, `/host` → `/creator-dashboard`, all landed in between). Two
conflicts, in `useLogout.ts` and `AuthStoreProvider.tsx`, resolved in favor of
the `endSession()` abstraction while keeping `main`'s `promptLogin` option and
`/?auth=expired` toast handoff. Both repos' cookie authorship is now live on
`main` together, which should close the mismatched-relay bug — **not yet
confirmed in a browser**. The tracked list is
[`AUTH_HARDENING.md`](./AUTH_HARDENING.md); this is only the pointer.

Order was `AUTH-01 → AUTH-02 → AUTH-03 → AUTH-05 → AUTH-04 → AUTH-06`, and with
AUTH-05 and AUTH-06 landed on 8 Sep **the auth architecture is frozen** — no
further changes without a decision recorded in `AUTH_HARDENING.md`.

What is not done is verification. None of AUTH-02, 03 or 05 has been exercised in
a browser, and those are the three that unit tests cannot vindicate: the cookie
relay and the second-device revocation. The six checks are written out as
**§ Browser verification** in `AUTH_HARDENING.md` — this document pointed at an
end-to-end pass "written into `AUTH_HARDENING.md`" that did not exist until
8 Sep, and `VERIFY.md` covers sockets and page guards, not auth.

**AUTH-05 is unblocked (24 Sep).** The api's `.env` now carries both
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, so the one path AUTH-05 changes
can finally be exercised. AUTH-02, AUTH-03 and AUTH-05 are all testable now.

**`VERIFY.md`'s account passwords disagree with the seeders** — correct for an
existing database, wrong for a fresh clone. Flagged in that file.

The two that closed on 8 Sep, for the record:

- [x] **AUTH-05** — Google sign-in now calls `revokeAllForUser` before issuing,
      so no entry path escapes one-session-per-account. `google-auth.service.ts`,
      four tests. **Not yet checked from a second device.**
- [x] **AUTH-06** — the three `[DEV]` OTP logs in `auth.service.ts` are behind
      `isDev`, so a mail outage in production no longer files each code next to
      its address; the `console.error` beside each still records the failure.
      `generateOTP` draws from `crypto.randomInt` across the full six-digit
      space — the old expression could never produce a code below `100000`.
      `tests/auth.otp.spec.ts`, seven tests.

### The branches

**`git branch -vv` in each repo is the authority, not this table.** It has been
corrected three times in one day and was wrong within the hour each time — a
count of what is pushed goes stale the moment anyone pushes. What is worth
writing down is which branch holds which work and what depends on what; the
remote state is a lookup.

**api** — one chain off `main`, plus one unrelated doc branch.

| Branch | Holds |
|---|---|
| `feat/auth-01-rate-limiting` | AUTH-01 |
| `feat/auth-03-api-cookies` (off the above) | AUTH-03, api half. `main` merged in 8 Sep |
| `feat/auth-05-google-session-revocation` (off the above) | AUTH-05 and AUTH-06, one commit each |
| `docs/test-suite-wipes-dev-db` (off `main`) | the GOTCHAS entry. Unrelated to auth, can land on its own |

Merging the tip lands all four auth items at once — the chain is linear.

**app** — both merged into `main` now.

| Branch | Holds |
|---|---|
| `feat/auth-03-api-cookies` | AUTH-02, AUTH-03, and the session-end work. Merged into `main` 12 Sep via PR #60 (as `merge-auth-03-into-main`), against a `main` that had moved substantially since — see §0 above for the conflicts and their resolution. |
| `docs/auth-hardening-tracking` | this file, `AUTH_HARDENING.md`, `ARCHITECTURE.md`, `VERIFY.md`. `main` merged in |

`fix/session-end-consolidation` and `feat/auth-02-proxy-login` still exist
locally but are **fully contained** in `feat/auth-03-api-cookies` — redundant,
not pending. Delete them or leave them; they hold nothing the code branch lacks.

The `shared/lib/axios.ts` collision the earlier version of this section warned
about is **resolved**, in that merge. Both branches had rewritten the 401
interceptor: the session-end structure won, using AUTH-02's shared
`isPreSessionAuthPath` rather than its own pair of `url.includes` checks.

**`AUTH_HARDENING.md` lives only on the docs branch.** The session-end branch
carried its own older copy, which made an add/add conflict whose wrong
resolution would have reverted the AUTH-05/06 closure; it was removed from the
code branch on 8 Sep. If it reappears on a code branch, that is the bug.

api 238 tests, app 140. Two api specs that used to fail — `event-template.submit`
and `waitlist` — pass since the pending migrations were applied; see GOTCHAS 7b
for what that cost.

**AUTH-06 is independent of the cookie chain** — it touches
`auth.service.ts` and `otp.utils.ts`, which nothing else in the chain does — so
it cherry-picks onto `main` cleanly if it wants reviewing on its own. As it
stands the PR stacks on `feat/auth-03-api-cookies` and carries that branch's
diff until AUTH-03 lands.

api 221 tests pass with 17 skipped, app 127 green, no lint errors either side.
Two api specs fail — `event-template.submit` and `waitlist` — but they fail on
plain `main` too and are unrelated to any of this. The only app type-check
errors are the two pre-existing `.next/types/validator.ts` ones.

**The api needs `prisma migrate` before it will run.** `main` brought a
migration and `isPrivate` on `identity.prisma`; `prisma generate` alone is what
makes `tsc` pass, not what makes the database match.

### Three things to know before merging any of it — merged 12 Sep, kept for the record

1. **None of AUTH-02, AUTH-03 or AUTH-05 has been run in a browser.** A cookie
   relay, and a revocation that only shows itself on a second device, are
   precisely what unit tests cannot vindicate. `VERIFY.md` and the end-to-end
   sequence in `AUTH_HARDENING.md` matter more here than usual — especially
   watching the rotated cookie values actually change in the Application tab.
2. **Merge `fix/session-end-consolidation` before the AUTH-03 branch.** Both
   rewrite `shared/lib/axios.ts` and the proxy route heavily; taking them in the
   other order means resolving that collision twice.
3. **Land this docs branch early.** It carries `AUTH_HARDENING.md`, which is
   otherwise stranded on `fix/session-end-consolidation` — which is why AUTH-02
   and 03 are done but unticked there.

### Decisions already made — do not re-open

Recorded with reasoning in `AUTH_HARDENING.md`. Rejected: `tokenHash` (the
refresh token is a signed JWT and only the jti is stored, which beats storing a
hash), refresh-token **families** and the **sessions UI** (one session per
account means one live chain, so `revokeAllForUser` already is family
revocation), and MapAnytime's `activeSessionId` (immediate revocation, at the
price of a database lookup on every authenticated request). The ≤15-minute
window in which a signed-out access token still works is an **accepted
consequence** of the stateless model, not an oversight.

---

## 0b. Landed 4 Sep — open follow-ups from it

Role assignment **shipped**. Both PRs are merged and everything §0 asked for on
3 Sep is on `main`:

| | PR | |
|---|---|---|
| api `feat/role-assignment` | #69 | merged |
| app `fix/secretary-admin-console` | #45 | merged |

So `roles:assign`, `AuditLog`, `audit.service.ts`, `role-assignment.service.ts`,
`PATCH /v1/admin/users/:id/system-role` + `/role-types`, and the
`RoleAssignmentControls` UI that calls them are all live on `main`. The
`$transaction` fix (`3bc9cfc`) went with them.

**`feat/map` merged in the same window** — app #47, api #70 — and no document
here covers it. It brought `VenuesMap`, `VenuePolygonMapPicker`,
`AdminVenuesMap`, the app's `shared/lib/polygonGeo.ts` (a client-side mirror of
the API's `utils/geo.ts`, used only for live UI feedback — the API is the real
source of truth), venue boundary polygons, and the navbar deletion in §0a
below. `mapbox-gl` was already a dependency and `NEXT_PUBLIC_MAPBOX_TOKEN` is
set in `.env` and documented in `.env.example`, so there is no new setup.

**Audited 5 Sep — real integration, but four gaps worth tracking:**

- [x] **Polygon math test coverage added.** `tests/geo.spec.ts` in API (12 tests)
      and `src/shared/lib/__tests__/polygonGeo.test.ts` in App (17 tests) exercise
      geometry validation, intersection, overlap rejection, point-in-polygon,
      and degenerate/self-intersecting rings. Component rendering remains unexercised.
- [x] **`features/venue/hooks/useVenueMapLogic.ts` deleted.** Exported from
      the feature barrel with zero call sites, and its own logic was worse
      than dead: when a live Mapbox geocoding search returned fewer than 15
      results it fabricated fake venues — placeholder `picsum.photos` images,
      random prices/ratings/capacities, names drawn from a five-item hardcoded
      list. Looked like an abandoned prototype for venue discovery, superseded
      by the real `/venues/near` + `VenuesMap` flow, never removed.
- [x] **`GET /venues/near` had no frontend caller — wired up 12 Sep.** Added a
      "Near Me" toggle on `/venues/map` (`fetchVenuesNear` in
      `features/venue/api/venues.ts`) that geolocates the visitor and shows
      only venues whose *drawn boundary actually covers that point* — not a
      proximity radius, which is what makes it a distinct filter from the
      existing viewport browse rather than a duplicate of it. Mutually
      exclusive with the location-search filter and with typing a new search
      query, both of which clear it; an empty result shows a toast rather than
      an empty list.
- [x] **Missing-Mapbox-token silent failure — already handled, not a bug.**
      Checked 12 Sep: `VenuesMap`/`LocationMap` (via `MapBoxView`/
      `MapBoxViewImpl`) and `VenuePolygonMapPicker` all resolve their style
      through `shared/lib/mapbox.ts`'s `getMapStyle()`, which falls back to a
      free CartoDB dark-tile style when `getEffectiveMapboxToken()` is empty —
      the map still renders, just on different tiles, and `MapBoxViewImpl`
      shows a loading skeleton in the meantime. This doc's "empty `<div>`"
      description predates that fallback, or never matched the shared
      component's actual behavior; correcting it here rather than "fixing" a
      bug that isn't there.
- [x] **`VenuePolygonMapPicker`'s reference-boundary fetch silently swallowed
      failures — fixed 12 Sep.** Was `.catch(() => {})`; a host drawing a new
      venue's boundary got no reference layer and no warning if it failed to
      load, discovering an overlap only at submit time, which defeated the
      reference layer's documented purpose. Now sets a `referenceLoadFailed`
      flag rendered as a visible amber warning with a **Retry** action next to
      the existing shape-validity warnings.
- [x] **`/venues/map` was unusable below `sm` (640px) — fixed 5 Sep.** The
      right column (map, pins, the floating detail card) was `hidden sm:block`
      with nothing replacing it: a phone-width visitor saw only a plain venue
      list with no map, no indication one existed, and no way to reach it. The
      page also had no back control anywhere, at any width — `LandingHeader`
      above it is site-wide nav, not a page-specific way out, so the only way
      off the page was the browser's own back button. Fixed both:
      `router.back()` behind an `arrow_back` button (the same pattern
      `VenueHeader.tsx` already uses) next to the "Venues Map" title, and a
      List/Map toggle pill (fixed above `MobileBottomNav`, which is 68px tall
      anchored at `bottom-4`) that shows one panel at a time below `sm`
      instead of the map just disappearing. `VenuesMap`'s existing
      `ResizeObserver` already calls `map.resize()` on becoming visible, so
      the toggle doesn't produce a blank map. `AdminVenuesMap` doesn't have
      this problem — it stacks list-above-map at `lg:` instead of hiding
      either, and it lives inside the admin console's own layout rather than
      as a standalone route, so no back control is needed there.
      **Still open:** `responsive-plan.md` also flags `VenuePolygonMapPicker`
      as never audited for breakpoints — the drawing tool itself, not the
      browse page, and not covered by this fix.
- [ ] **Never manually verified in a browser.** The fix above was made by
      reading the code, not by rendering the page — still consistent with
      this project's broader admitted pattern (see §2 below).

Both branches still exist and each still holds one commit that is **not** on
`main`. They are now misnamed for what is left in them:

- [x] **api `feat/role-assignment` — `05590bd`, the seed preflight guard.**
      `prisma/preflight.ts`, `prisma/seed.ts`, `tests/preflight.spec.ts`.
      Confirmed 24 Sep: `05590bd` is in the api's current history and
      `prisma/preflight.ts` is present. The remote branch can be deleted.
- [ ] **app `fix/secretary-admin-console` — `8bc3586`, this document.** Docs
      only.

### Migrations, which is the part that bites

- [x] **Local is caught up.** It was two behind on the morning of 4 Sep —
      `20260902052721_add_venue_radius` and
      `20260902060356_venue_boundary_polygon`, both from `feat/map`. All 55 are
      applied now, `venues.boundary` and `audit_logs` are both present, and
      `migrate diff` against the datasource reports no difference. Note the
      second of those two migrations *drops* `radius` and adds `boundary` in its
      place, so the pair only makes sense applied together.
- **Audit logs are parked — not being pursued for now (decided 4 Sep).** The
      `AuditLog` model, `audit.service.ts` and the write-on-every-attempt
      behaviour are already merged and live on `main`; nothing is being removed,
      it is simply not work anyone is carrying forward. The one loose end, left
      here deliberately rather than ticked: `20260902085449_add_audit_log` was
      applied locally and nowhere else while it sat unmerged, so **whenever
      staging or prod next deploy, they need `migrate deploy`** or the table
      will be missing under code that writes to it. That is a deploy-time
      concern, not a task for this list, and it cannot be checked from this
      machine.

The preflight guard still sitting unmerged on the api branch is exactly the
check that turns "invalid input value for enum" an hour into the seed run into
"you have an unapplied migration" before it starts. Local no longer needs it,
which is precisely why it should be merged now rather than after the next
environment hits the same wall.

### 0a. The navbar was replaced, not just deleted — and the replacement overlaps

`34c6e50` deleted the global navigation:

- `shared/components/layout/Navbar.tsx`, `navbar/NavMobileMenu.tsx`,
  `navbar/BrowseDropdown.tsx`, `navbar/HostModal.tsx`, `shared/hooks/useNavbar.ts`
- `src/app/(main)/layout.tsx` — the only thing that rendered `<Navbar />`

It looks deliberate rather than a merge casualty. `LandingHeader` is the
replacement and it is a full navigation component — a desktop `<nav>` plus
`MobileBottomNav` — and `/progress`, the only page `(main)` ever held, was given
`LandingHeader` explicitly in the same commit as it moved to `src/app/progress/`.
No source file imports any of the deleted modules; the deletion is clean.

What changed is the *mechanism*: navigation moved from a layout every child
inherited to a component each page opts into. That has two consequences nobody
has signed off on.

- [x] **The 768–1023px band now shows two navigations at once — fixed.** `LandingHeader`
      renders its desktop nav at `hidden lg:flex` (aligned with `MobileBottomNav`'s
      `lg:hidden`), so only one navigation is visible at any screen width.

- [ ] **Navigation is now opt-in per page.** 73 `page.tsx` files; `LandingHeader`
      is rendered from 7 files, 3 of them under `src/app` (`/`, `/progress`,
      `/search`). Many of the rest carry their own feature headers
      (`DashboardHeader`, `AdminHeader`, `VenueHeader` and friends), so this is
      **not** 70 pages with no navigation — but no single thing guarantees a
      page has any, which the `(main)` layout used to do for whatever sat under
      it. Worth an audit of which trees genuinely have no way out.

---

## 1. Next piece of work

- [ ] **`/creator-dashboard/earnings` shows fabricated payout history and
      fabricated verification status on mobile — found 25 Sep, while fixing
      the Earnings nav gating below.** `MobileEarningsView.tsx`'s
      `PAYOUT_CHECKLIST` ("Valid Government ID: VERIFIED", "Business
      Permit: IN REVIEW", "Bank/Stripe Connect: NOT LINKED") and `PAYOUTS`
      (four line items — "Skyline Loft booking ₱15,300", "Neon Nights event
      ₱22,000", etc.) are hardcoded constants, no API call, shown to every
      phone visitor to the earnings page regardless of their real KYC state
      or real payout history. This is worse than the `MobileCreatorHome`
      finding above: it's fabricating both money and identity-verification
      status on the one page that is specifically about someone's real
      payouts. Left untouched — out of scope for the Earnings-visibility fix
      below, and deserves its own look before being wired to
      `fetchMyPayouts`/the real KYC status, same as `MobileCreatorHome` was.

- [x] **Earnings was reachable and nudged toward Stripe for people who can
      never receive a payout — fixed 25 Sep.** ADR 0005: an Organizer gets
      no platform pay at all (`payouts:onboard` withheld on purpose). The
      "Earnings" link was shown unconditionally in both `DashboardHeader`'s
      desktop nav and `MobileCreatorBottomNav`'s mobile tab bar, and
      `/creator-dashboard/earnings` itself had no guard — reachable by
      anyone signed in via a direct link, landing on a page whose only real
      content for them was a "Connect Stripe" link. Both nav surfaces now
      gate on `useRoleAccess.canReceivePayouts`, and the page itself now
      calls `requirePermission("payouts:onboard")` server-side, so it's
      closed even for someone who reaches it directly rather than through
      either nav. `MobileCreatorBottomNav`'s "Listings" tab
      (`/creator-dashboard/venues`) was left as unconditional — same shape
      of gap, not part of this fix.

- [x] **Mobile Creator Studio home showed fabricated numbers to everyone —
      fixed 25 Sep.** `MobileCreatorHome.tsx`'s KPI cards and "Pending
      Requests" were hardcoded constants — "₱82k Revenue", "14 Bookings", a
      fake "Skyline Loft" request — with no API call, shown to every phone
      visitor regardless of role or account. KPI cards now read
      `useFoxerDashboard`'s real `totalRevenue`/`totalBookings` (through
      `formatCurrency`, not a hardcoded `₱`) and are gated on
      `hasListings`, same as desktop. Pending Requests now reads the same
      real match-request inbox desktop's `PendingRequests` does
      (`useClientMatchRequests`) — pulled into a new
      `MobilePendingRequests.tsx` in `app/creator-dashboard/_components`
      (composed in from `page.tsx`, passed down as a `pendingRequests` slot)
      rather than imported directly into `MobileCreatorHome`, since that
      file lives inside the `dashboard` feature and reaching into
      `gamification` from there would have been a new Feature Isolation
      violation of the exact kind already tracked in §0. **Deliberately
      read-only for now** — no Accept/Decline on mobile yet, just the real
      names and dates instead of fake ones; acting on one means going to
      `/user/passport`, same as desktop's own "View All". Full parity
      (in-place accept/decline) is a follow-up, not done here.
- [ ] **Mobile Creator Studio's "Quick Actions" buttons do nothing — found
      25 Sep, while fixing the above.** New Event / Add Venue / Add Gear /
      Add Service in `MobileCreatorHome.tsx` have no `onClick` at all, for
      anyone. Left alone — out of the scope that was agreed for the KPI/
      Pending-Requests fix above — but it's the same shape of bug.

- [x] **Creator dashboard showed every Foxer-only widget to Organizers (and
      Investors) regardless of role — fixed 25 Sep.** `KPICards`,
      `PendingRequests` and `StripeConnectSection` on `HostDashboardClient`
      rendered unconditionally — an approved Organizer with no team (holds
      no permission at all: ADR 0005) saw a full shell of listing metrics,
      match requests, and a "Connect Stripe" nudge toward payouts Organizers
      are explicitly never granted. Fixed with two new `useRoleAccess`
      fields: `hasListings` (any of venue/event/asset/service/performer
      manage) gates `KPICards`/`PendingRequests`, and `canReceivePayouts`
      (`payouts:onboard`) gates `StripeConnectSection` — chosen per-widget
      rather than one combined switch specifically so an Investor (who holds
      `payouts:onboard` but no listing role) still sees Stripe while an
      Organizer doesn't. The "Unlock more provider capabilities... Apply for
      Roles" hint used to fire whenever *any* of the five Foxer permissions
      was missing (nearly everyone, forever); it now only shows for someone
      with `hasListings` false. `CalendarWidget` was deliberately left
      ungated — it already mixes in the viewer's own bookings-as-a-guest,
      which is real for an Organizer too. Three other sidebar widgets
      (`OccupancyChart`, `CreatorProfile`, `RecentActivity`) were found to be
      unfinished placeholders — hardcoded "No occupancy data yet"/"85%
      Complete"/an always-empty activity list — for every role, not just
      Organizers; left untouched as a separate, pre-existing gap rather than
      folded into this fix.

- [x] **SECURITY — anyone signed in could mark any booking paid — fixed 25
      Sep.** `POST /v1/bookings/:id/confirm` (`BookingSvc.confirmPayment`)
      checked neither who was calling nor the payment itself: it took a
      client-supplied `{ amount, transactionId }` on faith and marked the
      booking paid. Now it requires the caller to be the booking's own
      client (or an admin), and retrieves the PaymentIntent from Stripe
      itself to check it actually succeeded and was minted for this exact
      booking (`PaymentSvc.createPaymentIntent` always stamps
      `metadata.bookingId`) — the amount and currency it records come from
      Stripe, never from the client. A failure here is expected whenever the
      `payment_intent.succeeded` webhook (`PaymentSvc.settleSucceededIntent`)
      already settled it first; every caller already treated this endpoint
      as a courtesy, not the source of truth, so nothing else changed.

- [x] **SECURITY — any booking was readable by anyone with its id — fixed 25
      Sep.** `GET /v1/bookings/:id` now requires sign-in and goes through
      `BookingSvc.getBookingForViewer`: the booker, an invited attendee, an
      admin, or the Event's / booked Venue's Owner and staff. Everyone else
      gets the same "not found" as a missing booking. Nothing public used it.

- [x] **SECURITY — any signed-in user could read any Event's full record —
      fixed 25 Sep.** `GET /v1/event-requests/:id`
      (`EventRequestSvc.getRequestById`) now refuses anyone but the Event's
      client, its Owner, an Organizer with `event:view-sales`, or an admin —
      everyone else gets the same "not found" as a missing Event.
      `fetchEventLineItems`, its one caller (the event page's line-items
      panel, reached from public browsing too), now treats that refusal as
      "nothing to show" instead of an error banner.

- [x] **Organizers — the two set-aside Event permissions, settled 25 Sep.**
      Editing an Event's details stays the Owner's for good. Instead of
      reporting a supplier problem, Organizers **message Suppliers**: new
      `event:message-suppliers` permission, Shared Inbox threads now record
      whether they are with a guest or a Supplier (`Conversation.inboxWith`),
      and `/creator-dashboard/suppliers/[eventId]` lists the Event's booked
      and bidding Suppliers with a Message button, above its bids. See the
      api's ADR 0005 § Settled after the first build.
- [x] **Venue studio lost new photos — fixed 25 Sep.** `useHostVenueEdit`
      POSTed new files to `/venues/:id/images`, a route the api never had. It
      now uploads each new file, then saves the whole list as `imgIds` with
      the venue, so removed photos stay removed too. Capped at the api's 5.
- [x] **A screen for an Event's bids — built 25 Sep.**
      `/creator-dashboard/suppliers/[eventId]` lists Talent and Gear bids with the
      slot and its currency; the Owner can accept, Organizers can reject.
      Linked from the Team page (Owners) and Organizing (Organizers).
- [x] **Phones could never start a role application — fixed 25 Sep.**
      `/onboarding` gave phones `MobileRolePicker`, which PUT an
      `intendedRoles` field the api ignores and went home. It is gone; the
      responsive `OnboardingClient` serves every width.
- [x] **Performer Foxers landed on `/user` — fixed 25 Sep.**
      `performerFoxer` added to `SUPPLY_ROLE_TYPES` in `dashboard-path.ts`.

- [x] **A payment model for item bookings — completed 23 Sep.** `Payment` now
      supports invoice, asset-booking, and service-booking ownership. Existing
      item-booking confirmations upsert an idempotent payment-history row, and
      booking detail responses include ordered payments and refunds. The
      fulfillment screen displays the latest payment reference and refund count.

---

## 2. Verification — completed 12 Sep for core socket and page guards

`VERIFY.md` was **fully driven 12 Sep** (Playwright + curl + live DB/Redis).
All 16 checks passed, with two findings recorded in `VERIFY.md` and §0·0aa/ab
above (`proxy.ts` dead upstream in Next.js 16.3.4; generic booking disputes
invisible to admins).

- [x] **Part A — the socket is alive.** All 6 checks verified (A1–A6).
      Reconnection, single-use tickets, admin invalidation, non-admin isolation,
      and graceful degradation when Redis drops all confirmed.
- [x] **Part B — the emits on handlers.** B1/B2/B5 verified live (~450ms
      delivery); B4 verified 10 Sep (585ms); B3 indirectly covered.
- [x] **Part C — page guards.** C1 passed via server layout guards (with
      `proxy.ts` upstream bug noted); C2 (junk cookie) bounced; C3 (no secrets) clean.
- [x] **Part D — the `admin_secretary` boundary.** Verified live: exact tab
      filtering, 403 on citizens/disputes, 200 on venues/pending.
- [x] **Part E — query defaults applied.** Verified live: zero admin requests
      fired on simulated focus/blur changes.
- [ ] **§3a Google sign-in** end to end: new account, existing-email collision,
      and an account created by password then signed in with Google.
      Unblocked 24 Sep — the API `.env` now has the Google secrets.
- [ ] **Mobile**: `/admin` narrow (drawer, approve, reject with a reason), and
      venue detail's sticky bar. `NavMobileMenu` was on this list for weeks as
      "orphaned, reconnected, never seen open" — `feat/map` deleted it before
      it was ever seen open, so it comes off. See §0a.
- [ ] **Password change and reset** revoke all sessions — confirm the user is
      signed out and can sign back in.
- [ ] **Proxy edge cases**: a multipart upload, and 401 → refresh → replay.

---

## 3. Decisions only you can make

- [x] **Is the mobile/desktop line 768 (`md`) or 1024 (`lg`)?** Resolved — aligned to
      **1024 (`lg`)**. `LandingHeader`'s desktop pill nav is `hidden lg:flex`,
      `MobileBottomNav` is `lg:hidden`, `SearchClient` sidebar/chips switch at `lg`,
      and `useMobile.ts` sets `MOBILE_BREAKPOINT = 1024`. All navigation elements
      and helpers now agree across the application.
- [ ] **Is the navbar replacement finished?** `feat/map` deleted the global
      `Navbar` and the `(main)` layout, and `LandingHeader` took over. That much
      is clearly deliberate — `/progress` was handed `LandingHeader` in the same
      commit, and nothing imports the deleted modules. What is not established
      is whether it is *complete*: navigation is now opt-in per page rather than
      inherited from a layout, and no single thing guarantees a page has any.
      73 `page.tsx` files, `LandingHeader` rendered from 7 files (3 under
      `src/app`), most of the rest carrying their own feature headers. **Not
      audited page by page** — that audit is the work, once you say whether the
      opt-in model is the intended end state or a way-point.
- [ ] **The 11 widened routes.** The resource-level approve/reject twins moved
      from `requireAdmin` to `queue:decide`, so `admin_secretary` reaches them
      now. Their `/admin/*` counterparts already did, so the two paths agree for
      the first time — but it is a real behaviour change. Keep, or give those 11
      an admin-only permission for strict parity.
- [x] **Seven page trees** sat outside `PROTECTED_ROUTES` and any guard:
      `/kyc`, `/notifications`, `/scanner`, `/wishlists`, `/host` (13 pages),
      `/match`, `/venue-foxer`. All seven are signed-in only — decided and
      shipped: added to `middleware.ts`'s `PROTECTED_ROUTES`, and each tree got
      a server-side `requireAuth()` layout. `/host` was the worst of the seven:
      a full parallel dashboard (assets, events, services, venues + edit
      routes, Stripe onboarding) guarded only by the client-side `RequireAuth`
      component, with a comment claiming `middleware.ts` ("proxy.ts") handled
      it — it never did, `/host` was not in the array. The modal-state logic
      that lived in that layout moved to `host/_components/HostShell.tsx` so
      the layout itself could become a server component calling `requireAuth`.
      **Since then `src/app/host` is gone** (renamed to `/creator-dashboard`,
      which has its own `requireAuth` layout), so `HostShell.tsx` no longer
      exists and `"/host"` in `proxy.ts`'s `PROTECTED_ROUTES` is a harmless
      stale entry that can be removed.
- [ ] **Silent Google account linking** — an existing email signing in with
      Google is linked without a challenge. Acceptable, or not?
- [ ] **Single-session across a person's own devices.** Signing in on a phone
      ends the desktop session. Deliberate, or friction?
- [x] **`requireOwnerOrAdmin`** had zero call sites. Decided: deleted, with
      the other legacy guards, 23 Sep — see §4. Ownership stays checked inside
      each service.
- [ ] **Does `MobileAdminView` earn its keep?** Two implementations of the same
      console to keep in step.

---

## 4. Keyboard work, roughly by cost of ignoring it

- [x] **Behavioral RBAC coverage — representative routes completed 23 Sep.**
      Added HTTP regression tests for the production middleware and mounted
      `/api/v1/admin/stats` and `/api/v1/users/` routes: unauthenticated `401`,
      denied citizen/secretary `403`, and allowed `admin_secretary` `200`
      responses. The broader per-route ownership triads remain a follow-up.
- [ ] **Close the remaining test suite's blind spot — this is the
      highest-leverage item
      here.** Twice on 2 Sep a feature was entirely broken while its tests
      passed: the socket had been dead for weeks, and 41 tests pinned the
      `admin_secretary` boundary while the role could not open the console at
      all. Both times the tests asserted *structure* — grant tables, source
      text, nav item lists — and none of them rendered a page or made a request.
      Those tests are cheap and have caught real regressions, so keep them; but
      they buy less confidence than their pass rate suggests, and this codebase
      has now been fooled by them twice in a day.
      Concretely: RBAC Phase 4's per-route 401/403/2xx triads are worth more
      than another ten table tests, and any feature whose only coverage is a
      source scan should get one behavioural test that exercises it the way a
      person would.
- [x] **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` configuration — completed 23
      Sep.** Google OAuth now rejects partial credentials and invalid callback
      URLs at API startup; the fully unset integration remains optional with a
      warning.
- [x] **Google sign-in session revocation — completed 8 Sep.** Google login
      revokes existing sessions before issuing the new session, matching the
      password-login path. End-to-end browser verification remains open below.
- [x] **The app-side Google callback is now tested — completed 23 Sep.**
      `src/app/auth/google/callback/__tests__/page.test.tsx` covers the
      missing-exchange-code redirect, an existing-user session completion, and
      the new-user onboarding redirect.
- [x] **RBAC missing-guard regression gate and legacy guard cleanup — completed
      23 Sep.** `validate-rbac-guards.mjs` now fails when authenticated routes
      exceed the current audited baseline, while `--report` remains available
      for deliberate audits. The unused `requireRole`, `requireAdmin`,
      `requireHost`, and `requireOwnerOrAdmin` exports are removed. The full
      per-route ownership allow-list audit and behavioral `401/403/2xx` tests
      remain open under the test-suite blind-spot item above.
- [x] **Zod response contracts for `/venues` — completed 23 Sep.**
      `src/features/venue/api/schemas.ts` validates the envelope explicitly
      (`venueListResponseSchema`) instead of guessing between keys, and
      `venues.ts`'s `unwrapList` now parses through it. Other endpoints still
      use ad hoc unwrapping and are a candidate follow-up, not covered here.
- [x] **The experience builder** — deduplicated and touch-enabled.
      The inline `CustomExperienceBuilder` in the event detail page was
      extracted into `CustomExperienceBuilderModal.tsx`. Both it and
      `ExperienceBuilder.tsx` provide direct `onClick` selection and toggling
      on foxer and service cards, so mobile/touch users do not depend on HTML5 DnD.
- [x] **`x-auth-required` was set by `middleware.ts` and read by nothing.** A
      response header on a redirect is invisible to the page that lands — not
      just unwired, unreadable, since the destination page never sees the
      headers of the response that redirected it there. Replaced with
      `?auth=required`, handled by `SessionExpiredToast` (already global in
      the root layout, already doing this for `?auth=expired`) which now opens
      the login modal with a "Please sign in to continue" toast and strips the
      param.
- [x] **Approve/reject no longer exists twice.** The resource-level pair
      (`venue`/`asset`/`service`/`event-template` `.routes.ts` +
      `.controller.ts`) had diverged from `AdminCtrl`'s version — no XP/badge
      award, no socket announce — and this app only ever called `/admin/*`.
      Deleted the resource-level routes and controller methods; `AdminCtrl`'s
      versions (which already did everything the deleted ones did, plus more)
      are now the only implementation. Worth knowing if anything outside this
      repo called the old `PATCH /venues/:id/approve`-style paths directly.
- [x] **`/progress` is in `PROTECTED_ROUTES` and guarded.**
      `src/app/progress/page.tsx` renders `ProgressDashboard` wrapped in `<RequireAuth>`,
      and `middlewareSecrets.test.ts` asserts the guard passes.
- [x] **`jose` removed — 24 Sep.** It had no imports in `src`;
      `pnpm remove jose` under pnpm 10.34.5 touched only `package.json` and
      nine lockfile lines.
- [x] **The pnpm pin matches the installed tree.** Confirmed 24 Sep:
      `node_modules/.modules.yaml` records `pnpm@10.34.5`, the same as
      `packageManager`.
- [ ] **RS256/ES256** if middleware ever needs to verify tokens again. Large,
      and genuinely optional.

---

## 5. Traps

- **Every number in these docs drifts. Re-derive, never re-read.** The route
  count in `RBAC-PLAN.md` said 39 when it was 62 — a grep counting lines rather
  than routes — and `RBAC.md` was headed "as built" while a third of it was
  target state. Both were caught by a reviewer, not by the author. There are
  eight documents here now, roughly 3,500 lines, and they carry real reasoning
  rather than summaries, which is worth the upkeep — but anything in them that
  is a *count* should be recomputed before it is quoted.
- **Migrations are a separate step, and today proved it.**
  `add_admin_secretary_role` had never been applied locally, so the Postgres
  enum had no `admin_secretary`, and the seeder aborted mid-run with a confusing
  error. Any environment other than local needs `prisma migrate deploy`.
  `ALTER TYPE … ADD VALUE` is forward-only.
- **`npm run format` still churns line endings** on any branch lacking the new
  `.gitattributes`. Expect a ~150-file diff, and note the API currently reports
  ~3,000 prettier errors from this in files nobody has touched.
- **A stale `.next` cache reports type errors that do not exist.** After
  `feat/map` removed the `(main)` route group, `npx tsc --noEmit` returned four
  `TS2307 Cannot find module '../../src/app/(main)/…'` errors — all of them in
  generated files under `.next/types` and `.next/dev/types`, none in `src`. The
  source tree was clean the whole time. `rm -rf .next` clears it. Worth knowing
  before someone spends an afternoon on a route group that no longer exists.
- **`api/.env` edits are local-only** and gitignored. The dead Supabase vars
  were removed here but remain in everyone else's env.
- **Editing `api/src` restarts your dev server.** Requests landing in that
  window get `ECONNREFUSED`, which looks like a backend fault and is not.
- **"Unable to start a transaction in the given time" is not a busy database.**
  It means Prisma could not get a connection to *begin* a transaction within
  ~2s. When it appeared, Postgres had 11 connections of a possible 100 and 10 of
  them idle — the pool is `max: 10` per process, and the contention was for a
  transaction slot, not for the database. Check `pg_stat_activity` before
  reaching for the pool size; the answer was that read-only queries should not
  have been in a transaction at all.