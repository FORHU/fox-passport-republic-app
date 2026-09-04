# Tomorrow

**The running order.** Rewritten 2 Sep 2026, revised 4 Sep after `main` took
role assignment and `feat/map` — the previous 916-line version had 47 completed
items in it and is in git history if the reasoning behind any of them is ever
needed.

| Document | Role |
|---|---|
| `TOMORROW.md` (this file) | **What to do next.** Nothing else. |
| `VERIFY.md` | The browser runbook. Never run. |
| `RBAC-PLAN.md` | The authorization migration — phases, invariants, prior art. |
| `RBAC.md` / `ARCHITECTURE.md` | Target state, and the system as built. |
| `api-audit.md` | The record: API, data-fetching and auth findings. 9 open. |
| `responsive-plan.md` | Responsive and touch backlog. 21 open. |
| `mapanytime-comparison.md` | What to adopt from the mapanytime codebase. 8 open. |
| `roles-and-spaces.md` | The Foxer role model and the page split. 13 open. |
| `app-architecture.md` | Boundary violations + template gaps. 19 open, 150 -> 72. |

---

## 0. In flight — as of 4 Sep

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
`AdminVenuesMap`, `polygonGeo.ts`, venue boundary polygons in the API, and the
navbar deletion in §0a below. `mapbox-gl` was already a dependency and
`NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env` and documented in `.env.example`, so
there is no new setup.

Both branches still exist and each still holds one commit that is **not** on
`main`. They are now misnamed for what is left in them:

- [ ] **api `feat/role-assignment` — `05590bd`, the seed preflight guard.**
      `prisma/preflight.ts`, `prisma/seed.ts`, `tests/preflight.spec.ts`. Needs
      its own PR under its own name; nothing about it relates to role
      assignment.
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

- [ ] **The 768–1023px band now shows two navigations at once.** `LandingHeader`
      renders its desktop nav at `hidden md:flex` — visible from **768** up —
      while `MobileBottomNav` is `lg:hidden`, visible below **1024**. Between
      them both are on screen. `MobileBottomNav` has no other visibility guard,
      so this is unconditional on every page that renders `LandingHeader`.

      This is the exact inverse of the §3.1 defect in `responsive-plan.md`: that
      one was a 640–767 band with *no* navigation, and the fix moved both sides
      to `lg` so they agreed. The old `Navbar` hamburger was `flex lg:hidden`,
      which matched `MobileBottomNav` at 1024. `LandingHeader`'s nav sits at
      `md`, and the agreement is gone. Fixing it is a one-line breakpoint change
      once §3.3 decides whether the line is 768 or 1024 — do that first.

- [ ] **Navigation is now opt-in per page.** 73 `page.tsx` files; `LandingHeader`
      is rendered from 7 files, 3 of them under `src/app` (`/`, `/progress`,
      `/search`). Many of the rest carry their own feature headers
      (`DashboardHeader`, `AdminHeader`, `VenueHeader` and friends), so this is
      **not** 70 pages with no navigation — but no single thing guarantees a
      page has any, which the `(main)` layout used to do for whatever sat under
      it. Worth an audit of which trees genuinely have no way out.

---

## 1. Next piece of work

- [ ] **A payment model for item bookings.** `Payment.bookingId` relates to
      `Booking` only, so `AssetBooking` and `ServiceBooking` keep payment state
      as inline columns — `paymentStatus`, `paymentTransactionId`,
      `stripePaymentId`, `paymentMethod`. They get no payment history, and
      `Refund` cannot link to them at all. Agreed as the next schema change.

---

## 2. Verification — the largest gap, and it is now on `main`

`VERIFY.md` has never been run. Today made the case better than any argument:
**41 tests pinned the `admin_secretary` boundary and passed, while the role
could not open the console at all.** They tested the grant table and the nav;
none of them rendered a page.

- [ ] **Part A — the socket is alive.** Six checks, ten minutes. Check 3 is the
      one that matters: if the admin queue updates in ~60s rather than ~1s, the
      socket is dead and it is dead on `main`.
- [ ] **Part B** — the emits added to the 26 silent handlers.
- [ ] **Part C** — page guards after the middleware change.
- [ ] **Part D** — the `admin_secretary` boundary. Needs the console fix merged.
- [ ] **Part E** — re-measure `/admin` now the query defaults are actually
      applied. Fifteen call sites ran at `staleTime: 0` for weeks; one may have
      been tuned against it.
- [ ] **§3a Google sign-in** end to end: new account, existing-email collision,
      and an account created by password then signed in with Google.
- [ ] **Mobile**: `/admin` narrow (drawer, approve, reject with a reason), and
      venue detail's sticky bar. `NavMobileMenu` was on this list for weeks as
      "orphaned, reconnected, never seen open" — `feat/map` deleted it before
      it was ever seen open, so it comes off. See §0a.
- [ ] **Password change and reset** revoke all sessions — confirm the user is
      signed out and can sign back in.
- [ ] **Proxy edge cases**: a multipart upload, and 401 → refresh → replay.

---

## 3. Decisions only you can make

- [ ] **Is the mobile/desktop line 768 (`md`) or 1024 (`lg`)?** This one now
      blocks a live defect rather than a tidy-up, so it goes first.
      `LandingHeader`'s desktop nav is `hidden md:flex` and `MobileBottomNav` is
      `lg:hidden`, so **768–1023 renders both navigations at once** on every
      page using `LandingHeader`. The fix is one line in each file — but which
      line depends entirely on this answer, and `useMobile.ts` (768) is a third
      voice that should end up agreeing with whatever you pick. Full working in
      `responsive-plan.md` §3.1 and §3.3; §0a above has the discovery.
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
- [ ] **Seven page trees** sit outside `PROTECTED_ROUTES` and any guard:
      `/kyc`, `/notifications`, `/scanner`, `/wishlists`, `/host` (13 pages),
      `/match`, `/venue-foxer`. Which are signed-in only? An hour once decided.
- [ ] **Approve/reject exists twice** — `AdminCtrl` and the resource-level pair.
      This app only calls `/admin/*`. Deleting the unused pair is the obvious
      cleanup, but it is an API removal and something outside this repo may call
      it.
- [ ] **Silent Google account linking** — an existing email signing in with
      Google is linked without a challenge. Acceptable, or not?
- [ ] **Single-session across a person's own devices.** Signing in on a phone
      ends the desktop session. Deliberate, or friction?
- [ ] **`requireOwnerOrAdmin`** has zero call sites. Under the new model it is
      the *ownership* layer the spec describes. Implement it properly, or delete.
- [ ] **Does `MobileAdminView` earn its keep?** Two implementations of the same
      console to keep in step.

---

## 4. Keyboard work, roughly by cost of ignoring it

- [ ] **Close the test suite's blind spot — this is the highest-leverage item
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
- [ ] **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are `as string` casts** with
      no validation, while every other secret goes through `requireSecret`. A
      missing Google secret fails at first sign-in rather than at boot.
- [ ] **Google sign-in does not revoke other sessions**, where password login
      does. Two doors, one locked.
- [ ] **The app-side Google callback is untested** —
      `src/app/auth/google/callback/page.tsx`.
- [ ] **RBAC Phase 4** (`RBAC-PLAN.md`): the missing-guard CI scan needs an
      allow-list first — 158 authenticated routes, 75 without a
      `requirePermission`, most correctly ownership-checked. Then Phase 3 is
      pure deletion, and Phase 5 moves the app's page guards onto capabilities.
- [ ] **Zod response contracts**, starting with `/venues`. `extractList()`
      guesses between eight envelope keys and fails silently, looking like empty
      data.
- [ ] **The experience builder** — drag-and-drop, on the citizen path, silently
      broken under a finger, and duplicated: `ExperienceBuilder.tsx` and an
      inline `CustomExperienceBuilder` in a 1,483-line page. Dedupe first or the
      work happens twice.
- [ ] **`x-auth-required` is set by `middleware.ts:72` and read by nothing.** A
      response header on a redirect is invisible to the page that lands;
      `RequireAuth` opens the modal client-side. Wire it through a query param
      or delete it.
- [ ] **`/progress` is in `PROTECTED_ROUTES` and has no pages.**
- [ ] **`jose` is unused**, and removing it is blocked on the pnpm mismatch
      below.
- [ ] **The pnpm pin disagrees with the installed tree** — `node_modules` came
      from pnpm 11, `packageManager` says 10.34.5. Anyone following the pin gets
      a full relink.
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
