# API, Data-Fetching and Auth Audit

Status: open — last verified 27 August 2026 (app `ccfcf75`, api `2b5e63c`)
Scope: `fox-passport-republic-app` + `fox-passport-republic-api`
Role: **the record.** `TOMORROW.md` is the running order; this is what was found,
what was fixed, and what is still open. Sections 1–2 and 4 are closed history —
section 3 is the live list.

Every claim below was checked against the code. Where an external audit report
was wrong, the correction is recorded rather than quietly dropped — the wrong
version keeps coming back otherwise.

> **This is not the only tracker.** Responsive and touch-input work lives in
> [`responsive-plan.md`](./responsive-plan.md), in this folder. Neither document
> shows the whole picture on its own. Open items there include the builder
> tap-to-place fallback, the duplicated experience builder (one component file,
> one inline copy at `src/app/event/[eventId]/page.tsx:21`), the Playwright touch
> harness, and the `/mayor` rename decision.

---

> **Tomorrow's queue:** [`mapanytime-comparison.md`](./mapanytime-comparison.md)
> evaluates what to adopt from the mapanytime codebase. Short version: **do not**
> copy its token storage (sessionStorage — its own comment says that is not XSS
> protection, and the Flutter constraint forcing it does not apply here), **do**
> take refresh-token rotation and Zod response contracts.

## 1. Corrections to the source audit

Read this section before re-litigating anything.

| Claim as received | Reality |
|---|---|
| Refresh stampede "causes token invalidation race conditions and unintended user logouts" | **No logout mechanism exists.** `api/src/services/auth.service.ts:193` is a stateless `jwt.verify` that returns only a new access token and **does not rotate the refresh token**, so concurrent refreshes are idempotent. Rate limiting can't cause it either: `api/src/app.ts:67` allows 1000 req / 15 min and is disabled in dev. Real bug, wrong severity — it is wasted requests, not lost sessions. |
| "Bcrypt (10 salt rounds)" | It is **12** (`api/src/utils/password.ts:18`). |
| Fix 1: add `// eslint-disable-next-line react-hooks/exhaustive-deps` | Silences the linter and leaves a stale closure. Use a ref instead (see 2.1). |
| Fix 2: paste the `failedQueue` interceptor | **Contains a bug.** Queued requests are retried with `api(originalRequest)` without `_retry` set — only the *first* request sets it. If the refreshed token also 401s, every queued request starts another refresh cycle. A shared in-flight promise is a third of the code with no queue to get wrong (see 2.2). |
| Fix 4: "update `useProfile` to consume the `["me"]` query" | Half right. Sharing a **key** while keeping two different `queryFn`s means whichever runs first silently decides behaviour — and the two differed. They must share one fetcher too (see 2.4). |
| Token invalidation listed as a ⚠️ table row below four bugs | It is the **single most serious finding**. See section 4. |
| "`useSearch.ts`: pagination with placeholder preservation" | It had **neither** `placeholderData` nor `keepPreviousData` — just a 5-minute `staleTime`. Search paging flashed empty. Fixed. |
| "`useHostServiceEdit` / `useHostEventEdit` properly implemented" | **Accurate.** Checked all three siblings (`service`, `event`, `asset`) — each uses `[id, hostId]`. Venue was the lone outlier. |
| "Mapbox 400ms debounce" | **Accurate**, both files. |
| "Dual Storage Sync: can fall out of sync" | **Accurate and understated** — see 2.6. |

---

## 2. Fixed — merged via `perf/dedupe-dashboard-fetching` (app PR #36)

### 2.1 Infinite `GET /venues` loop — `useHostVenueEdit.ts`

- [x] Fixed

`useVenueBuilder()` returns a bare object literal (`venue/hooks/useVenueBuilder.ts:337`
— spreads the store and rebuilds handlers, and the return is **not** memoised), so
its identity changes every render. Listing `builder` in the prefill effect's deps
meant the effect's own eight `builder.setX()` calls triggered a render, which
produced a new `builder`, which re-ran the effect. Unbounded.

**Fix:** hold the builder in a ref and shadow the name at the top of the effect,
so its ~150-line body is untouched and the dependency list is honest.

### 2.2 Concurrent refresh stampede — `shared/lib/axios.ts`

- [x] Fixed

N parallel queries expiring together fired N identical `POST /auth/refresh-token`.

**First fix:** one shared in-flight promise; every concurrent 401 awaited it.

**Then superseded by 2.6.** Moving to the proxy removed client-side refreshing
altogether, so `axios.ts` now has no request interceptor, no token and no refresh
path — the stampede is structurally impossible rather than serialised. The mutex
was deleted along with the code it guarded. Recorded here because the original
report asks for that mutex by name, and it should be clear why the file does not
contain one.

### 2.3 Dashboard over-fetching and ungated polling

- [x] Server: `getHostDashboard` composed from single-resource fetchers;
      `getAssetsByHostId` / `getVenuesByHostId` added. `/creator-dashboard/assets`
      and `/venues` went from **6 requests to 2**.
- [x] Server: `getUser` wrapped in React `cache` — profile resolves once per
      request instead of once per auth guard.
- [x] Landing page: `getVenues()` ran unconditionally and was **discarded** on the
      default view (that branch renders `FoxerLandingPage`, which takes no
      venues). Now branch-aware and parallel — the front door went from 3
      sequential requests, one wasted, to 2 parallel.
- [x] Categories page: three independent fetches were sequential. Batched.
- [x] Admin: `AdminContent` mounted **8** `useAdminData` hooks but renders one tab
      at a time — ~10 requests every 5s for tabs nobody could see. Each query is
      now gated on its own tab. `staleTime` raised from 1s so the SSR
      `initialData` is actually used instead of instantly refetched.
- [x] Host dashboard: role-locked sections still fetched. A venue-only Foxer
      polled events, assets and services every 10s to render them into
      `LockedSection` as empty lists. Each query now gated on the same
      `access.canManageX` flag that decides whether the section renders.

> The polling **intervals** (admin 5s, host 10s, user 15–30s) were deliberately
> left alone. Gating cut the traffic 4–10× already, and cadence is a product
> decision about how live these should feel, not a defect. See 3.1.

### 2.4 Duplicate `/profile` requests

- [x] Fixed

`useProfile` used raw `useState`/`useEffect`, invisible to React Query, while
`useSessionManager` polled the same endpoint under `["me"]`.

**Fix:** one canonical `fetchProfile()` exported from `useProfile.ts` and used by
both hooks — one key **and** one fetcher. This surfaced a latent type bug:
`ProfileData.systemRole` was `string` while the store's `User.systemRole` is
`"user" | "admin"`. Narrowed to the real unions rather than cast — a cast would
only have hidden the mismatch.

### 2.5 Landing page called the API from a component

- [x] Fixed

`HeroSection` held an endpoint path, a response shape, a 300ms timer and error
handling. Extracted to `features/landing/api/locations.ts` +
`hooks/useLocationSearch.ts`, matching the `features/*/api/` convention eight
other features already use. Gained request cancellation on the way.

---

### 2.6 Tokens removed from `localStorage` — Next proxy

- [x] Fixed

The server kept `fox_token` / `fox_refresh_token` httpOnly; the client wrote both
to `localStorage` anyway, so the protection bought nothing. Worse, the two stores
**drifted**: a client-side refresh updated `localStorage` but could not touch the
cookie, and the server's own refresh is discarded because a Server Component may
not write cookies (`server/data.ts:43-60` catches and ignores it). Every SSR load
after a client refresh burned a refresh call that could never persist.

**Fix:** `src/app/api/proxy/[...path]/route.ts` — client axios now points at
`/api/proxy`; the route reads the httpOnly cookie, adds the Bearer header, and
forwards. A Route Handler *may* write cookies, so it is also the one place a
refreshed token can be persisted.

Consequences, all deliberate:

- `axios.ts` has **no request interceptor and no token** — the 401 stampede it
  needed a mutex for cannot happen, because refreshing is server-side and single.
- `useAuthStore` stores profile data only; `login()` narrowed to `Pick<…,"user">`.
- `AdminAuthGuard` rehydrates from `fox_user` alone. That is a display hint, not
  proof — `middleware.ts` verifies the JWT at the edge and the API rejects bad
  tokens, so a stale profile grants nothing.
- **Client-side proactive refresh deleted** from `useSessionManager`. It decoded
  the JWT to refresh 2 minutes early, which needed both tokens in `localStorage`.
  The proxy refreshes on 401 and replays the request, so expiry costs one hop and
  is invisible — better than the client predicting it.
- Caught while doing this: `enabled: isAuthenticated && !!accessToken` on the
  profile poll would have been **permanently false** once the token left the
  store, silently disabling role refresh. Now gated on `isAuthenticated`.
- `useVenuesByCategory` (two near-duplicate copies) called the API with bare
  `axios`; both now use the shared client.

`useAuth.ts` still talks to the API directly, correctly — login happens before
any cookie exists.

### 2.7 Mapbox geocoding cancellation

- [x] `MapboxLocationInput.tsx`, `MapboxLocationPicker.tsx`

400ms debounce stops requests being *started*; it does not stop an in-flight one
resolving after a newer query. Both now abort, with `AbortError` swallowed.

### 2.8 Pagination no longer flashes empty

- [x] `useHostData`, `useSearch`

Page number is in the query key, so paging is a cache miss. Both now use
`placeholderData: keepPreviousData`.

---

## 3. Open

### 3.1 Poll cadence is undecided

- [ ] Decide what freshness each dashboard actually needs

Admin 5s, host 10s, user 15–30s. Now that they are gated this is a product
question, not a defect. Socket.io already exists, so event-driven invalidation is
a real option.

### 3.2 The `enabled` gate is a hand-applied pattern

- [ ] Test asserting queries are gated on whatever decides rendering

Applied by hand twice (admin tabs, host role locks). A third will appear.

### 3.3 Duplicate `useVenuesByCategory`

- [x] Duplicate deleted. See 4.7.

Two near-identical copies of the same hook and endpoint. Same trap as the Stripe
pages: fix one, the other drifts.

### 3.4 Login masks infrastructure errors as bad credentials

- [x] Done. See 4.8.

Its catch-all returns `401 Invalid credentials` for *any* throw from
`AuthSvc.login`, including database errors. That is what made a missing table
look like a wrong password and cost real debugging time. A 500 for unexpected
errors, 401 only for a genuine credential mismatch.

### 3.4b Untracked money-precision migration

- [x] Committed as `chore(db): track the money-precision migration`. The
      caution below still applies to any environment with real rows.

Not mine — it appeared during this session. It converts **every money column**
(`Booking`, `Event`, `Payment`, `payouts`, `refunds`, asset/service bookings, all
`agreedPrice` fields) from `DoublePrecision` to `Decimal(12,2)`. `schema.prisma`
already declared `Decimal` in 28 places and was committed that way, so this is
the migration that closes drift the schema had already asserted. Floats for money
is a real bug and this is the right direction — it matters directly for the
Stripe Connect payout maths in `fox-passport-republic-api/docs/adr/0002-stripe-connect-payouts.md`.

Two cautions:

- **It is applied to the local database but untracked in git.** If that folder is
  lost, the database and repository disagree with no record of why.
- The generated SQL warns that casting `Double → Decimal(12,2)` rounds to two
  decimal places and cannot represent more than 12 digits. Harmless on seeded dev
  data; check the ranges before this reaches anything with real rows.

Its name (`re_name`) looks like a placeholder accepted at the prompt rather than
a description.

### 3.4c Admin responsive — correction owed to `responsive-plan.md` §2.3

- [ ] Fold this into `responsive-plan.md` §2.3 when the branches merge

**That section's advice is wrong and should be replaced.** It says *"Admin —
desktop-only is an acceptable answer"* and recommends scoping admin to `lg` and
above. That conclusion came from counting breakpoint prefixes per file — the same
metric that missed `ExperienceBuilder` entirely (see `responsive-plan.md` §5.1).

Checked directly. Admin was already ~90% mobile-capable:

| Piece | State |
|---|---|
| Sidebar | Already an off-canvas drawer (`-translate-x-full` / `lg:translate-x-0`) |
| Content offset | `lg:pl-64` correctly drops the gutter below `lg` |
| Tables | All 8 table files carry `overflow-x` guards |
| Charts | Percentage-based CSS bars, not fixed SVG — they scale |
| **KPI cards** | **The one genuinely broken piece** |

`AdminKPISection` was `grid-cols-1` at base with full desktop sizing — `p-6`, a
48px icon block, `text-4xl` values and a **100px** decorative glyph, so four short
numbers (`147`, `88`, `₱1.4M`) each took a ~180px full-width row. One component
made the whole page look unbuilt.

Adopting "desktop-only" would have meant **deleting working code** — the drawer,
the offset, the overflow guards.

**Replacement guidance for §2.3:** admin stays mobile-*capable* — the layout must
not break at any width, which is cheap and already true — but is not a mobile
*target*. Do not optimise the data-dense tables for phones; a nine-column
bookings table on a 400px screen scrolls horizontally whatever you do, and that
is fine for a spot-check.

Fixed here (both KPI rows, since the Foxer dashboard's `KPICards` was worse — it
did not go 2-up until `md`, so even a large phone in landscape got one column):

- [x] `AdminKPISection` — 2-up at base, padding/type/icons scale up rather than
      starting at desktop size
- [x] `KPICards` — same treatment, so the two KPI rows behave identically
- [x] `AdminContent` page padding `p-8` → `p-4 sm:p-6 lg:p-8`
- [x] `AdminChartsSection` — card padding, gaps and bar-chart gutters scaled;
      seven bars with 16px gutters was mostly gutter on a phone

### 3.4d Line endings churn on every `format`

- [x] Added to both repos. See 4.8.

`npm run format` rewrote **199 files**; only 38 had real changes. The other 156
were pure line-ending churn — prettier forces LF, the repo runs
`core.autocrlf=true` and has **no `.gitattributes`**. That was unpicked by hand
this time. Until the file exists, every format run produces a 156-file noise
diff that collides with everyone else's branches, and the next person will not
know to unpick it.

### 3.4e Two admin UIs now have to be kept in step

- [ ] Decide whether `MobileAdminView` earns its keep

`MobileAdminView` is a hand-built mobile overview; `AdminContent` is the real
dashboard. They are now both wired to real data, but they are two
implementations of the same screen. The mockup had **already** drifted into
pure placeholder content once — that is exactly the failure mode to expect
again. The alternative is dropping it and letting the real admin render at all
widths, which it is largely capable of (drawer sidebar, `lg:pl-64` offset,
`overflow-x` on all eight tables).

### 3.4f Mobile reject sends a canned reason

- [x] Inline reason field added. See 4.8.

The desktop flow prompts for a rejection reason; the mobile row has no room, so
it sends `"Rejected from mobile admin"`. If that string is ever shown to the
Foxer whose listing was rejected, it needs to become a real input.

### 3.4g Single-session logs people out across their own devices

- [ ] Confirm this is the intended trade

Login revokes every other session for that account, so a user with a phone and a
laptop is signed out of one whenever they use the other. That is what was asked
for, and it is the right answer for shared-credential abuse — but it is a
noticeable change for anyone who genuinely works across two devices. Enabling it
also signs out every session that existed beforehand, the first time each user
signs in.

### 3.5 The proxy is unverified end to end

- [x] Login verified through the proxy against a live API and browser.
- [ ] Still unexercised in a browser: mobile admin (drawer, approve/reject),
      the venue mobile booking bars, the reconnected `NavMobileMenu`, password
      change/reset revocation, and the proxy's multipart and
      401-refresh-replay paths.

Types, lint, build and unit tests pass, but **no request has actually gone
through the proxy** — there is no running backend here. Multipart, redirects and
the 401-refresh-replay path are reasoned about, not observed. Verify before
merging.

## 4. Sessions can now be revoked

- [x] `RefreshToken` model, issuance, verification and revocation
- [x] Migration written and applied (`20260826141631_add_refresh_token`)
- [x] **Verified end to end against a live API and database**

Refresh was a stateless `jwt.verify` with nothing persisted, `POST /auth/logout`
returned 200 and did nothing, and **the frontend never called it at all**. A
leaked refresh token was valid 30 days with no way to revoke it.

**Fix (API):**
- `RefreshToken` model — stores the **jti only**, never the token: enough to
  revoke, useless to anyone who reads the table. Indexed on `userId`/`expiresAt`,
  cascade-deleted with the user.
- `services/refresh-token.service.ts` — `issueRefreshToken`, `verifyRefreshToken`
  (signature **and** revocation), `revokeRefreshToken`, `revokeAllForUser`.
- Refresh tokens no longer embed role/email — those were never read on refresh,
  since the user is re-fetched.
- A jti missing from the table is invalid. That deliberately invalidates tokens
  minted before this table existed, rather than letting them bypass revocation.
- `AuthSvc.logout` never throws on a bad token: logout must always succeed.

**Fix (app):** `clearAuthCookies` now reads the httpOnly refresh cookie and POSTs
it to `/auth/logout` before deleting — it is the only place that still holds the
token. Failures are swallowed so the network can never block logging out.

> **Migration applied.** Purely additive — one `CREATE TABLE`, three indexes,
> one FK. No existing table altered, no data touched. Written via
> `migrate diff --script` and applied with `migrate deploy` rather than
> `migrate dev`, because `deploy` can never prompt to reset the database.
> `migrate diff` now reports "No difference detected".
>
> **Regression this caused, and the lesson:** adding `issueRefreshToken` to the
> login path before the table existed made every login fail — and
> `auth.controller.ts` turns *any* error from `AuthSvc.login` into
> `401 Invalid credentials`, so a missing table was indistinguishable from a
> wrong password. Schema-dependent code and its migration have to land together.
> That the controller masks infrastructure failures as auth failures is worth
> fixing separately (see 3.4).
>
> Verified against a live API and seeded database:
>
> | Step | Result |
> |---|---|
> | `POST /auth/login` | **200** — access + refresh token returned |
> | `POST /auth/refresh-token` before logout | **200** |
> | `POST /auth/logout` | **200** |
> | `POST /auth/refresh-token` after logout | **401 "Invalid refresh token"** |
>
> The last row is the whole point: a refresh token that used to stay valid for
> 30 days after logout is now dead the moment the user signs out.

### 4.1 One active session per account

- [x] Implemented and verified

Requested: one email must not be usable in two places at once.

Now possible because the `RefreshToken` table exists. Login calls
`revokeAllForUser(user.id)` **before** issuing the new token, so signing in
somewhere else ends the previous session instead of running beside it.

Verified against a live API:

| Step | Result |
|---|---|
| Device A logs in, A refreshes | **200** |
| Device B logs in with the same email | **200** |
| A refreshes again | **401** — A is out |

**The caveat, stated plainly:** an access token already issued to the displaced
session stays valid until it expires. It is a stateless JWT and nothing consults
a revocation list per request. With `ACCESS_TOKEN_EXPIRY=15m` that is the
longest the old session can linger, and it cannot renew itself because its
refresh token is revoked. Closing that window entirely would mean checking
revocation on every authenticated request — a database read per call. Not worth
it unless you need instant lockout.

### 4.2 Token and cookie lifetimes now agree

- [x] Fixed

Three separate disagreements, two of them mine:

| | Was | Now |
|---|---|---|
| Refresh token TTL | Hardcoded **30d** in `refresh-token.service.ts`, silently overriding `.env` `REFRESH_TOKEN_EXPIRY=7d` | Parsed from config — verified as 7 days |
| `fox_token` cookie | `maxAge` 7 days, but the JWT expires in **15m** | `SESSION_MAX_AGE` |
| `fox_refresh_token` cookie | `maxAge` 30 days, but the JWT lasted 7 | `SESSION_MAX_AGE` |

The browser was holding credentials the server had already stopped honouring.
Cookie lifetime is now derived from the refresh token, which is what actually
defines how long a session lives; the access cookie matches it because the proxy
refreshes an expired access token transparently, so expiring the cookie sooner
buys nothing.

Also confirmed the refresh token carries only `userId`, `jti`, `iat`, `exp` — the
role and email claims it used to embed were never read on refresh, since the user
is re-fetched from the database.

### 4.3 SSR auth was broken in three places at once

- [x] Fixed

Surfaced by admin-page log spam: six `Failed to fetch ...: NEXT_REDIRECT` errors,
and the page still returned **200 with empty data** instead of redirecting.

The chain:

```
token dead -> getUser() 401 -> falls back to the fox_user COOKIE -> stale admin
           -> requireAdmin() sees systemRole:"admin" -> PASSES
           -> 8 data fetches -> all 401
           -> serverFetch calls redirect("/login") -> throws NEXT_REDIRECT
           -> all 27 catch blocks swallow it -> "Failed to fetch X"
           -> renders 200, empty
```

- [x] **A dead session passed the auth guard.** `getUser` caught the 401 and fell
      back to the `fox_user` cookie — display data that outlives the token — so
      the guard was satisfied by a stale profile. Now a **401/403 means
      unauthenticated**. Other failures (API down, timeout) still fall back:
      those mean "cannot tell", not "logged out", and a backend blip must not
      sign everyone out. `getServerApi` now attaches the HTTP status so the two
      cases can be told apart.
- [x] **The redirect was swallowed 27 times.** `redirect()` signals by throwing,
      and every fetcher wraps `serverFetch` in try/catch, so it was caught as a
      fetch failure. The fetch layer no longer redirects at all — authentication
      belongs to the page-level guards, which run first and are not inside a
      catch.
- [x] **`/login` is not a route in this app.** Even had it propagated, it
      targeted nothing. The guards correctly use `/`.

> **How it was triggered, honestly:** my own single-session testing. Logging in
> twice as `admin@example.com` via curl called `revokeAllForUser` each time,
> which killed the browser session that was open. The feature working as
> specified — but worth knowing that enabling 4.1 logs out every existing
> session the first time someone signs in.

### 4.4 Merge conflict resolutions (main + staging)

- [x] Both repos are now **0 behind `main` and `staging`**

The app merge hit four conflicts. Recorded because each was a judgement call, not
a mechanical resolution:

| File | Resolution | Why |
|---|---|---|
| `app/page.tsx` | **Both** | main split the landing into `MobileHomePage` / `FoxerLandingPage`; this branch hoisted fetching into a branch-aware `Promise.all`. Kept the split, fed from the parallel batch instead of a sequential re-fetch. |
| `Navbar.tsx` | **Upstream** (+ local gap scale) | Upstream replaced the hamburger with `MobileBottomNav` (`lg:hidden fixed bottom-4`) and no longer renders `NavMobileMenu`. The local hamburger would have toggled a panel that does not exist. Kept the local `gap-2 sm:gap-3 lg:gap-4`. |
| `VenueHeader.tsx` | **Local** | The local version is a coherent mobile-hero + desktop-bento split, and the unconflicted code below already implements it. Upstream's fragment carried a `key={idx}` on a div not inside a `.map()`. |
| `SearchClient.tsx` | **Upstream** | Newer, carries the `TYPE_CHIPS` filter the local side lacked, and its `pb-28 sm:pb-12` is clearance for `MobileBottomNav` — consistent with the Navbar decision. |

Three of those four were **uncommitted local edits that were not mine** — mobile
work in progress. A full copy of the pre-merge tree was taken to the scratchpad
before stashing, and both stashes applied cleanly afterwards.

> **Known cosmetic leftover:** `SearchClient.tsx:1` has an unused
> `eslint-disable react-hooks/exhaustive-deps`. It comes from upstream and is a
> warning, not an error — left alone rather than creating a diff against
> upstream for a cosmetic.

### 4.5 Findings from the full diff review

- [x] **Password reset did not end existing sessions.** `resetPassword` changed
      the hash and stopped. A reset is the action that most often follows
      "someone else is in my account", so leaving the intruder's refresh token
      alive for the rest of its 7 days defeated the point. Now calls
      `revokeAllForUser`.
- [x] **Nor did password change.** Same fix in `profile.service.ts`.
      **UX consequence, stated deliberately:** this revokes the caller's own
      session too, because only `userId` is available there, not their `jti`. The
      user is signed out and must log in with the new password. That is the safe
      default; preserving the current session would mean threading the jti
      through from the request.
- [x] Removed a dead reassignment in the proxy (`accessToken = refreshedToken`
      was never read again); `accessToken` is now `const`.
- [x] **`NavMobileMenu.tsx` was orphaned — now reconnected.** Nothing rendered it
      on this branch, `main` or `staging`. Partly self-inflicted: resolving the
      `Navbar` merge conflict I took upstream's side, which had dropped the
      hamburger in favour of `MobileBottomNav`, and read the menu as dead rather
      than as half of a feature mid-assembly. They are complementary —
      `MobileBottomNav` carries four primary destinations plus Create, the panel
      carries browse categories and the secondary/auth links that do not fit in
      a five-slot bar. Hamburger restored at `lg:hidden`, panel rendered.

Reviewed and found correct, for the record:

- `register` issues a refresh token but does **not** revoke — right, there is
  nothing to revoke on a new account.
- `deleteAccount` needs no revocation: `RefreshToken` cascade-deletes with the user.
- `serverFetch` returning `null` on auth failure is safe for callers —
  `extractList(null)` already yields `[]`.
- Two diffs against `staging` that look unexpected are benign: `ci.yml` is a step
  rename that came from `main`, and `docs/responsive-plan.md` is added by `main`
  (staging does not have it).
- The proxy is same-origin, so client calls no longer generate CORS preflights —
  the paired `OPTIONS` requests visible in DevTools earlier should disappear.

### 4.6 Token storage — the gap that survived the proxy work

- [x] `AuthStoreProvider` no longer resurrects tokens from `localStorage`
- [x] Legacy tokens are actively purged from existing users' browsers
- [ ] **Login still passes tokens through client JavaScript for one tick**

Section 2.6 claimed tokens were fully out of `localStorage`. **That was wrong.**
`shared/providers/AuthStoreProvider.tsx` was still reading `fox_token` and
`fox_refresh_token` from `localStorage` and pushing them **back into cookies on
every mount** - migration code from before the tokens moved. Two problems:

1. It re-admitted a token to the cookie jar from a script-readable source, which
   is precisely what the httpOnly move existed to stop.
2. **Every user who signed in before the change still had both tokens in their
   browser**, readable by any script, with nothing to remove them.

It now removes those two keys instead, so old copies disappear on each user's
next visit rather than lingering until something overwrites them. `fox_user` is
left alone: profile data, no token, and it is what rehydrates the session.

**How the earlier check missed it:** the verification grep used
`localStorage.\(get\|set\)Item` — BRE alternation without `-E`, which matches
nothing and reads as a pass. Re-running with `-E` found it immediately. A false
negative reported as verified; worth remembering when a "no results" grep is used
as evidence.

**Residual, still open.** `useAuth.ts:87` receives the login response in client
JavaScript and hands it to the `setAuthCookies` server action. The tokens are
never *stored* client-side, but they exist in memory for that tick. Closing it
means moving login behind a route handler that sets the cookies directly so the
response body never reaches the browser. Smaller exposure than persistent
storage was, but it is the last place a token touches the client.

Current state, for reference:

| Store | Contents | Script-readable |
|---|---|---|
| `fox_token` cookie | access token, 15m | no (httpOnly) |
| `fox_refresh_token` cookie | refresh token, 7d | no (httpOnly) |
| `fox_user` cookie | profile only | yes, deliberately |
| `localStorage` | `fox_user` only | yes, profile only |
| `sessionStorage` | checkout/booking drafts | yes, no tokens |

### 4.7 Deabstraction

- [x] Deleted the duplicate `useVenuesByCategory` outright

First attempt left a re-export shim, which is indirection with extra steps - two
files to read instead of one, and the implementation somewhere else. Deleted
properly; the three import sites now point at the venue copy, which has the
superset `Venue` type.

- [x] Deleted 5 barrels with **zero** importers

`features/{category,dashboard,landing,role-application}/index.ts` and
`shared/lib/server/index.ts`. The 7 barrels with real importers (1-4 each) were
kept - removing those would mean rewriting call sites to drop a convention the
codebase uses deliberately, which is churn rather than simplification.

One of the deleted five was self-inflicted: exports had been added to
`features/landing/index.ts` during the landing refactor, to a barrel nothing
imported.

### 4.8 Closed since the last pass

- [x] `.gitattributes` added to both repos (`* text=auto eol=lf`), so `format`
      stops churning 156 files' line endings. Added without `--renormalize`, so
      files normalise as they are touched rather than in one mass commit that
      would conflict with every open branch.
- [x] Login no longer masks server errors as `401`. Only a genuine credential
      mismatch returns 401; anything else is a 500.
- [x] Mobile reject collects a real reason inline (confirm/cancel, Enter/Escape)
      instead of sending a canned string.

### 4.9 Refresh tokens rotate on use

- [x] Implemented and **verified against a live API and database**

Refresh tokens were reusable for their full 7 days. Revocation existed (§4), but
nothing distinguished the real holder from someone with a copy: both tokens were
the same token, and both worked until expiry. Rotation makes them single-use, so
the two copies diverge the moment either is spent — and the loser presenting a
dead token is the evidence.

**API.** `rotateRefreshToken()` in `refresh-token.service.ts` replaces the plain
verify on the refresh path. Three outcomes:

| Presented token | Result |
|---|---|
| Live | Revoked, successor issued, linked via `replacedByJti` |
| Rotated < 60s ago | A parallel-request race — successor issued anyway |
| Rotated > 60s ago | **Reuse.** `revokeAllForUser`, then 401 |
| Revoked by logout / password change | Ordinary 401. Never trips theft detection |

Two schema columns carry that distinction: `rotatedAt` and `replacedByJti`
(migration `20260827090000_add_refresh_token_rotation`, purely additive — two
nullable columns, applied with `migrate deploy`). `revokedAt` **without**
`rotatedAt` still means logout, which is why a stale tab cannot end a user's
other sessions.

The rotation is claimed with a conditional `updateMany` on `revokedAt: null`, so
of N concurrent callers exactly one wins and the rest fall through to the grace
path. Reuse is logged in `auth.controller.ts` — it is the only place that signal
exists.

**Controller.** The refresh endpoint no longer flattens every failure into 401.
`RefreshTokenError` → 401, anything else → 500. Same correction as §3.4: an
infrastructure fault must not present as an auth failure.

**App — three call sites, two of which would have killed sessions silently.**

- `api/proxy/[...path]/route.ts` now persists **both** cookies. Persisting only
  the access token would have left the browser holding a revoked refresh token.
- It also collapses concurrent refreshes in a process-local in-flight map.
  §2.2 assumed "the proxy serialises refreshes server-side" — **it did not**,
  there was no lock. Two parallel 401s each spent the same token. Idempotent
  before rotation, a logout bug after it.
- `auth-actions.ts` `refreshUserSession` persists the rotated token too.
- **`server/data.ts` no longer refreshes at all.** It never could persist —
  a Server Component may not write cookies, so the write threw and was swallowed
  (§2.6). Wasteful before; with rotation it would spend the live token and drop
  its successor. On a protected route `middleware.ts` has already rejected an
  expired access token before this code runs, so a 401 here means the session is
  genuinely over.

> **Verified end to end** against the API on :6002 and the dev database:
>
> | Step | Result |
> |---|---|
> | Login, then refresh with `T1` | **200**, and a **new** refresh token `T2` is returned |
> | Replay `T1` immediately (race window) | **200** — not treated as theft |
> | Refresh with `T2` | **200** → `T3` |
> | Replay `T1` with its `rotatedAt` backdated 10 min | **401**, reuse logged |
> | Refresh with `T3` — the legitimate live token | **401** — every session revoked |
>
> The last two rows are the point: replaying a superseded token ends the account's
> sessions rather than quietly minting more.
>
> Unit tests: `tests/refresh-token.rotation.spec.ts`, 7 cases including the
> parallel-rotation race and the logout-is-not-theft distinction.

**Known consequence.** Reuse detection signs out the legitimate user too — that
is the intended trade (a copy exists; end everything and make them re-authenticate),
but it means a client that drops a rotated token will look like an attack. All
three persisters were fixed for exactly that reason.

### 4.10 Any authenticated user could edit or delete any review

- [x] Fixed and **verified against a live API**

`PUT /api/v1/reviews/:id` and `DELETE /api/v1/reviews/:id` required a token but
never asked *whose*. No layer checked:

| Layer | Before |
|---|---|
| `review.routes.ts:17-18` | `authenticate` only — no role, no owner guard |
| `review.controller.ts` | Took `:id`, forwarded `req.body`, **never read `req.user`** |
| `review.service.ts` | `updateReview(id, data)` — no requester parameter existed |
| `review.repository.ts:247` | `prisma.review.update({ where: { id }, data })` with `data` = raw body |

Two problems stacked: an ownership hole, and — because the body reached Prisma
unvalidated and no Joi schema existed on the route — mass assignment on every
column of `Review`.

**Why it is not cosmetic.** `rating` feeds `specialization.service.ts:51`
(`_avg.rating >= EARNED_MIN_RATING`). Earned Specializations are auto-granted at
three completed bookings with a 4.0+ average and, per `CONTEXT.md`, **never
revoked**. Deleting the bad reviews and inflating the rest was enough to mint a
permanent badge.

**Why it reads as an oversight rather than a design gap.** Every neighbour in the
same file already did the check: `createReview` verifies the booking belongs to
the reviewer and is not pending or cancelled, and `replyToReview` verifies
author-or-host. Only these two were skipped.

**Fix.** `assertCanMutate` in the service — author or admin, else `Unauthorized`;
a Joi schema on the controller restricted to `rating` (1–5) and `comment`; the
service narrows the patch again so a future caller that skips the schema still
cannot mass-assign; and `reviewMutationStatus` maps `Unauthorized → 403`,
`Review not found → 404`, rather than collapsing everything into 400 (§3.4 again).

> Verified against the API on :6002 and the dev database:
>
> | Attempt | Result |
> |---|---|
> | Non-author `PUT` on someone else's review | **403** |
> | Non-author `DELETE` | **403** |
> | Admin `PUT` (moderation must keep working) | **200**, other fields untouched |
> | Body carrying `userId` / `entityId` | **400** `"userId" is not allowed` |
> | `rating: 99` | **400** out of range |
> | Unknown review id | **404** |
>
> The seeded review used for the test was restored to its exact seeder value.
>
> Unit tests: `tests/review.authorization.spec.ts`, 6 cases. The refusal cases
> assert the repository was **not called at all**, not merely that the response
> was an error.

### 4.11 `requireOwnerOrAdmin` has no call sites

- [ ] Decide: adopt it, or delete it

The middleware exists and is documented, and `AUDIT_REPORT.md` §3 cites it as an
enforced RBAC control. **Nothing calls it.** Ownership is hand-rolled per
resource instead — venue compares `mayorId` in the service, asset, service and
event-template each read `ownerId` in the controller and pass it down. All of
them are correct; all of them are different.

That is the conditions that produced §4.10: there is no single mechanism to
forget, so forgetting is invisible. Either route the resources through
`requireOwnerOrAdmin` where the owner id is derivable from the path, or delete
it so it stops implying a guarantee that is not there.

### 4.12 No boot-time validation of required environment variables

- [ ] Fail fast on missing secrets

`config.ts` reads 13 values as `process.env.X as string`. There are **no
hardcoded fallback secrets** — checked specifically, and that part is right —
but nothing validates presence either, so a missing `ACCESS_TOKEN_SECRET` lets
the API boot and then fail every login at signing time.

The app already does this correctly and says why: `middleware.ts` refuses to
serve protected routes without the secret rather than defaulting. The API should
match it. Related: `SERVICE_ACCOUNT` (`config.ts:55`) is exported and imported
nowhere.

### 4.13 The seed could mint a public-password admin, and nothing stopped it running in production

- [x] Fixed and verified

`prisma/seeder/user.seeder.ts:59-60` creates `admin@example.com` with
`systemRole: "admin"` and the password `Adminjun1234567890!`, committed in the
repository. Five other accounts follow the same pattern (`mayor@`, `host@`,
`servicefoxer@`, and the `*@foxers.ph` batch).

**There is no environment guard.** `prisma/seed.ts` reads `DATABASE_URL` and
runs; the only `process.exit(1)` in it is an error handler, not a check. So
`pnpm prisma db seed` pointed at a production connection string creates a
working admin login whose password is public. `DOCKER_SETUP.md` lists the seed
as a routine step, which makes the mistake an easy one to make.

Two things limit the blast radius, and neither is a fix:

- The upsert's `update` branch does **not** write `password`, so re-seeding a
  database that already has these accounts will not reset anyone's password. The
  risk is a fresh or partially-populated database, where `create` runs.
- The hashes are PBKDF2 (`1000` iterations, sha512) — the legacy format
  `utils/password.ts` treats as read-only and transparently re-hashes to bcrypt
  on first login. Seeded users therefore start on the weaker algorithm. 1000
  iterations is far below anything current; it is acceptable only because these
  are meant to be throwaway dev accounts, which is exactly the assumption the
  missing guard breaks.

**Fixed 27 Aug** — `assertSafeToSeed()` in `prisma/seed.ts` refuses to run
unless *both* hold:

- `NODE_ENV` is `development` or `test`, **and**
- `DATABASE_URL` points at a local host (`localhost`, `127.0.0.1`, `::1`, or the
  docker service names `postgres` / `local_postgres`)

`ALLOW_SEED=1` overrides, deliberately and per-invocation, with a warning. The
host check matters more than the `NODE_ENV` one: the realistic accident is not
someone setting `NODE_ENV=production` and seeding anyway, it is a developer with
`NODE_ENV` unset whose `DATABASE_URL` points at staging.

Both refusals verified by running the seed with each condition violated.

> **The passwords stay in the file, deliberately.** A first pass also made all
> eleven env-overridable (`SEED_ADMIN_PASSWORD` and friends). That was reverted:
> once the seed cannot reach a non-local database, these are ordinary dev
> fixtures, and fixtures belong in the fixture file. Eleven environment
> variables nobody will set is machinery that obscures the data without adding
> protection the guard does not already provide.
>
> Still true and still worth knowing: the hashes are PBKDF2 at 1000 iterations,
> the legacy format `utils/password.ts` re-hashes to bcrypt on first login. That
> is acceptable only for throwaway local accounts — which the guard is now what
> guarantees.

### 4.14 The QueryClient had no defaults, so 15 queries refetched on every focus

- [x] Fixed

Reported as "events are fetching every time" — a burst of `/admin/*/pending` and
`/events` requests on the admin page. The cause was not on the admin page.

`shared/providers/QueryProvider.tsx` constructed `new QueryClient()` bare, so
React Query's own defaults applied app-wide: **`staleTime: 0`** and
**`refetchOnWindowFocus: true`**. Every query was stale the instant it resolved,
so any query without its own `staleTime` refetched on every mount *and* every
time the window regained focus — clicking into devtools, alt-tabbing, clicking
back into the page.

**15 of 36 `useQuery` call sites** relied on that default, including all three
admin approval queues (`useAdminPendingVenues` / `Assets` / `Services`). On
`/admin` that landed on top of the deliberate 5s `/events` poll in
`useAdminData`, producing the interleaved `pending pending pending events`
pattern.

This is §2.3 repeating. That entry records raising `staleTime` *inside*
`useAdminData` for exactly this reason — but the global those hooks were all
working around was never set, so each new hook started broken again and had to
be fixed by hand. Twenty-one had been; fifteen had not.

**Fix.** `staleTime: 30_000` and `refetchOnWindowFocus: false` as client
defaults. Deliberate behaviour still wins: `refetchInterval` is untouched, and
the seven hooks that explicitly set `refetchOnWindowFocus: true` keep it.
`retry` was left at the React Query default — unrelated to this bug, and
changing it would alter failure behaviour everywhere for no reason.

Checked and **not** the cause: `AdminContent` and `MobileAdminView` both mount
the same three pending hooks, but they share query keys, so React Query dedupes
them into one request. (It is still two components rendering one screen — §3.4e.)

> `src/__tests__/data/queryDefaults.test.ts` pins the defaults. Confirmed to
> fail against the pre-fix file and pass after, rather than assumed to.
>
> These are source assertions and therefore weak — they would survive a
> behaviour-preserving rewrite. Noted because the first version of that test
> **failed against correct code**: it scanned for `new QueryClient()` and
> `staleTime: 0`, and matched the comment explaining the fix. It now strips
> comments first. A source-scanning test can be wrong in both directions.

### 4.15 `GET /users/:id` published the password hash, unauthenticated

- [x] Fixed

Four hops, nothing guarding any of them:

| Layer | Before |
|---|---|
| `users.routes.ts:16` | `router.get("/:id", UsersCtrl.getUserById)` — **no `authenticate`** |
| `users.controller.ts:88` | `res.json(user)`, verbatim |
| `users.service.ts:38` | passed through unchanged |
| `users.repository.ts:319` | `prisma.user.findUnique({ where: { id } })` — **no `select`, no `omit`** |

A bare `findUnique` returns every scalar, and `User.password` is a required
field (`schema.prisma:12`). There was no global `omit` in `prisma.config.js`, in
the schema, or on the `PrismaClient` — checked all three. So an anonymous
request with a user id returned the password hash along with `email`, `phone`,
`address`, `city`, `state`, `stripeCustomerId` and `stripeAccountId`.

Hashes are bcrypt cost 12 for anyone who has logged in since the re-hash landed,
but seeded and never-logged-in accounts are still PBKDF2 at 1000 iterations.

**Fix, in two layers.**

1. **Default-deny at the client.** `utils/prisma.ts` now sets
   `omit: { user: { password: true } }`, so no query returns the hash unless it
   asks. Exactly three call sites need it — login, change password, delete
   account — and they opt in explicitly. A new query can no longer leak the hash
   by forgetting a `select`; only by deliberately asking, which is reviewable.
2. **An allow-list at the endpoint.** `findUserById` selects twelve public
   fields rather than the row. The omit stops the hash; it does not stop phone,
   address and Stripe ids, and a profile lookup has no business publishing those.

The route is authenticated now too. It has no caller in the app — the client
uses `/users/foxers/:id` for public profiles — so locking it down breaks nothing.

### 4.16 `GET /bookings` was public, and its filters came from the query string

- [x] Fixed

`booking.routes.ts:46` had no `authenticate`, and `BookingRepo.findAll` includes
`user: { select: { name: true, email: true } }` — so it enumerated every
customer's name and email address, twenty per page.

Worse, `filters` was `req.query` spread straight into a `Prisma.BookingWhereInput`.
Express parses bracket syntax into nested objects by default, so
`?user[email][contains]=@gmail.com` was a Prisma operator the caller controlled.

**Fix.** The route requires a session. The service allow-lists the filters it
accepts (`status`, `eventId`, `userId`, `ticketCode`, `checkedIn`, `hostId`) and
coerces them, and scopes the result to what the caller is party to: admins see
everything, anyone else sees bookings they made or bookings on events they
organise. The scope is `AND`-ed over the requested filters so a filter cannot
widen it.

Noticed while mapping the filters: **`hostId` is not a column on `Booking`** —
the host is the event's organiser. `useCalendarBookings.ts:132` has been sending
`params: { hostId: user.id }`, which reached Prisma as an unknown field. It is
mapped to `event: { organizerId }` now.

> `tests/public-exposure.spec.ts` parses the route files and asserts the
> middleware chain, plus the client-level omit and the `findUserById` field
> list. All five confirmed to fail against the pre-fix code and pass after.
>
> **Not verified at runtime.** Postgres (`localhost:5433`) and Redis were both
> down while this was written, so unlike §4.10 and §4.9 there is no live
> request/response evidence here — only the code path and the tests.

### 4.17 Correction: my own route audit missed every GET

- [x] Recorded

§4.11 reported "all 122 mutating routes carry `authenticate`". That was true and
also beside the point: the sweep only looked at POST/PUT/PATCH/DELETE, so it
never examined a single GET — and both §4.15 and §4.16 are GETs.

There are **35 unauthenticated GET routes**. Most are legitimately public
marketplace browse (venues, assets, services, categories, search, locations,
badges, leaderboard) and `event-request GET /` is `listApproved`, deliberately
public for the landing page. Two were not.

Worth remembering when a sweep reports clean: the finding is only as broad as
the filter that produced it.

### 4.18 Correction: `DOCKER_SETUP.md` was not sound, and the compose file was missing half the stack

- [x] Both rewritten and verified

The doc audit graded `DOCKER_SETUP.md` **"Sound — the one genuinely usable
onboarding document in the tree."** That was wrong, and wrong in the same shape
as §4.17: the check confirmed every *file, script and port* it named existed,
and never opened `docker-compose.yml` to see whether the *services* it was built
around existed.

They did not. Compose defined `postgres`, `pgadmin` and `redis` — **there was no
`api` service** — while the doc was written around one:

| Doc claimed | Reality |
|---|---|
| `docker-compose build` builds the API image | nothing to build |
| `docker-compose exec api …` (seven times) | no such service |
| API on `localhost:6002` after `up -d` | not started by compose |
| `fox_postgres` / `fox_redis` / `fox_api` | `local_postgres` / `local_redis` / `local_pgadmin` |
| Postgres `5432`, Redis `6379` | **5433**, **6378** |
| user `postgres`, db `fox_passport_db` | user `admin`, db `foxpassportrepublic` |
| Redis password `redis_password` | no `requirepass` at all |
| `Up (healthy)`, "healthcheck every 10s" | **no healthchecks defined** |
| — | pgAdmin on 5050, undocumented |

**Compose rewritten**, following the pattern in `mapanytime-api` — which does
this better and was worth copying:

- Every credential and port is `${VAR:-default}` rather than hardcoded. The
  defaults are the values this project already used, so an existing `.env` and
  an existing `pgdata` volume keep working untouched.
- The `api` service exists, and overrides `DATABASE_URL` and `REDIS_HOST` to the
  compose **service names**. mapanytime carries a comment explaining exactly
  why; inside a container `localhost` is that container, which is the single
  most common way a working local setup breaks once containerised.
- It sits behind a `--profile app` so a bare `up -d` still starts services only
  and does not fight `pnpm dev` for port 6002.
- Real healthchecks (`pg_isready`, `redis-cli ping`), which the doc had been
  claiming for months. `api` waits on both via `condition: service_healthy`.

One thing **not** copied: mapanytime has no healthchecks either. The doc's claim
was the reason to add them rather than delete the claim.

> Verified by running the rewritten doc's own checklist end to end: `compose ps`
> shows both services `(healthy)`, `pg_isready` accepts connections, `redis-cli
> ping` returns PONG, `migrate status` is up to date, `/api/health` returns 200
> with Redis connected, and the suite is 68/68. The 147 seeded users survived
> the container recreate — the named volumes were deliberately left unchanged.

**Two audit lessons now recorded twice** (§4.17, and here): a sweep is only as
broad as the filter that produced it, and "every file it names exists" is not
the same as "everything it describes exists".

---

## 5. What is verified, and how

Everything in section 2 passes, on the working tree:

```
npx tsc --noEmit      # app + api
npm run lint          # app: 0 errors, 0 warnings
npm run build         # app
npx vitest run        # app 35/35 (8 files), api 50/50 (6 files)
```

The eight new tests in `src/__tests__/data/dashboardFetchers.test.ts` mock
`fetch` and assert **request counts** — one for each single-resource fetcher,
exactly four for the aggregate — because that is the property that regresses
silently. The page-level guards in the same file are weaker source assertions:
they check `page.tsx` still fetches conditionally and still uses `Promise.all`,
so they would survive a behaviour-preserving rewrite and miss a regression
phrased differently. Async server components with JSX are awkward to render in
vitest; worth knowing before leaning on them.
