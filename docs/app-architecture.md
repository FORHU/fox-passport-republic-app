# App architecture — measured against the house template

**Written 4 September 2026.** Every number here was produced by running
`tools/validate-architecture.mjs` against `src/`, not estimated. Re-run it
before quoting anything: `node tools/validate-architecture.mjs`.

The validator is copied **verbatim** from
`rm-template/next-template-v1/tools/validate-architecture.mjs`. Nothing was
relaxed to make this repository look better. Where the app disagrees with the
template, the disagreement is recorded here rather than edited out of the rules.

**§1–§6 are about import boundaries. §7 is everything else the template ships
that this app does not** — scripts, error handling, Playwright, commit hooks.

---

## 0. The headline

The app is **closer to the template than the API was**. Two of the five rules
already pass outright:

| Rule | Status |
|---|---|
| Layout is `app` / `features` / `shared` | **passes** |
| Absolute `@/*` imports, no deep relative paths | **passes** — zero violations |
| `shared/` must not import `features/` or `app/` | **passes** — was 9 |
| A feature must not import another feature | **72 violations** — was 141 |
| `app/` must not use `@tanstack/react-query` directly | **passes** |

150 violations sounded like a rewrite. It was not. It was **two problems**, and
one of them was a filing error rather than a design fault — that one is now
fixed, and the count is **84**.

| | baseline | now |
|---|---|---|
| Feature isolation | 141 | **72** |
| Shared kernel | 9 | **0** |
| **Total** | **150** | **72** |

**Four of the five rules now pass.** Everything remaining is one rule: a feature
importing a sibling. §2 lists all 80, grouped by the fix each needs.

---

## 1. Problem one: `auth` is infrastructure filed as a feature

**65 of the 141** cross-feature violations, and **7 of the 9** shared-kernel
violations, are one thing: eleven features and seven shared modules import from
`features/auth`.

| Imported from `features/auth` | Count |
|---|---|
| `store/useAuthStore` | **48** |
| `components/RequireAuth` | 11 |
| `hooks/useRoleAccess` | 2 |
| `types/auth`, `hooks/useAuth`, `hooks/useUserMenu`, `components/AuthModal` | 4 |

Eleven features cannot all be wrong. "Who is signed in" is not a peer domain of
`venue` or `booking` — it is infrastructure every domain sits on. The rule is
right and the filing is wrong.

**The template already says where it goes.** Its FAOS layout specifies
`shared/auth/` — "RBAC engine and permission definitions". This app has
`shared/lib/permissions.ts` doing part of that job already, so the destination
is half-built.

- [x] **Moved.** `useAuthStore`, `RequireAuth` and the auth types now live in
      `shared/auth/`. 91 files had their specifiers rewritten; the dead
      `features/auth/index.ts` barrel was re-pointed rather than deleted, since
      deleting unused barrels is its own cleanup. Screens — `AuthModal`,
      `LoginForm` and the rest — stayed in `features/auth`, which is correct:
      other features have no business importing a login screen.

      **Cleared 66, not the 72 predicted.** The estimate assumed
      `useSessionManager` would move too. It did not — see below. `tsc` clean,
      102 tests passing.

- [ ] **`useSessionManager` stayed put, deliberately.** It imports
      `@/features/user/hooks/useProfile`, so moving it to `shared/` would have
      traded a `shared → auth` violation for a `shared → user` one: the same
      count, a worse dependency. It needs its `useProfile` coupling resolved
      first, and only then is it a shared concern. This is the one remaining
      thing standing between `AuthStoreProvider` and a clean shared kernel.

Note `hooks/useRoleAccess` is in that list and is **already scheduled for
deletion** — see `roles-and-spaces.md` §4. Do not migrate it; replace it.

---

## 2. Problem two: the 72 remaining cross-feature couplings

All of them, grouped by the fix they need rather than by size. Regenerate with
`node tools/validate-architecture.mjs`; the counts below were measured, not
estimated.

The template's answer is the same for every one: **composition belongs in the
`app` layer**, and anything genuinely common belongs in `shared/`. A feature
importing a sibling is neither.

### 2a. Shared things filed inside a feature — 8 of 18 cleared

**The premise here was wrong when first written.** This was recorded as "no
design decisions, only a destination". That held for two of the six, and the
other four drag a feature dependency with them — moving those to `shared/` only
converts a feature-isolation violation into a shared-kernel one, undoing §3.

| Module | Imported by | Count | Outcome |
|---|---|---|---|
| `user/api/foxers` | landing, match, search | 6 | **moved** → `shared/api/foxers.ts` |
| `user/api/favorites` | category, event | 2 | **moved** → `shared/api/favorites.ts` |
| `notifications/components/NotificationBell` | dashboard, landing, user | 4 | blocked — see below |
| `cancellation-policy/components/CancellationPolicyPicker` | asset, event, venue | 3 | blocked |
| `user/components/UserMenuButton` | dashboard, landing | 3 | blocked, but tractable |
| `landing/components/sections/LandingHeader` | category, venue | 2 | blocked, and see §0a of `roles-and-spaces.md` |

- [x] **`user/api/foxers` moved.** `features/user` never imported its own foxers
      client — all six consumers were other features, so it was misfiled by
      definition. It defines `Foxer` and five related types plus `/users/foxers`
      access: a cross-cutting read model, and it imported nothing but
      `shared/lib/axios`, so the move was clean.

      A `features/foxer/` was considered and rejected: conceptually truer to
      `roles-and-spaces.md`, but it fixes nothing — landing, match and search
      would still be importing across a boundary. If a Foxer feature ever
      appears, the read model stays in `shared` and the feature owns the screens,
      the same split made for auth in §1.

- [x] **`user/api/favorites` moved** for the same reason. `features/user/api/` is
      now empty and gone.

- [ ] **The other four are not filing problems.** Each is a component that needs
      its own feature's data:

      | Component | Would drag into `shared/` |
      |---|---|
      | `NotificationBell` | `../hooks/useNotifications`, `../types` |
      | `CancellationPolicyPicker` | its own feature's API client |
      | `UserMenuButton` | `@/features/auth/hooks/useUserMenu` |
      | `LandingHeader` | the landing feature's own sections |

      **`UserMenuButton` is the tractable one** — `useUserMenu` is auth
      infrastructure and can follow `useSessionManager` into `shared/auth`,
      after which the button is a clean move.

      The rest are the composition problem, not a destination problem. They
      belong with §2b and §2d rather than here, and the honest fix is that the
      **app layer** assembles chrome from feature-owned pieces — which is also
      what §0a of `roles-and-spaces.md` concluded about the navbar.

### 2b. `user` ↔ `gamification` — 19 violations, one relationship

A quarter of the total, in one edge, and the only one that is a real product
question rather than a filing decision.

| Imported | Count |
|---|---|
| `gamification/lib/gamification` | 4 |
| `gamification/hooks/usePassport` | 3 |
| `gamification/types/gamification` | 3 |
| `components/CircularProgress`, `BadgeCard`, `PassportStamp`, `BadgeModal` | 2 each |
| `gamification/api/passport` | 1 |

This is not one leaky import. It is **the whole feature** — lib, hooks, types,
four components and the API client. The passport, badges and stamps are
rendered inside the user profile, and the two were never really separate.

- [ ] **Decide whether `user` and `gamification` are one feature.** Merging is a
      folder move and deletes 19 violations outright. Keeping them apart means
      an explicit seam — probably the profile composing gamification views at
      the `app` layer — and is a larger job than the merge.

### 2c. Four cycles

```
asset      <-> service      (2 / 2)   the real one
booking    <-> venue        (1 / 1)
category   <-> landing      (1 / 2)
dashboard  <-> user         (1 / 1)
```

Cycles are worse than depth: neither side can be read, tested or moved alone.

- [ ] **Three are a single import in one direction** — `booking → venue`,
      `category → landing`, `dashboard → user`. Break each by moving that one
      import up into `app/`, or by 2a where the target is really shared.
      `category ↔ landing` is `LandingHeader` again.
- [ ] **`asset ↔ service` is genuine**, 2 and 2 in both directions. These two
      are near-identical domains — the same listing shape with a different noun
      — which is exactly why they keep reaching for each other. Worth asking
      whether they share a base rather than importing sideways.

### 2d. `dashboard` reaching into everything — 13 violations

`dashboard` imports from **eight** other features: booking (4), venue (3), auth
(2), gamification (2), user, notifications, asset.

That is not a coupling problem so much as a description: the creator dashboard
*is* a composition of every supply domain. The template says such a thing
belongs in the `app` layer, assembled from feature-owned pieces.

- [ ] **This resolves itself with the space split** in `roles-and-spaces.md` §5.
      Do not untangle `dashboard` first — it is being taken apart anyway, and
      two of its imports (`useRoleAccess` ×2) are scheduled for deletion.

### 2e. The remainder — 12 violations

One-off edges with no pattern: `admin → cancellation-policy`,
`asset → cancellation-policy`, `event → cancellation-policy` (all 2a),
`booking → asset/service/venue`, `event → user`, `venue → user`,
`gamification → category`, `gamification → match`, `match → booking`,
`user → notifications`, `landing → notifications`, `landing → event`,
`landing → category`, `search → user`, `match → user`, `venue → review`.

- [ ] **Take these last, cheapest first.** Several disappear as a side effect of
      2a — three of them are the cancellation-policy picker alone.

---

## 3. The shared kernel is clean — 0 left of 9

The rule that mattered most, because it inverts dependency direction: the shared
kernel is what everything else stands on.

Six resolved themselves when `shared/auth/` appeared. The last three were fixed
individually, and each turned out to be a different kind of mistake:

- [x] **`SocketProvider` → `features/notifications`.** Not relocated — inverted.
      `shared/lib/realtime.ts` gained a small typed bus, so the provider
      *publishes* a socket payload and the feature *subscribes*. `SocketProvider`
      is transport now; `NotificationSocketBridge` in `features/notifications`
      decides what a notification means and is mounted from `app/layout.tsx`.

      Typing the payload found a live bug: the handler was untyped, so
      `toast.info(msg, { description: notification.description })` compiled — but
      the server's `NotificationPayload` has no `description` field. That option
      has always been `undefined`. Dropped.

- [x] **`VenuePolygonMapPicker` → `features/venue/api/venues`.** 740 lines in
      `shared/components/ui/` with exactly **one** consumer, inside
      `features/venue`. It was never shared. Moved into the feature.

- [x] **`AuthStoreProvider` → `useSessionManager`.** Recorded as blocked, and it
      was not. `useSessionManager` needed only `PROFILE_QUERY_KEY` and
      `fetchProfile` from `features/user` — and since `GET /profile` is the
      endpoint carrying the server-derived permissions, that is session identity,
      not a profile screen. Both moved to `shared/auth/profile.ts`, then
      `useSessionManager` followed. `features/user` re-exports them, so nothing
      downstream changed.

      This fixed the last shared-kernel violation *and* removed a feature-to-
      feature edge, which is why the count went 81 → 80.

**Keep it at zero.** This is the rule to wire into CI first — it is the one that,
once broken, makes everything else harder to reason about.

---

## 4. Where the app and the template differ on purpose

Recorded so nobody "fixes" these by accident.

| | template | this app |
|---|---|---|
| Store folder | `stores/` | `store/` — 9 features |
| Types | `types.ts` | `types/` folder in 5 features, `types.ts` in 1 |
| Zod contracts | `contracts/` in 2 features | **none** |
| Feature manifest | `feature.manifest.ts` in 3 | **none** |

- [ ] **`store/` vs `stores/`** is cosmetic. Rename only if something enforces
      it; otherwise it is 9 folders of churn for nothing.
- [ ] **Zod contracts are worth adopting** and `mapanytime-comparison.md` §3
      already argues for it independently — the same conclusion reached twice
      from different directions is worth acting on.
- [ ] **Feature manifests: decline.** `mapanytime-comparison.md` §4 rejected
      them because nothing enforces them, and that reasoning holds here. The
      template's own validator only checks that a manifest is never *imported* —
      it never checks that one is accurate.

**The template's doc and its code disagree**, the same way the backend
template's did. `SYSTEM_ARCHITECTURE.md` specifies `api/`, `components/`,
`model/`, `views/` per feature; the shipped features actually use `api/`,
`components/`, `hooks/`, `contracts/`, `stores/`, `types.ts`. This app matches
the shipped reality more closely than the written spec. Follow the validator,
not the prose.

---

## 5. Order of work

1. ~~**`shared/auth/`** (§1)~~ — **done**, 150 → 84.
2. ~~**The shared-kernel inversions** (§3)~~ — **done**, 84 → 80, kernel clean.
3. ~~**Move the mis-filed shared things** (§2a)~~ — **partly done**, 80 → 72.
   Two were clean moves; the other four turned out to need composition, not a
   destination. `UserMenuButton` is the next tractable one, once `useUserMenu`
   follows `useSessionManager` into `shared/auth`.
4. **Decide `user` / `gamification`** (§2b) — 19 edges, one relationship.
   Merging is a folder move; keeping them apart is the larger job.
5. **`asset` ↔ `service`** (§2c) — the one real cycle.
6. **Leave `dashboard` alone** (§2d) until the space split in
   `roles-and-spaces.md` §5 takes it apart anyway.
7. **The remainder** (§2e), cheapest first.
6. **Wire `pnpm validate` into CI** once the count reaches zero. A check that
   ships red is one people learn to scroll past.

Steps 1–3 are mechanical. Step 4 onwards is design.

---

## 6. Do not fix these two by moving them

- **`useRoleAccess`** appears in §1 as an auth import. It is being **deleted**,
  not moved — `roles-and-spaces.md` §4 records why: it is a second grant table
  on the client that cross-grants gear and service.
- **`LockedSection`** and the blurred dashboard panels are already scheduled for
  removal by the work-surface decision. Do not invest in their boundaries.

---

## 7. What else the template has that this app does not

Measured against `rm-template/next-template-v1` on 4 September. §1–§6 are about
import boundaries; this section is about everything else the template ships.

Ordered by what it buys, not by size.

### 7a. Two scripts, and one of them is a live footgun

| Script | template | this app |
|---|---|---|
| `type-check` | `tsc --noEmit` | **missing** |
| `test` | `vitest run` | `vitest` — **watch mode** |
| `lint` | `eslint .` | `eslint src/` only |
| `test:e2e` | `playwright test` | missing |
| `clean` / `analyze` / `test:coverage` | present | missing |

- [x] **`type-check` added** — `tsc --noEmit`. There was no blessed way to
      typecheck this app, which is why the stale `.next` route-validator errors
      (§5 of `TOMORROW.md`) surprise people: the first person to run `tsc` by
      hand meets four errors about a route group that no longer exists, with no
      way to know that is normal.
- [x] **`test` is now `vitest run`**, with the watch form kept as `test:watch`.
      As written it opened watch mode and never exited. CI was unaffected — it
      passes `--run` explicitly — but anyone running the obvious command locally
      got a hung terminal and no result. `pnpm test --run` still works, so
      `ci.yml` needs no change.
- [ ] **`lint` covers `src/` only** — not the root configs, `tools/` or
      `middleware.ts`. Widening to `.` as the template does is the fix.

      **Not a glob bug.** The API's script was `eslint src/**/*.ts`, which the
      shell expanded differently in bash and PowerShell; this one already passes
      a directory. Nothing here is silently skipped *within* `src`.

      And do not add `--fix` while widening: `eslint --fix` exits 0 once it has
      repaired what it can, so every auto-fixable error would stop failing CI.
      That was tried here and reverted.

### 7b. `shared/errors` — and a bug already waiting for it

The template's `shared/errors/` (6 files) is `ApiError` with a category, plus two
pieces of policy this app decides ad hoc at every call site:

- **`error-router.ts`** maps a category to behaviour: `AUTH` → toast "Session
  expired" and log out, `FORBIDDEN` → "Access denied", `VALIDATION` → no toast,
  route it to the form, `NETWORK` → its own message.
- **`retry-policy.ts`** decides retries by category: `NETWORK` three times, 5xx
  twice, 429 once, everything else not at all.

- [ ] **Adopt it, and point it at the bug that is already logged.**
      `api-audit.md` §3.4 records "Login masks infrastructure errors as bad
      credentials" — a 500 and a wrong password look identical to the user.
      That is precisely the distinction `error-router` exists to make, so the
      first adoption should be the login path and the audit item should close
      with it.

### 7c. Playwright — the answer to the oldest open problem

The template ships `playwright.config.ts`, an `e2e/` directory and
`test:e2e` / `test:e2e:ui` scripts. This app has none.

`VERIFY.md` is a 267-line browser runbook that **has never been run**, and it is
the largest gap in this repository by some distance. `TOMORROW.md` §2 makes the
case better than any argument: *41 tests pinned the `admin_secretary` boundary
and passed, while the role could not open the console at all.* They tested the
grant table and the nav; none of them rendered a page.

- [ ] **Bring Playwright in and convert VERIFY.md Part A first** — six checks,
      ten minutes by hand. Check 3 is the one that matters: if the admin queue
      updates in ~60s rather than ~1s, the socket is dead, and it is dead on
      `main`.
- [ ] Then the `admin_secretary` boundary (Part D), because that is the failure
      that proved unit tests could not see it.

**This is the highest-value item in this document.** Not because the app is
under-tested — 102 unit tests pass — but because nothing tests the thing that
actually broke.

### 7d. Commit-time enforcement

The template has `.husky/` (pre-commit and commit-msg), `lint-staged.config.mjs`
and `commitlint.config.mjs`. This app has none of the three.

- [ ] **Worth it once `pnpm validate` reaches zero** (§2), and not before. A
      pre-commit hook that fails on 80 pre-existing violations gets bypassed with
      `--no-verify` on day one, and a hook people routinely skip is worse than no
      hook. Order matters here.

### 7e. The rest

- [ ] **`shared/query`** — `useSafeQuery` / `useSafeMutation`, the wrappers that
      make 7b apply automatically rather than by remembering.
- [ ] **`shared/pagination`** — `usePagination` and its types. This app
      re-derives paging per feature.
- [ ] **`shared/flags`** — feature flags. No current need; note it exists.
- [ ] **Storybook.** The template runs it on port 6006. Genuinely useful for the
      responsive work in `responsive-plan.md`, where the hard part is seeing a
      component at several widths at once. Not urgent.

### Not recommended

- **`feature.manifest.ts`.** The template has them; decline, for the reason
  already given in `mapanytime-comparison.md` §4 and repeated in §4 above —
  nothing enforces them. The template's own validator only checks that a
  manifest is never *imported*, never that one is accurate.
