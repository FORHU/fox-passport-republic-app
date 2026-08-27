# Session Report — 26 August 2026

Scope: `fox-passport-republic-app` + `fox-passport-republic-api`
Branches: `perf/dedupe-dashboard-fetching` (app) · `fix/stripe-connect-onboarding-urls` (api)

19 commits authored this session across both repos. Both branches merged up to
`main` and `staging`. Ongoing tracker: [`api-audit.md`](./api-audit.md).

---

## 1. Security

### Sessions could not be revoked

`POST /auth/logout` returned `200` and did nothing — its own comment said
"Optionally, you can blacklist the token here if using Redis" — and **no
`refreshToken` field existed in `schema.prisma`**, so there was nothing to
revoke. A refresh token that leaked was valid for its full lifetime with no way
to stop it. The frontend never called the endpoint at all, so fixing the API
alone would have been dead code.

Added a `RefreshToken` model storing **only the jti** (enough to revoke, useless
to anyone who reads the table), issue/verify/revoke services, and wired
`clearAuthCookies` to call logout with the httpOnly cookie before deleting it.

Verified live: login `200` → refresh `200` → logout `200` → refresh **`401`**.

### Both tokens were in `localStorage`

The server deliberately stored `fox_token` and `fox_refresh_token` `httpOnly`,
and `auth-actions.ts` explains why. The client wrote both to `localStorage`
anyway, so the protection bought nothing — and the two stores **drifted**: a
client-side refresh updated `localStorage` but could not touch the cookie, while
the server's own refresh is discarded because a Server Component may not write
cookies. Every SSR load after a client refresh burned a refresh that could never
persist.

The API accepts only `Authorization: Bearer`, so the client could not simply stop
holding the token. Added `/api/proxy/[...path]` — a route handler that reads the
cookie and adds the header server-side, and (unlike a Server Component) *can*
persist a refreshed token. Tokens are now unreachable from JavaScript, the
401-stampede is structurally impossible, and client calls are same-origin so they
no longer generate CORS preflights.

### One email, one session

Login now revokes every existing session before issuing. Verified: device B
logging in ends device A.

**Caveat:** an access token already issued to the displaced session stays valid
until it expires — stateless JWT, `ACCESS_TOKEN_EXPIRY=15m` — but cannot renew.

### Tokens survived in `localStorage` after the proxy work

The proxy moved tokens to httpOnly cookies, but `AuthStoreProvider` was still
reading `fox_token` and `fox_refresh_token` from `localStorage` and pushing them
**back into cookies on every mount** — migration code from the old model. So the
claim "tokens are out of localStorage" was wrong, and **every user who had signed
in before the change still had both tokens in their browser** with nothing to
clear them. Those keys are now purged on mount.

Caught only because the verification grep used BRE alternation without `-E`,
matched nothing, and read as a pass. Re-running with `-E` found it at once.

**Still open:** login receives the token response in client JavaScript for one
tick before handing it to a server action. Never stored, but present in memory —
closing it means moving login behind a route handler.

### Password reset and change did not end sessions

A reset is the action that follows "someone else is in my account"; leaving the
intruder's token alive defeated the point. Both now revoke.

**Caveat:** `changePassword` revokes the caller's own session too — only `userId`
is available there, not their `jti` — so the user must sign in again.

---

## 2. Bugs

| Bug | Cause |
|---|---|
| Infinite `GET /venues` loop | `useVenueBuilder` returns an unmemoised object literal; listing it in the prefill effect's deps meant the effect's own `setX()` calls re-triggered it, unbounded |
| SSR auth broken three ways | `getUser` fell back to the stale `fox_user` cookie so a dead session passed `requireAdmin`; `serverFetch`'s `redirect()` was swallowed by 27 `catch` blocks; it targeted `/login`, which is not a route |
| Admin issued ~10 requests / 5s | `AdminContent` mounts 8 polling hooks but renders one tab |
| Host dashboard polled locked sections | A venue-only Foxer fetched events, assets and services to render them as empty locked sections |
| Landing page fetched then discarded `/venues` | On the default view — the most visited route |
| Mobile admin was a **static mockup** | No props: hardcoded KPIs, three invented approvals, a hamburger with no `onClick`, dead approve/reject buttons — while the real dashboard sat behind `hidden lg:flex` |
| Refresh TTL hardcoded to 30d | Silently overrode `REFRESH_TOKEN_EXPIRY=7d` |
| Cookie lifetimes ≠ token lifetimes | Access cookie lived 7 days for a 15-minute JWT; refresh cookie 30 days for a 7-day JWT |
| Stripe Connect onboarding could not complete | `STRIPE_CONNECT_RETURN_URL` / `_REFRESH_URL` read with a bare `as string` cast and unset, so `undefined` reached `accountLinks.create`. The documented sample pointed at `/dashboard/payouts/*`, which does not exist |
| Login masked server errors as `401` | Any throw became "Invalid credentials" — a missing table presented as a wrong password |

---

## 3. Performance

- `getHostDashboard` is an aggregate; single-resource pages called it and used one
  of four results. Added narrow fetchers and composed the aggregate from them —
  `/creator-dashboard/assets` went **6 requests → 2**.
- `getUser` wrapped in React `cache` — the profile resolved several times per request.
- Landing page and categories page: sequential fetches made parallel, wasted fetch removed.
- Admin and host dashboards: every query gated on the thing that decides whether
  it renders (active tab / role access).
- `staleTime` raised to match poll intervals — server-rendered `initialData` was
  stale before the client mounted.
- `placeholderData: keepPreviousData` on paginated queries, which flashed empty.

---

## 4. Housekeeping

- **Supabase removed from both repos** — dead in each. The API's copy would have
  crashed on boot if anything had imported it.
- **`.gitattributes` added.** `npm run format` rewrote 199 files where only 38 had
  real changes; the rest was line-ending churn (prettier writes LF,
  `core.autocrlf=true`, no attributes file).
- **Deabstraction:** deleted a duplicate `useVenuesByCategory` and 5 barrels with
  zero importers. Kept the 7 barrels that are actually used. The first attempt at
  the duplicate left a re-export shim — indirection with extra steps — which was
  removed after you pushed back; one of the dead barrels was one I had added
  exports to earlier.
- **Login no longer masks server errors as `401`.** Only a genuine credential
  mismatch returns 401; anything else is a 500. A missing table had presented as
  "Invalid credentials".
- **Mobile reject collects a real reason** inline instead of sending a canned
  string.
- Mapbox geocoding aborts in-flight requests; landing search extracted to
  `features/landing/api` + a hook.
- Merged `main` and `staging` into both repos — 4 conflicts, each resolved on
  merits and recorded in `api-audit.md` §4.4.
- Money-precision migration (`Double → Decimal(12,2)`) committed; it was applied
  to the database but untracked in git.

---

## 5. Corrections I owe

**I broke the `NavMobileMenu` feature.** Resolving the `Navbar` merge conflict I
took upstream's side, which had dropped the hamburger in favour of
`MobileBottomNav`, and read the redesigned menu as dead code rather than half of
a feature mid-assembly. They are complementary. Reconnected.

**I added abstraction while claiming to remove it.** Deduplicating
`useVenuesByCategory`, I left a re-export shim — indirection with extra steps —
and had earlier added exports to a barrel nothing imported. Both deleted after
you pushed back.

**I logged you out.** Testing single-session enforcement via curl revoked the
browser session you had open.

**I overstated one claim twice.** An external audit said the 401 refresh stampede
caused logouts; I verified it could not (no token rotation, rate limit 1000/15min
and disabled in dev). Recorded in `api-audit.md` §1 so it stops coming back.

---

## 6. Open

**Decisions (3):** poll cadence per dashboard · whether `MobileAdminView` earns
its keep as a second admin UI · whether single-session logging users out across
their own devices is the intended trade.

**Tasks (2):** a test asserting queries are gated on whatever decides rendering ·
folding the admin-responsive correction into `responsive-plan.md` §2.3.

**Verification gap (1) — the one that matters.** Login through the proxy is
confirmed in a browser. **Not** exercised: mobile admin (drawer, approve/reject),
the venue mobile booking bars, the reconnected `NavMobileMenu`, password
change/reset revocation, and the proxy's multipart and 401-refresh-replay paths.
Types, lint, build and unit tests all pass, but those cover request counts and
class names — they would pass just as happily if the proxy returned garbage.

---

## 7. Commits

**App** — `perf/dedupe-dashboard-fetching`

```
perf: stop the dashboard over-fetching on every page
perf: fetch only what each page renders, and stop the waterfalls
refactor: route the location search through the shared axios client
perf(data): fetch only what each page renders, and fix SSR auth
feat(auth): keep tokens out of localStorage behind a Next proxy
perf(dashboards): only poll what is actually on screen
feat(admin): make the mobile admin real instead of a mockup
fix(responsive): scale KPI and chart density instead of starting at desktop size
refactor(landing): move the location search out of the component
fix(search): abort in-flight Mapbox geocoding requests
fix(venue): stop the infinite GET /venues loop in the edit prefill
feat(nav): restore the mobile menu and reconnect its trigger
feat(venue): mobile booking experience on the venue detail page
docs: add the API, data-fetching and auth audit
docs: record the flags that were only ever said out loud
```

**API** — `fix/stripe-connect-onboarding-urls`

```
fix: default Stripe Connect onboarding URLs off FRONTEND_URL
chore: remove dead Supabase integration
feat(auth): make sessions revocable and enforce one per account
chore(db): track the money-precision migration
```

**Verified at close:** app `tsc` / `eslint` / `build` clean, 35/35 tests ·
api `tsc` clean, 50/50 tests.
