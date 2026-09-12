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

> **Re-measured 12 Sep 2026: 32 feature-isolation violations, not 19.**
> This block was already stale two days after it was written — `republic`'s
> messaging integration (`SharePostModal`, `ForwardMessageModal`,
> `AddGroupMemberModal`, `NewGroupModal`, `ChatWindowsManager` and friends) grew
> its count from 11 to 20 and added a reach into `messages` that wasn't there
> on 10 Sep, and `messages` itself now reaches into `follow` (4 violations,
> unlisted below before this update). `user`/`match`/`follow`'s counts hadn't
> moved and are unchanged. Numbers in the rest of this document were true on 4
> September; they are left as written because the *reasoning* is what makes
> them useful. **Trust the validator, not any count in a doc — re-run it before
> quoting anything, including this block:**
>
> ```
> node tools/validate-architecture.mjs
> ```
>
> | Importing feature | Violations | Reaches into |
> |---|---|---|
> | `republic` | 20 | asset, block, event, follow (×4), messages (×11), service, venue |
> | `user` | 6 | follow (×3), block (×3) |
> | `messages` | 4 | follow |
> | `match` | 1 | event |
> | `follow` | 1 | block |
>
> **`republic` is over half of what is left, and it is one decision, not
> twenty.** It composes eight-plus other features into a single screen, which
> is the definition of an app-layer concern — §2d says the same thing about
> `dashboard`, which had the same shape. Reclassifying it, or lifting its
> composition into `app/`, clears 20 of 32 in one coherent change. `messages`
> reaching into `follow` (presumably for a "people you follow" affordance in a
> group/share modal) is the next-biggest single relationship and isn't
> analyzed anywhere in this document yet.
>
> **Do not clear these by moving things to `shared`.** That was considered on
> 10 Sep and rejected: it would put `FollowButton`, `ChatPanel`,
> `BlockMenuButton` and eight API modules into the shared kernel, which makes
> the validator pass while deleting the boundary it exists to protect. §6
> already says this about two specific cases; it generalises.
>
> One violation *was* cleared on 10 Sep, because it was genuinely the filing
> error §2a describes rather than a coupling: `useCanMessage` answers "may this
> user message that one", which the public citizen profile has to ask, and it
> now sits in `shared/hooks` beside `useCanPartner` — the same question in the
> same shape, already solved there.

The app is **closer to the template than the API was**. Two of the five rules
already pass outright:

| Rule | Status |
|---|---|
| Layout is `app` / `features` / `shared` | **passes** |
| Absolute `@/*` imports, no deep relative paths | **passes** — zero violations |
| `shared/` must not import `features/` or `app/` | **passes** — was 9 |
| A feature must not import another feature | **19 violations** — was 141 |
| `app/` must not use `@tanstack/react-query` directly | **passes** |

150 violations sounded like a rewrite. It was not. It was **two problems**, and
one of them was a filing error rather than a design fault — that one is now
fixed, and the count is **84**.

| | baseline | now |
|---|---|---|
| Feature isolation | 141 | **72** |
| Shared kernel | 9 | **0** |
| **Total** | **150** | **72** |

**Regressed to 74 merging `main`, 5 Sep — not yet fixed.** `main` added a
messaging feature (`features/messages/`) whose `MessageButton` is imported
directly by `booking` (`BookingDetailClient.tsx`, 1 call site) and
`gamification` (`PassportClient.tsx`, 4 call sites, all inside nested
list-rendering JSX for match requests). Neither is a filing error like §2a's
cases — `MessageButton` pulls in `ChatPanel` and `useStartConversation` from
its own feature, so moving it to `shared/` would just relocate the whole
messaging UI there, the exact trade §2a already rejected for similar cases.
The real fix is composing it from the `app` layer per this doc's own
recurring conclusion, but with 5 call sites inside nested list rendering
that is real restructuring work, not a quick move. Deferred rather than
rushed.

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

- [x] **`useSessionManager` moved after all — see §3.** This item originally
      said it "stayed put, deliberately" because of its `useProfile` coupling.
      That coupling got resolved (§3's `AuthStoreProvider → useSessionManager`
      entry has the story — its `PROFILE_QUERY_KEY`/`fetchProfile` dependency
      moved to `shared/auth/profile.ts`), and `useSessionManager` followed into
      `shared/auth/`. Confirmed 12 Sep: `src/shared/auth/useSessionManager.ts`
      imports only from `@/shared/auth/*`. Left the two entries in place rather
      than deleting this one, since finding the same fact stated twice with
      opposite checkboxes is worse than a forward pointer.

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
| `notifications/components/NotificationBell` | dashboard, landing, user | 4 | **resolved** — see below |
| `cancellation-policy/components/CancellationPolicyPicker` | asset, event, venue | 3 | **resolved** — see below |
| `user/components/UserMenuButton` | dashboard, landing | 3 | **resolved** — see below |
| `landing/components/sections/LandingHeader` | category, venue | 2 | **resolved** — see below |

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

- [x] **All four resolved — confirmed 12 Sep against the live validator.**
      None of `dashboard`, `landing`, `user`, `asset`, `event`, `venue` or
      `category` appear as importers in the current violation list at all.
      `UserMenuButton` went exactly the way this entry predicted:
      `features/user/components/UserMenuButton.tsx` is now a one-line re-export
      of `shared/components/layout/UserMenuButton`, which imports
      `@/shared/auth/useUserMenu` cleanly (that hook followed
      `useSessionManager` into `shared/auth`, per §1 and §3), and every
      cross-feature consumer now imports the shared path directly rather than
      through the feature. `NotificationBell` and `CancellationPolicyPicker`
      resolved the same way — moved or re-pointed so no feature reaches across
      to get them. This section originally reasoned:

      | Component | Would drag into `shared/` |
      |---|---|
      | `NotificationBell` | `../hooks/useNotifications`, `../types` |
      | `CancellationPolicyPicker` | its own feature's API client |
      | `UserMenuButton` | `@/features/auth/hooks/useUserMenu` |
      | `LandingHeader` | the landing feature's own sections |

      kept for the reasoning, not because any of the four are still open.
      **app layer** assembles chrome from feature-owned pieces — which is also
      what §0a of `roles-and-spaces.md` concluded about the navbar.

### 2b. `user` ↔ `gamification` — resolved

**Confirmed 12 Sep against the live validator: zero remaining imports either
direction.** Neither `user` nor `gamification` appears as an importer in the
current violation list at all — the 19 violations this section describes are
gone. Kept below for the reasoning in case the seam reopens, not as an open
item.

Originally 19 violations, one relationship — a quarter of the total, in one
edge, and the only one that was a real product question rather than a filing
decision.

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

- [x] **Was: decide whether `user` and `gamification` are one feature.**
      Moot now that the edge is gone — either it was merged, or every
      cross-import was moved to `shared`/`app`. Worth a follow-up note on
      *which* if anyone remembers, purely for the record; doesn't block
      anything.

### 2c. Four cycles — resolved

**Confirmed 12 Sep: none of `asset`, `service`, `booking`, `venue`, `category`,
`landing`, `dashboard` appear as importers in the current violation list.**
All four cycles below are gone. Kept for the reasoning.

```
asset      <-> service      (2 / 2)   the real one
booking    <-> venue        (1 / 1)
category   <-> landing      (1 / 2)
dashboard  <-> user         (1 / 1)
```

Cycles are worse than depth: neither side can be read, tested or moved alone.

- [x] **Was: three are a single import in one direction** — `booking → venue`,
      `category → landing`, `dashboard → user`. All three resolved.
- [x] **Was: `asset ↔ service` is genuine**, 2 and 2 in both directions.
      Resolved — zero cross-imports either direction now.

### 2d. `dashboard` reaching into everything — resolved

**Confirmed 12 Sep: zero cross-feature imports found in `features/dashboard`.**
Originally 13 violations, importing from **eight** other features: booking (4),
venue (3), auth (2), gamification (2), user, notifications, asset. Kept below
for the reasoning in case the composition problem it describes recurs.

That was not a coupling problem so much as a description: the creator dashboard
*is* a composition of every supply domain. The template says such a thing
belongs in the `app` layer, assembled from feature-owned pieces.

- [x] **Resolved before the space split even started.** Whatever happened —
      the split landed, or these were cleared individually — `dashboard` has
      zero cross-feature imports now, so this is moot either way.

### 2e. The remainder — resolved

**Confirmed 12 Sep: none of `admin`, `asset`, `event`, `booking`, `venue`,
`gamification`, `landing`, `search` appear as importers in the current
violation list.** All twelve one-off edges below are gone.

Originally: `admin → cancellation-policy`, `asset → cancellation-policy`,
`event → cancellation-policy` (all 2a), `booking → asset/service/venue`,
`event → user`, `venue → user`, `gamification → category`,
`gamification → match`, `match → booking`, `user → notifications`,
`landing → notifications`, `landing → event`, `landing → category`,
`search → user`, `match → user`, `venue → review`.

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
- [ ] **Zod contracts are worth adopting** — the now-removed
      `mapanytime-comparison.md` argued for it independently, from the API side;
      the same conclusion reached twice from different directions is worth
      acting on. See `api-audit.md`'s note on that file's removal.
- [ ] **Feature manifests: decline.** Nothing enforces them, and the template's
      own validator only checks that a manifest is never *imported* — it never
      checks that one is accurate.

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
3. ~~**Move the mis-filed shared things** (§2a)~~ — **done**. All six resolved,
   including the four that needed composition rather than a destination.
4. ~~**Decide `user` / `gamification`** (§2b)~~ — **done**, edge gone.
5. ~~**`asset` ↔ `service`** (§2c)~~ — **done**, along with the other three
   cycles in that section.
6. ~~**`dashboard`** (§2d)~~ — **done**, zero cross-feature imports.
7. ~~**The remainder** (§2e)~~ — **done**.
8. **New since this list was written: `republic` (20 violations) and
   `messages` (4)** — see §0. `republic`'s composition of eight-plus features
   into one screen is the same shape §2d described for `dashboard`, and the
   same fix applies: lift the composition into `app/`, or reclassify it as an
   app-layer concern rather than a feature.
9. **Wire `pnpm validate` into CI** once the count reaches zero. A check that
   ships red is one people learn to scroll past. Still not done — the count
   went from 0 (this section's original target) to 32, which is exactly the
   kind of drift a CI gate exists to catch before it reaches this size.

Steps 1–7 are done. Step 8 is the entire remaining count, and it is design
work, not mechanical cleanup — the same as step 4 was.

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
  repeated in §4 above — nothing enforces them. The template's own validator
  only checks that a manifest is never *imported*, never that one is accurate.
