# 🔐 FoxPassport — Authentication Hardening Flags

> Last Updated: 2026-09-07
> Scope: `fox-passport-republic-api` + `fox-passport-republic-app`
> Legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low · ✅ Resolved

Companion to [`ARCHITECTURE.md`](./ARCHITECTURE.md), which describes auth **as
built**. This file tracks what is still open, written from the code rather than
from intent.

**Architectural direction, unchanged:** stateless short-lived access tokens plus
stateful, strongly-managed refresh sessions. The browser owns the cookie, the app
owns the session, the API owns authority.

---

## ✅ Already built — do not re-plan these

A hardening review proposed several items that foxpassport already has. Recorded
here so they are not re-opened.

| Capability | Where |
|---|---|
| Refresh token stored as **jti only**, never the token itself | `api/src/modules/auth/refresh-token.service.ts` |
| Single-use rotation with `replacedByJti` chain | `rotateRefreshToken()` |
| **Atomic** claim — `updateMany where revokedAt: null`, so only one of N concurrent callers wins | `rotateRefreshToken()` |
| **Reuse detection** — a token rotated more than 60s ago revokes every session for the account | `RefreshTokenReuseError` |
| 60-second grace window separating a parallel-request race from theft | `ROTATION_GRACE_MS` |
| One active session per account — login revokes all live tokens | `api/src/modules/auth/auth.service.ts:197` |
| Session revocation on password change, password reset, and admin role assignment | `profile.service.ts:85`, `auth.service.ts:369`, `role-assignment.service.ts:146,203` |
| httpOnly `fox_token` / `fox_refresh_token`, never readable by page JS | `app/src/shared/lib/server/auth-actions.ts` |
| Server-side proxy attaching `Authorization: Bearer`, with 401 → refresh → replay and in-flight dedupe | `app/src/app/api/proxy/[...path]/route.ts` |
| Google sign-in lands in the same session system (exchange code → same cookies) | `auth.controller.ts` `googleCallback` / `googleExchange` |

---

## 🚩 Open flags

| # | Severity | Flag | Repo |
|---|---|---|---|
| AUTH-01 | ✅ | ~~**No rate limit on `/auth/login`**~~ — resolved 2026-09-07. Per-route limiters on every credential endpoint, on two axes, enabled in development. | api |
| AUTH-02 | ✅ | ~~**Login bypasses the proxy**~~ — resolved 2026-09-07. Sign-in and the rest of the pre-session surface share the proxy client; nothing browser-side talks to the API directly for an authenticated concern. | app |
| AUTH-03 | ✅ | ~~**Cookie policy lives in the app, not the API**~~ — resolved 2026-09-07. The API emits `Set-Cookie` and the proxy relays it; the app composes none. | both |
| AUTH-04 | ✅ | ~~**`SESSION_MAX_AGE` written out three times**~~ — resolved 2026-09-07, dissolved into AUTH-03. Lifetime derives from `refreshTokenTtlMs()` in the API's config. | app |
| AUTH-05 | ✅ | ~~**Google sign-in does not revoke existing sessions**~~ — resolved 2026-09-08. The callback revokes before it issues, so every entry path now ends the previous session. | api |
| AUTH-06 | ✅ | ~~**OTP generation and logging**~~ — resolved 2026-09-08. Codes come from `crypto.randomInt` across the full six-digit space, and the plaintext code reaches a log in development only. | api |

---

### AUTH-01 ✅ · No rate limit on the login endpoint — resolved 2026-09-07

**Resolved by** `api/src/middleware/rate-limit.middleware.ts`, applied per route
in `api/src/modules/auth/auth.routes.ts`, with `tests/auth.rate-limit.spec.ts`.

Two axes, because either alone is trivially sidestepped: **per IP** catches
credential stuffing (one password against thousands of accounts, which an
account-keyed limit never sees), **per account** catches a distributed brute
force against one inbox (which an IP-keyed limit never sees). Separating them is
also what stops one attacker behind an office or carrier NAT from locking out
everyone else there.

Counting differs by what the abuse is. Sign-in, refresh, and code-checking count
**failures only** — a successful sign-in is not evidence of an attack, and
counting it would punish anyone who signs in and out often. The mail-sending
endpoints count **every** request, because there the successful one is the abuse:
each puts a message in someone's inbox and needs no valid credential.

Covered: `/login`, `/register`, `/refresh-token`, `/forgot-password`,
`/reset-password`, `/resend-verification-otp`, and — beyond the original list —
`/verify-email`, which is the same risk class as `/reset-password`.

**Correction to the reasoning, not the change.** The `/verify-email` limit was
added on the argument that a six-digit code is a 900,000-space walkable by a
script. That argument was wrong: `verifyOTP` reads with Redis `getDel`, which is
atomic get-and-delete, so a code survives exactly **one** verification attempt
whether or not it was correct. Guessing was never the exposure. The limit is
still right, for a different reason — because that same `getDel` means anyone who
submits one wrong code for someone else's address **burns that person's OTP**, and
they must request another. Rate limiting is what stops that being done at volume.

Enabled in development. The global limiter in `app.ts` is unchanged and remains
as a second layer.

<details>
<summary>Original flag</summary>

**Now.** [`api/src/app.ts:66`](../../fox-passport-republic-api/src/app.ts) registers a
single app-wide limiter — `windowMs: 15 * 60 * 1000`, `max: 1000` — and applies it
only when `!isDev`. No auth route has a limit of its own.

That budget is sized for ordinary browsing, not for credential attacks. A single
IP can spend it entirely on `/auth/login`.

This is the only flag here that closes an attack available today. Family
revocation defends against a copied refresh token; this defends against the
attack that is cheap to run right now.

**Do.** Add a strict per-route limiter — a small attempt budget over a long
window, keyed on IP *and* submitted email so one attacker cannot lock out a whole
NAT, applied to `/auth/login`, `/auth/register`, `/auth/refresh-token`,
`/auth/forgot-password`, `/auth/reset-password`, and
`/auth/resend-verification-otp`. Keep it enabled in development, or it is only
ever exercised in production.

**Done when.**

- Login brute-force attempts are throttled.
- Password reset and OTP resend abuse are throttled.
- Refresh endpoint abuse is throttled.
- The existing global limiter is unchanged and remains as a second layer.
- Auth rate limiting stays **enabled in development**.
- Tests assert the `429`, so the limit is proven rather than assumed.

</details>

---

### AUTH-02 ✅ · Login bypasses the proxy — resolved 2026-09-07

**Now.** [`app/src/features/auth/hooks/useAuth.ts:15-21`](../src/features/auth/hooks/useAuth.ts)
creates its own axios instance on `config.apiUrl` with `withCredentials: true`.
Every other client call goes through `/api/proxy/*`; login does not.

**Do.** Point those calls at the shared `@/shared/lib/axios` instance
(baseURL `/api/proxy`) and drop `withCredentials` — it becomes same-origin. The
401 interceptor already excludes `/auth/login`, so a failed login will not trigger
a session-end redirect.

**Precondition for AUTH-03.** While login is a direct browser→API request, a
cookie set by the API on that response has to cross origins, which is where
production domain layout starts to matter. Routed through the proxy, it does not.

**Done when.** No client module imports `config.apiUrl` for an authenticated
concern; sign-in works end to end.

---

### AUTH-03 ✅ · Move cookie authorship to the API — resolved 2026-09-07

**Now.** The API never touches cookies — no `cookie-parser`, tokens returned in
JSON, `authenticate` reads `Authorization: Bearer` only. The app composes all
three cookies in
[`auth-actions.ts`](../src/shared/lib/server/auth-actions.ts).

**Direction.** The API becomes the single definition of cookie policy — names,
flags, lifetime, and the JWT inside — and emits `Set-Cookie` on login, refresh,
google-exchange, and logout. The Next proxy **relays** those headers, so the
browser files the cookies under the app's own origin.

**All three cookies, not two.** `fox_user` moves with the other two. It is easy to
scope this work to `fox_token` and `fox_refresh_token` and forget that
`setAuthCookies` writes a third, and that `refreshUserSession` rewrites it on
every refresh. Delete app-side authorship while the API emits only the token pair
and `fox_user` silently stops being set — which breaks the server-side fallback in
[`server/auth.ts:30`](../src/shared/lib/server/auth.ts), where `getUser` parses it
so a backend blip does not sign everyone out, and the client hydration fallback in
`initialize()`. It carries no token; it moves because the app should be writing no
cookies at all, not because it is sensitive.

Two conditions make the relay work, and both are the actual work:

1. **The API must not set a `Domain=` attribute.** Host-only cookies bind to
   whatever host relayed them. A `Domain=` that names the API's host is rejected
   when relayed from the app's origin. This is the assumption the whole design
   rests on — put a test on it.
2. **Every auth call must go through the proxy** — see AUTH-02.

**Load-bearing defect to fix first.** [`route.ts:145-149`](../src/app/api/proxy/[...path]/route.ts)
copies upstream headers with `headers.forEach`, which folds multiple `Set-Cookie`
values into one comma-joined string. A login response setting three cookies would
arrive malformed. Use `upstream.headers.getSetCookie()` and append each
individually. Latent today only because the API sets no cookies.

**Then.** `setAuthCookies` is deleted; `clearAuthCookies` and `refreshUserSession`
become calls through the proxy; `completeGoogleAuth` becomes a Route Handler
(a server action cannot relay `Set-Cookie`).

**Not required.** The API still does not need to *read* cookies. The only leg
carrying one is browser↔Next. `authenticate` stays Bearer-only.

**Ship order.** API first — it only adds headers, JSON bodies unchanged, nothing
consumes them yet. Live sessions survive because names and format do not change.

---

### AUTH-04 ✅ · Cookie lifetime is hand-copied — resolved 2026-09-07

**Now.** `SESSION_MAX_AGE = 7 * 24 * 60 * 60` appears in
[`auth-actions.ts:23`](../src/shared/lib/server/auth-actions.ts) and
[`route.ts:41`](../src/app/api/proxy/[...path]/route.ts), each commented "must
match `REFRESH_TOKEN_EXPIRY`" — which lives in the API's environment. The app is
guessing at a lifetime it does not own.

It has been wrong before: the access cookie once lived seven days while its JWT
expired in fifteen minutes, leaving the browser holding a credential the server
had stopped honouring.

**Do.** Resolved by AUTH-03 — once the API sets the cookies, it derives `maxAge`
from `REFRESH_TOKEN_EXPIRY` and the app's copies are deleted. If AUTH-03 is
deferred, have the API expose the lifetime and the app read it rather than
restate it.

---

### AUTH-05 ✅ · Google sign-in does not revoke existing sessions — resolved 2026-09-08

**Now.** `revokeAllForUser` is called on password login, password reset, password
change, and admin role assignment. It is **not** called on the Google path — see
`google-auth.service.ts`, which signs an access token and issues a refresh token
without revoking what came before.

So one-session-per-account holds for every entry path except this one: signing in
with Google leaves an existing session alive alongside the new one.

**Done, 2026-09-08.** `revokeAllForUser(user.id)` now runs in the callback
between signing the access token and issuing the refresh token, matching the
password path. Four tests in `google-oauth.identity.spec.ts` cover it, one of
them on ordering: revocation has to land *before* the new token is issued or the
session revokes itself.

**Still to confirm in a browser.** Signing in with Google from a second device
should end the first device's session. Unit tests cannot vindicate that.

---

### AUTH-06 ✅ · OTP generation and logging — resolved 2026-09-08

Found while doing AUTH-01. Two separate problems in the same area; the second is
the one that actually leaks something today.

**The code is written to the log in plaintext when mail fails.**
`auth.service.ts` lines 81, 334 and 405 sit in `catch` blocks around the mail
send:

```ts
console.log(`[DEV] Verification OTP for ${user.email}: ${otp}`);
```

The `[DEV]` prefix is a label, not a guard — `auth.service.ts` contains no
`isDev` check. So if the mailer is down or throttled in production, every
verification and password-reset code lands in the logs next to the address it
belongs to, and logs are routinely shipped to places with a wider audience than
the database. A password-reset code in a log is an account takeover for whoever
can read it.

Fix: guard on `isDev`, or drop the value and log only that a send failed for a
user id. Do not log the code and the address together in any environment.

**Codes come from `Math.random()`.** `generateOTP` is
`Math.floor(100000 + Math.random() * 900000)` — not a cryptographic source, and
predictable to anyone who can observe enough output. `crypto` is *already
imported* at the top of `otp.utils.ts`, with an eslint-disable for being unused,
so someone intended this.

Fix: `crypto.randomInt(0, 1_000_000)` with `padStart(6, "0")`. That also widens
the space slightly — the current expression can never produce a code below
`100000`, so the leading digit is never zero and `padStart` is dead code.

Rate limiting bounds how fast codes can be tried. Neither of these is about
speed: one is about what ends up in a log, the other about whether the code is
guessable at all.

**Already correct, leave alone:** codes expire (5-minute Redis TTL), are
single-use and atomically consumed (`getDel`), and account identifiers are
normalised.

**Done, 2026-09-08.** `generateOTP` is
`crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")` and the
eslint-disable on the `crypto` import is gone. The three `console.log` sites in
`auth.service.ts` are behind `isDev`; the `console.error` beside each is
untouched, so production still records that a send failed without recording what
it was sending. `tests/auth.otp.spec.ts` covers both halves — four of its seven
tests fail against the old code, including one that drives `forgotPassword`
through a failing mailer with `isDev` false and asserts neither the code nor the
address reaches the log.

---

### Notes from doing AUTH-02 and AUTH-03

Three things the plan did not anticipate, worth keeping.

**Routing sign-in through the proxy exposed it to machinery built for
authenticated traffic.** The proxy refreshes and replays on any 401, so a wrong
password would have spent a single-use refresh token and resubmitted the failed
sign-in — two attempts against AUTH-01's per-account limit for one click. The
axios interceptor would separately have read that 401 as a dead session and
redirected out of the login modal. Both now consult one list of pre-session
endpoints; `/auth/logout` and `/auth/socket-ticket` are deliberately absent,
being authenticated.

**The relay had two defects, not one.** `getSetCookie()` was the known fix. The
second: the proxy's own 401-refresh path *composed its own cookies*, with its own
copy of `SESSION_MAX_AGE`. That refresh is an internal fetch, so the API's
`Set-Cookie` landed on the Next server and never reached the browser; those
headers are captured and forwarded now.

**An explicit refresh cannot carry its token.** "Sync my account" needs a refresh,
but the token is httpOnly — which is the point. The proxy holds it and fills the
body in for `/auth/refresh-token`, so the browser can ask for a refresh without
ever seeing the credential that performs it.

**One departure from the plan.** §7 said to move logout to the same pattern.
`clearAuthCookies` stayed a Server Action instead: it is the only operation that
needs no relay, since it runs where the refresh token is readable and can delete
the cookies directly. Routing it through the proxy would force the API to read
cookies to find the token to revoke — the dependency this design avoids.

---

## ⛔ Considered and rejected

Recorded with reasoning so they are not re-proposed.

**Hashing the refresh token (`tokenHash` column).** Sound advice for a design that
stores the raw token — which is where the recommendation comes from. Foxpassport
stores *nothing* but the jti, which is strictly stronger. The refresh token is a
JWT signed with `REFRESH_TOKEN_SECRET`, so authenticity is established by the
signature before the database is touched; a hash would re-prove it. It would help
only if the signing secret leaked while the database stayed intact — and in that
scenario the attacker can mint access tokens directly with the same class of
secret, so the refresh path is not the weak link. Revisit only if refresh tokens
become opaque random strings.

**Refresh-token families (`familyId`) and family revocation.** Foxpassport enforces
one active session per account, so there is only ever one live chain per user —
`familyId` plus family revocation would produce exactly what `revokeAllForUser`
already produces on reuse. Deliberate decision (2026-09-07) to keep one session
per account. Families become necessary the day multi-device sessions are allowed,
because "revoke everything" is then too blunt; until that policy changes, this is
a column and a code path with no behavioural difference.

**"My sessions" management UI and per-device metadata.** Same dependency. With one
session per account there is nothing to list. `userAgent` and `ip` are already
recorded on every refresh row, so the data is there when the policy changes.

**MapAnytime's `activeSessionId` model** (session-bound access tokens, revocable
immediately). Genuinely stronger on revocation — it closes the window below — but
costs a database lookup on every authenticated request. Foxpassport is optimised
for a stateless API; taking that on should be an explicit decision, not an
accidental consequence of copying another codebase.

**Accepted consequence:** logout and session displacement revoke the *refresh*
token, not the access token. A signed-out or displaced session keeps working for
the remainder of its ≤15 minutes and cannot renew. This is inherent to the
stateless model and is the price of the row above.

---

## 🔍 Browser verification — written 8 Sep, **not yet run**

`TOMORROW.md` pointed at "the end-to-end pass written into `AUTH_HARDENING.md`"
for months. There wasn't one — `VERIFY.md` is the socket, emit and page-guard
runbook from earlier work and has no auth section at all. This is that list.

All six items are implemented and 238 api / 132 app tests pass, but AUTH-02,
AUTH-03 and AUTH-05 are the three a unit test cannot vindicate: a cookie relay
only fails in a real browser, and a revocation only shows itself on a second
device.

### Blocked before you start

**AUTH-05 cannot be tested at all right now.** `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET` and `GOOGLE_CALLBACK_URL` are unset in the api's `.env`,
which is why the server prints `⚠️ Google sign-in will fail` at boot. AUTH-05 is
the Google path, so it needs real OAuth credentials before any of it can be
exercised. AUTH-01, 02 and 03 are unaffected.

### Which branches

| Repo | Branch | Carries |
|---|---|---|
| api | `feat/auth-05-google-session-revocation` | AUTH-01, 03, 05, 06 |
| app | `feat/auth-03-api-cookies` | AUTH-02, 03 |

The app's docs branch carries no auth code — testing from it exercises `main`'s
old auth path and proves nothing. `fix/session-end-consolidation` is *not* in
the app branch above, so logout and session-expiry are still the old path;
merging the two is the `shared/lib/axios.ts` conflict, so test them separately
unless you want to resolve it now.

### V1 · AUTH-03 · The cookie reaches the browser

Log in with a password. In DevTools → Application → Cookies, the session cookies
must be **present on the app's origin**. The Network tab showing `Set-Cookie` on
the API response is not sufficient — that header landing on the Next server and
never reaching the browser is precisely the defect that was fixed, so the
Application tab is the check that means anything.

### V2 · AUTH-03 · Refresh rotates the value, it does not merely persist

Note the refresh cookie's value. Force a refresh (wait out the 15-minute access
token, or use "sync my account"). The value must **change**. A cookie that
survives is not proof of anything; a cookie that rotates proves the relay
carried a new `Set-Cookie` back through the proxy.

### V3 · AUTH-02 · A wrong password costs one attempt, not two

Sign in with a deliberately wrong password. It must count **once** against
AUTH-01's per-account limit. The proxy refreshes and replays on any 401, so
before the pre-session endpoint list this spent a refresh token and resubmitted
the sign-in — two attempts for one click.

### V4 · AUTH-02 · A failed sign-in does not eject you from the modal

Same wrong password. The axios interceptor reads a 401 as a dead session and
redirects; on the login modal that is wrong, and it should stay put.

### V5 · AUTH-05 · A second device ends the first *(needs Google credentials)*

Sign in with Google on device A, then on device B. A's session must end, exactly
as a password login already does. Its access token lingers up to 15 minutes by
design — the accepted consequence recorded above — so check that A cannot
**refresh**, not that it dies instantly.

### V6 · AUTH-06 · No code in the log

Stop the mailer, trigger a password reset with `NODE_ENV=production`. The log
must record that a send failed and must **not** contain the code or the address.
Repeat in development and the code should appear — that affordance is deliberate.

---

## 🗓️ Prioritized action plan

### 🔴 Fix immediately
- [x] **AUTH-01** — Per-route rate limiting on the auth endpoints *(2026-09-07)*

### 🟠 Fix soon
- [x] **AUTH-02** — Route login through `/api/proxy/*` *(2026-09-07)*
- [x] **AUTH-03** — Move cookie authorship to the API *(2026-09-07)*

### 🟡 Fix when convenient
- [x] **AUTH-05** — Revoke prior sessions on Google sign-in *(2026-09-08)*
- [x] **AUTH-04** — Delete the duplicated `SESSION_MAX_AGE` *(2026-09-07)* — it
      dissolved into AUTH-03 rather than being worked separately, which is what
      putting it last was for
- [x] **AUTH-06** — Stop logging OTPs on mail failure; move `generateOTP` to a
      CSPRNG *(2026-09-08)* — done off `main` in the end, since it touched
      nothing the cookie chain touched

### 🔭 Revisit only if the policy changes
- [ ] Multi-device sessions → then families, sessions UI, per-device metadata
- [ ] Opaque refresh tokens → then `tokenHash`
- [ ] Immediate access-token revocation → then a session-bound model, with the per-request lookup accepted openly

**Order:** `AUTH-01 → AUTH-02 → AUTH-03 → AUTH-05 → AUTH-04 → AUTH-06`

AUTH-02 through AUTH-04 are one chain and want that order. AUTH-06 touches
nothing they touch and can be pulled forward if the log exposure is judged more
urgent than its position suggests.

Once those five close, **the authentication architecture is frozen** — no further
change without a product requirement that explicitly demands multi-device sessions
or immediate access-token revocation. The remaining work is hardening and
consistency, not architectural replacement. Anything proposing otherwise should be
checked against "Considered and rejected" above before it is picked up.
