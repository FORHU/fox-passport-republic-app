# Tomorrow

**The running order.** Rewritten 2 Sep 2026 — the previous 916-line version had
47 completed items in it and is in git history if the reasoning behind any of
them is ever needed.

| Document | Role |
|---|---|
| `TOMORROW.md` (this file) | **What to do next.** Nothing else. |
| `VERIFY.md` | The browser runbook. Never run. |
| `RBAC-PLAN.md` | The authorization migration — phases, invariants, prior art. |
| `RBAC.md` / `ARCHITECTURE.md` | Target state, and the system as built. |
| `api-audit.md` | The record: API, data-fetching and auth findings. 9 open. |
| `responsive-plan.md` | Responsive and touch backlog. 21 open. |
| `mapanytime-comparison.md` | What to adopt from the mapanytime codebase. 8 open. |

---

## 0. In flight — committed and pushed, no PR open, as of 3 Sep

Everything below is written, green and on its remote branch. Neither branch has
a PR, so none of it is on `main`.

- **api `feat/role-assignment`** (2 commits) — `roles:assign`, the `AuditLog`
  model and its migration (**already applied locally, nowhere else**),
  `audit.service.ts`, `role-assignment.service.ts`, and
  `PATCH /v1/admin/users/:id/system-role` + `/role-types`. 194 tests, 16 files.
- **app `fix/secretary-admin-console`** (2 commits) — the `/admin` crash fix,
  and the role-assignment UI: `RoleAssignmentControls`,
  `features/admin/api/roles.ts`, `roles:assign` in the vocabulary. 102 tests,
  13 files.

Also on the api branch and **unrelated to role assignment**, already isolated as
its own commit (`3bc9cfc`) so it can be reverted or cherry-picked alone:

- **Seven read-only list+count pairs moved off `$transaction`.** `browsePublic`
  and friends wrapped a list and its count in `prisma.$transaction([...])`.
  Prisma must acquire a connection to *start* a transaction and gives up after
  ~2s, so under a burst the browse endpoints 500 with "Unable to start a
  transaction in the given time". `Promise.all` runs the same two queries with
  no transaction to start. The count can now shift by one against a concurrent
  insert; a 500 on a browse page is the worse trade. The three remaining
  `$transaction` calls are genuine multi-table writes and stay.

- [ ] **Open the api PR for `feat/role-assignment` first.** The app UI calls two
      endpoints that 404 on `main` until it merges.
- [ ] **Then the app PR for `fix/secretary-admin-console`.** Without it,
      `admin_secretary` cannot open the console on `main` at all.
- [ ] **`gh` is not installed here**, so both are browser-only. Compare links:
      `.../compare/main...feat/role-assignment` and
      `.../compare/main...fix/secretary-admin-console`.

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
- [ ] **Mobile**: `/admin` narrow (drawer, approve, reject with a reason),
      venue detail's sticky bar, `NavMobileMenu` — orphaned, reconnected, never
      seen open.
- [ ] **Password change and reset** revoke all sessions — confirm the user is
      signed out and can sign back in.
- [ ] **Proxy edge cases**: a multipart upload, and 401 → refresh → replay.

---

## 3. Decisions only you can make

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
