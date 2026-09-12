# Browser verification runbook

**The one thing tests cannot do.** Everything in `TOMORROW.md` §3d and §3e
passes `tsc`, lint and 240 unit tests, and none of it has been seen working. The
failure mode that matters here is silent: a socket that never connects looks
exactly like a socket with nothing to say, and the whole point of the migration
was to demote polling to a 60s fallback. If the live path is broken, every screen
still corrects itself within a minute and nothing anywhere says so.

So the recurring instruction below is **watch the frames, not the screen**. A
table that updates is not evidence; a table that updates *within a second, with a
`data:invalidate` frame in the WebSocket log* is.

Allow an hour. Fill in the results table at the end.

## Setup

```bash
# 1. infrastructure — Postgres and Redis
cd fox-passport-republic-api && docker compose up -d postgres redis

# 2. schema + accounts
pnpm prisma migrate dev
pnpm prisma db seed            # refuses unless NODE_ENV=development|test and DATABASE_URL is local

# 3. the two servers
pnpm dev                       # API on 6002
cd ../fox-passport-republic-app && pnpm dev   # app on 6001
```

**Two independent sessions.** Use a normal window and a private window, or two
browser profiles. Two tabs in the same profile share cookies and will not do.

**Keep DevTools open on both**, Network tab, filter **WS**, click the socket.io
connection, watch the **Messages** pane. That pane is the evidence.

## Accounts

**One password for every account: `Password123!`** — `user.seeder.ts:81` and
`partner.seeder.ts:13` both set `const SEED_PASSWORD = "Password123!"`, and
every account below is hashed from it. Verified against a freshly seeded
database on 8 Sep.

| Account | Is |
|---|---|
| `admin@example.com` | admin |
| `secretary@example.com` | `admin_secretary` |
| `user@example.com` | citizen |
| `host@example.com` | eventFoxer |
| `mayor@example.com` | venueFoxer |
| `gearfoxer@example.com` | gearFoxer |
| `servicefoxer@example.com` | serviceFoxer |
| `multirole@example.com` | eventFoxer + venueFoxer + serviceFoxer, plus gearFoxer once `partner.seeder` runs |
| `partner@example.com` | all four foxer roles + investor |

`multirole` and `partner` were seeded but never listed here.

This table used to carry a different password per account —
`Adminjun1234567890!`, `Usernanaymo@1234567890!` and so on. Those were real:
they worked against the database this file was written against, which had been
seeded before the seeders were changed to one shared constant. They stopped
working the moment that database was re-seeded. If you meet an old database that
still takes them, it predates the change; re-seeding settles it.

`secretary@example.com` is new. The role has existed since the permission model
landed with no way to assign it, so the thing it exists for has never been
checked in a browser.

---

## A. The socket is actually alive

### A1. It connects at all

Sign in as anyone. In the WS Messages pane you should see the handshake and then
a quiet connection.

- **Pass:** a `websocket` connection in state 101, staying open.
- **Fail:** no WS entry, or one that opens and closes on a loop. Check the API
  log for `🔌 Socket connected` — its absence with a successful login is the
  exact bug §3b found, back again.

### A2. The ticket is single-use and refetched

Network tab, filter `socket-ticket`. One `POST /auth/socket-ticket` per
connection attempt, never reused.

- **Pass:** exactly one ticket request per connect.
- **Fail:** a connection retrying without a new ticket request — the `auth`
  callback has been turned back into a captured value, and every reconnection
  after the first will fail.

### A3. Admin queue updates live

Window 1: `mayor@example.com`. Window 2: `admin@example.com` on `/admin`.

Submit a venue as the mayor. Watch window 2.

- **Pass:** a `data:invalidate` frame with `{"topic":"admin:pending"}` arrives,
  and the pending list updates **without a refresh**, in about a second.
- **Fail (the important one):** the row appears after ~60 seconds. That is the
  fallback poll doing the work and the socket doing nothing. It looks like
  success if you are not counting.

### A4. A non-admin never receives `admin:pending`

Window 1: `user@example.com`, anywhere. Window 2: mayor submits another venue.

- **Pass:** window 1's WS pane shows **nothing**.
- **Fail:** any `admin:pending` frame reaches a citizen. That is a room leak, and
  it means `role:admin` is being joined by someone who cannot read the queue.

### A5. Reconnection takes a fresh ticket

With a session open, DevTools → Network → set throttling to **Offline**. Wait
for the socket to drop. Set it back to **No throttling**.

- **Pass:** it reconnects, and a *new* `POST /auth/socket-ticket` fires. Then
  repeat A3 — invalidation still arrives, meaning the room was rejoined.
- **Fail:** reconnects but stays silent afterwards. The socket is up and in no
  room, which no error will tell you about.

### A6. Redis down degrades, it does not break

```bash
docker compose stop redis
```

Sign in fresh.

- **Pass:** no socket (the ticket cannot be minted), the app works normally, and
  screens still correct themselves within 60 seconds. No error toast, no blank
  page.
- **Fail:** anything that stops a person completing a booking.

```bash
docker compose start redis
```

---

## B. The emits added in §3d.3

Each of these was a handler that changed something and told nobody.

### B1. A dispute reaches the admin Disputes tab

Window 1: `user@example.com`, open a completed booking, raise a dispute.
Window 2: `admin@example.com` on `/admin` → Disputes.

- **Pass:** `{"topic":"disputes"}` frame, the row appears with no refresh.
- **Why it matters:** this table previously had **no polling at all** — it
  refreshed on mount and on its own mutation and never otherwise. Before this
  change the admin would not have seen it until they navigated away and back.

### B2. Resolving it reaches the citizen

Resolve the dispute in window 2. Watch window 1's booking.

- **Pass:** `{"topic":"bookings"}` in window 1, the booking's status updates.

### B3. The citizen's own bookings list is live

Window 1: `user@example.com` on `/booking`. Window 2: admin cancels one of their
bookings from the admin Bookings tab.

- **Pass:** the list updates in place.
- **Why it matters:** this screen was `useEffect` + `useState` — outside the
  cache entirely. Every emit reached the dashboards and the admin tab but never
  the person the booking belonged to. If this one fails, the React Query
  conversion did not take.

### B4. Payment confirmation reaches the payer

Take a booking through Stripe checkout to the point the webhook fires (test
card `4242 4242 4242 4242`).

- **Pass:** the booking flips to confirmed on the guest's screen without a
  reload.
- **Note:** this is the one handler with nobody in the room — no `req.user`, and
  a person sitting on a page waiting. If the webhook is not reachable locally
  (`stripe listen --forward-to localhost:6002/api/v1/payments/webhook`), skip it
  and record it as skipped rather than passed.

### B5. Check-in

`host@example.com` scans a ticket for a booking held by `user@example.com`.

- **Pass:** both the host's list and the guest's booking update live.

---

## C. Page guards after the middleware change

`middleware.ts` no longer verifies the token — it only checks the cookie exists.
The real guard moved into each tree's `layout.tsx`.

### C1. Signed out, every protected tree redirects

Signed out, visit each: `/user`, `/creator-dashboard`, `/admin`, `/onboarding`,
`/booking`, `/checkout`, `/mayor`, `/foxer`, `/reviews`.

- **Pass:** each lands on `/` with the login modal.

### C2. A junk cookie does not get further than a redirect

DevTools → Application → Cookies → set `fox_token` to `garbage`. Visit
`/booking`.

- **Pass:** the middleware lets it past (by design — it reads nothing), and
  `requireAuth()` in the layout bounces it to `/` after the `/profile` call
  fails.
- **Fail:** the page renders with content. That would mean a tree lost its guard.

### C3. The frontend holds no secret

```bash
grep -r ACCESS_TOKEN_SECRET fox-passport-republic-app/src fox-passport-republic-app/middleware.ts
```

- **Pass:** no matches. (A test asserts this too, but confirm it once by hand.)

---

## D. `admin_secretary` — the role nobody has ever signed in as

Sign in as `secretary@example.com`.

| Check | Expected |
|---|---|
| `/admin` opens | yes |
| Sidebar shows | Dashboard, Events, Venues, Assets, Services |
| Sidebar hides | Citizens, Bookings, Categories, Disputes, Policies, Settings |
| Approve a pending venue | works |
| `GET /api/v1/users` direct | **403** |
| `GET /api/v1/admin/disputes` direct | **403** |

The last two are the control. The hidden nav items are courtesy; the API
refusing is the actual constraint, and it is the only part that matters if the
UI is ever wrong.

---

## E. The query defaults, now that they are applied

`staleTime: 30s` and `refetchOnWindowFocus: false` were declared and never
passed to the client. They are live now, so request volume changes.

Open `/admin`, Network tab, clear it. Click into DevTools and back out three
times to trigger focus changes.

- **Expected:** no burst of `/admin/*` requests on focus. Before this fix each
  focus change refired every query that had no `staleTime` of its own.
- **Watch for:** a screen that now feels stale where it did not before. Fifteen
  call sites have been running at `staleTime: 0`, and one of them may have been
  quietly relying on it.

---

## Results

| # | Check | Pass / Fail / Skipped | Note |
|---|---|---|---|
| A1 | socket connects | **Pass** | Re-driven 12 Sep with Playwright, filtering for the real `socket.io` websocket specifically (an earlier pass of this script false-positived on Next's own dev-mode HMR websocket — worth knowing if anyone else automates this). Originally 10 Sep: `ws://localhost:6002/socket.io/?EIO=4&transport=websocket` opened on the booking page. |
| A2 | one ticket per connect | **Pass** | Re-driven 12 Sep: exactly one `POST /auth/socket-ticket` per connect, confirmed via network-request counting. Originally 10 Sep: `40{"ticket":"bd4d…"}` sent, `40{"sid":"vW5A…"}` back. |
| A3 | admin queue live | **Pass** | Driven 12 Sep with Playwright: `mayor@example.com` created a venue (`POST /venues/create`, direct API call through the proxy rather than the multi-step UI form) while `admin@example.com` sat on `/admin` with a websocket listener. The `data:invalidate` frame with `{"topic":"admin:pending"}` arrived essentially immediately (well under a second) after the create request completed - not the 60s poll fallback. |
| A4 | non-admin isolated | **Pass** | Same run as A3: `user@example.com`'s websocket listener, watching for any `admin:pending` frame, saw nothing. |
| A5 | reconnect + rejoin | **Pass** | Driven 12 Sep by forcing a real disconnect (touching an API source file so nodemon restarts — Playwright's `context.setOffline()` does **not** actually drop an already-open WebSocket, a tooling gotcha worth knowing). Socket closed on restart, reconnected with a fresh `POST /auth/socket-ticket` (2 tickets, 2 socket generations total), and a subsequent `admin:pending` frame arrived correctly on the *new* socket generation — the room was genuinely rejoined, not just reconnected. |
| A6 | Redis down degrades | **Pass** | Driven 12 Sep: stopped the `local_redis` container, signed in fresh — login succeeded (200), the page rendered normally (not blank), title resolved correctly, no visible error toast. The `/auth/socket-ticket` call correctly 503'd (console-logged, not user-facing), and the socket.io handshake opened then cleanly closed on `"Authentication ticket missing"` rather than hanging or erroring visibly. Redis restarted cleanly afterward — API logged `✅ Redis reconnected... caching resumed` with no manual intervention. |
| B1 | dispute → admin | **Pass, but only via the asset/service path — see finding below** | First attempt used the generic `PATCH /bookings/:id/dispute` (the `Booking` model) and technically "passed" (frame arrived) but the disputed booking never appeared in `/admin/disputes` — see "Booking disputes are invisible to admins" below. Re-driven correctly against `PATCH /asset/bookings/:id/dispute`: frame arrived 394ms after the citizen's PATCH, and the booking correctly appeared in `GET /admin/asset-bookings/disputes`. |
| B2 | resolve → citizen | **Pass** (same corrected run as B1) | Admin's `PATCH /admin/asset-bookings/:id/resolve` (`{"resolution":"completed"}`) returned 200, and the citizen's `bookings`-topic frame arrived 45ms later. |
| B3 | citizen bookings live | | Still not driven directly on `/booking` itself, but B1/B2/B5 all independently confirm the same `bookings`-topic pipeline delivers to a citizen session live, which is strong indirect evidence. |
| B4 | webhook → payer | **Pass**, after a fix | 10 Sep, driven end to end. See below. |
| B5 | check-in both sides | **Pass** | Driven 12 Sep: set a test `ticketCode` on a booking with a distinct host (`host@example.com`) and guest (`jasmine.reyes@foxers.ph`), host called `PATCH /bookings/check-in`, both host's and guest's sessions received a `bookings`-topic frame within ~450ms of each other. |
| C1 | signed-out redirects | **Pass, with a major caveat found 12 Sep** | See "proxy.ts is dead" below — the fast, pre-render redirect this check exists to verify doesn't fire at all for a non-JS request (`curl` gets 200 + full page shell for every protected route). Real, JS-executing browsers still land on `/`, correctly, via each tree's `requireAuth()` layout guard (confirmed via the `NEXT_REDIRECT` digest in the streamed RSC payload) - so the check "passes" for the client this file assumes (a browser), but the middleware layer it was written to exercise is not what's doing the work anymore. `/foxer` and `/reviews` 404 rather than redirecting - both are bare route trees with a `layout.tsx` but no `page.tsx`, so there's nothing to guard. |
| C2 | junk cookie bounced | **Pass** | Driven 12 Sep: a garbage `fox_token` value still lands on `/` (via the same `requireAuth()` path as C1, not middleware — see caveat above). |
| C3 | no secret in app | **Pass** | Driven 12 Sep: `ACCESS_TOKEN_SECRET` greps clean across `src/` and `proxy.ts` - the only matches are the test asserting its absence and a comment explaining why it's gone. |
| D | secretary boundary | **Pass** | Driven 12 Sep as `secretary@example.com`: `/admin` opens; sidebar shows exactly Dashboard/Events/Venues/Map/Assets/Services and no Citizens/Bookings/Disputes/Policies/Settings; `GET /users` and `GET /admin/disputes` (through the proxy, with real cookies) both 403; `GET /admin/venues/pending` (the approve queue) 200. |
| E | focus refetch quiet | **Pass** | Driven 12 Sep: dispatched `visibilitychange`/`blur`/`focus` three times on `/admin` (a real DevTools toggle wasn't scriptable, so this simulates the same events React Query's `refetchOnWindowFocus` listens for) — zero `/admin/*` requests fired across all three toggles. |

**All 16 checks in this file have now been driven at least once (12 Sep), all passing** except for the B1 caveat below and B3, which is only indirectly covered. `admin_secretary`'s account was added since this file predates it and works correctly.

### Booking disputes are invisible to admins — found running B1, 12 Sep

**A citizen can set a plain `Booking`'s status to `disputed` (`PATCH
/bookings/:id/dispute`), and it fires the `disputes` socket topic correctly —
but it never shows up anywhere an admin can see it.** `GET /admin/disputes`
(the endpoint `AdminDisputesPanel.tsx` actually calls, whose own empty-state
copy honestly says *"No refund disputes"*) only ever queries the `Refund`
table (`AdminSvc.getDisputes` → `refunds.map(...)`), not `Booking` rows.
Confirmed directly: disputed `seed-booking-birthday-01`, then queried
`GET /admin/disputes` — `{"data": [], "total": 0}`. The frame that fires is a
real, structurally-correct `{"topic":"disputes"}` invalidation; it just
causes a refetch of a list that was never going to contain the row, which is
exactly the "looks live, isn't connected to anything real" failure mode this
file's own intro warns about — just one layer deeper than usual, since even
watching the frame doesn't catch it.

**Not currently reachable from the app's UI**, which is the only reason this
hasn't been noticed: `reportNoShow()` (`features/booking/api/bookings.ts`),
the one UI action that calls a "dispute" endpoint, is typed
`"service" | "asset"` only and always calls `/${type}/bookings/${id}/dispute`
— which correctly feeds `findDisputedAssetBookings`/
`findDisputedServiceBookings` and their own properly-wired admin panels
(confirmed working in the corrected B1/B2 run above). The generic
`Booking.dispute()` path is real, callable API surface with no consumer
anywhere in the app — dead on the write side (nothing sets it) and dead on
the read side (nothing shows it), except that it *is* still callable by
anyone who knows the route, and if it's ever wired to a UI button in the
future, whoever does that will discover this gap the hard way. Worth either
deleting `PATCH /bookings/:id/dispute` and the `disputed` status on `Booking`
if genuinely unused, or building the missing admin view for it.

### proxy.ts is dead in this Next.js version — found running C1, 12 Sep

**The app's route-guard file (`middleware.ts`, renamed to `proxy.ts` the same
day per Next's own deprecation notice) does not register at all in Next.js
16.3.4** - not in dev (webpack or Turbopack), not in a real `next build`.
`.next/{dev/,}server/middleware-manifest.json` stays `{ "middleware": {},
"sortedMiddleware": [] }` regardless of the file's name or location (project
root or `src/`), and every one of the 16 `PROTECTED_ROUTES` trees returns a
plain `200` with real page markup to a signed-out `curl` request - no
redirect, at the HTTP level, at all.

**This is not a live data leak.** Every protected route's own `layout.tsx`
still calls `requireAuth()`/`requireAdmin()` server-side, which still
correctly resolves to `redirect("/")` - confirmed by finding the literal
`NEXT_REDIRECT;replace;/;307` digest inside the streamed RSC payload `curl`
receives. A real, JS-executing browser processes that digest during
hydration and navigates away before any protected data fetch resolves, which
is exactly what Playwright observed in A1-D above. What's actually lost is
the *fast path*: an instant 307 before any page code runs, and the only
thing that ever protected a non-JS client (a bot, a crawler, a disabled-JS
browser) — those now see a full, real page shell (title, layout, component
names in the RSC payload) for every protected route, with no server-rendered
data in it, but also no redirect.

Traced as far as reasonably possible into `next`'s own source
(`node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js`):
the file is *detected* (the deprecation warning fires, and the "both
middleware.ts and proxy.ts exist" conflict check works), but the
`middlewareFilePath`/`proxyFilePath` variables that detection sets are never
read again afterward — nothing wires the detected file into the actual
compiled middleware entry. Reproduced with both the old and new filename;
this is not a naming fix. This looks like an upstream Next.js 16.3.4 bug in
the transition between the two conventions, not something fixable from this
codebase. Worth checking after any Next.js patch update, and worth an
upstream issue if one doesn't already exist for it.

**Renamed to `proxy.ts` anyway** (matching Next's own codemod recommendation)
since it's the objectively correct target regardless of the current bug, and
it's a two-line diff (the file plus `src/__tests__/auth/middlewareSecrets.test.ts`,
which reads it by literal path). `pnpm test` still 144/144 green.

Anything that fails: record which frame was or was not in the WS pane. "It did
not update" and "it updated in 60 seconds" are different bugs, and the second one
is the one that hides.

---

## B4, run — 10 Sep

Driven with Playwright rather than by hand, because the assertion this file
actually asks for is about frames and timings and a person cannot read either
reliably. The script is not committed; what it did is:

1. signed in through the app as `user@example.com`,
2. opened `/booking/seed-booking-birthday-01` with the booking left `pending`,
3. fired a **signed** `payment_intent.succeeded` at the API - real HMAC, verified
   by `constructEvent`, so the same handler a Stripe delivery reaches,
4. watched the socket frames and the DOM without reloading.

**It failed the first time, and the failure was the point.** The frame arrived -
`42["data:invalidate",{"topic":"bookings"}]`, 73ms after the webhook - and the
page went on reading **Pending** for the full fifteen seconds the script waited.

`BookingDetailClient` was still fetching in a `useEffect` and holding the
booking in component state. That is the same defect B3 describes for the list at
`/booking`, one screen further in and never written down: a component outside
React Query cannot hear an invalidation, so `SocketProvider` was doing its job
and there was nothing listening. Converted to `useQuery` on a `user-bookings`
key - which is what `TOPIC_QUERY_KEYS` maps the `bookings` topic onto - and the
cancel modal now invalidates rather than refetching by hand.

**After the fix, 6/6:**

| Check | Result |
|---|---|
| sign-in through the app | pass |
| booking page renders the pending booking | pass |
| a websocket is actually open | pass |
| the signed webhook is accepted | pass, HTTP 200 |
| **flips to confirmed with no reload** | **pass, 585ms** |
| **`data:invalidate` frame in the log** | **pass, +74ms** |

585ms against a 60s polling fallback is the distinction this file exists to
draw: the live path did that, not the poll.
