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

| Account | Password | Is |
|---|---|---|
| `admin@example.com` | `Adminjun1234567890!` | admin |
| `secretary@example.com` | `Secretary1234567890!` | `admin_secretary` |
| `user@example.com` | `Usernanaymo@1234567890!` | citizen |
| `host@example.com` | `Hostpangani1234567890!` | eventFoxer |
| `mayor@example.com` | `Mayormamamo1234567890!` | venueFoxer |
| `gearfoxer@example.com` | `GearFoxer1234567890!` | gearFoxer |
| `servicefoxer@example.com` | `Service1234567890!` | serviceFoxer |

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
| A1 | socket connects | | |
| A2 | one ticket per connect | | |
| A3 | admin queue live | | |
| A4 | non-admin isolated | | |
| A5 | reconnect + rejoin | | |
| A6 | Redis down degrades | | |
| B1 | dispute → admin | | |
| B2 | resolve → citizen | | |
| B3 | citizen bookings live | | |
| B4 | webhook → payer | | |
| B5 | check-in both sides | | |
| C1 | signed-out redirects | | |
| C2 | junk cookie bounced | | |
| C3 | no secret in app | | |
| D | secretary boundary | | |
| E | focus refetch quiet | | |

Anything that fails: record which frame was or was not in the WS pane. "It did
not update" and "it updated in 60 seconds" are different bugs, and the second one
is the one that hides.
