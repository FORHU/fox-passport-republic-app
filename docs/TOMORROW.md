# Tomorrow — consolidated

**This is the running order.** When the trackers disagree about what to do next,
this file wins; when they disagree about a fact, the tracker wins.

| Document | Role |
|---|---|
| `TOMORROW.md` (this file) | **The running order.** What to do next, in priority order. |
| `api-audit.md` | **The record.** API, data-fetching and auth — what was found, what was fixed, what is open. Cited by everything else. |
| `responsive-plan.md` | Input — responsive and touch backlog. |
| `mapanytime-comparison.md` | Input — what to adopt from the mapanytime codebase. |

Open counts, measured 2 Sep 2026: this file 41, `api-audit.md` 9,
`responsive-plan.md` 21, `mapanytime-comparison.md` 8. **§7 is the map** — every
open item sorted by whether it is waiting on a browser, on you, or on a
keyboard.

**§3d and §3e are done to the edge of what a terminal can reach** — written,
typechecked, linted and tested (api 146 tests, app 94). What is left of §3d is
§3d.5: browser work, and the thing everything else rests on. Until it is run,
none of the socket work has been seen working.

---

## 0. Read this first — where the work actually is

Verified 27 August 2026 at app `ccfcf75` / api `2b5e63c`; **re-checked 1 Sep
2026 and the branch picture below has moved on** — see the note after the
table.

**The auth work is on shared `staging` in both repos.** An earlier version of
this section said the opposite — that nothing had reached `staging` and review
was preserved. That was wrong, and the branch it pointed at is now redundant.

| | State |
|---|---|
| **App** | local `staging` is **level with `origin/staging`** (0 ahead, 0 behind). `origin/staging` carries `9995312 feat(auth): keep tokens out of localStorage behind a Next proxy` and `9843a20 fix(auth): purge legacy tokens left in localStorage` |
| **API** | local `staging` is **level with `origin/staging`**, HEAD `2b5e63c fix(auth): stop reporting server errors as invalid credentials` |
| `fix/auth-hardening-and-cleanup` | on the remote, but **fully contained in `staging`** — one commit behind it, nothing of its own. A PR from it would show an empty diff. |
| `perf/dedupe-dashboard-fetching` | merged as app PR #36; **0 commits** beyond staging |

Both working trees are clean. Nothing is lost and both repos build and test
clean — but the app commits reached shared `staging` without review, and one of
them (`purge legacy tokens`) is security-relevant.

**Update, 1 Sep 2026.** The table above describes `staging`; that range is now
on `main` in both repos, merged through app PRs #39/#40 and api PRs #62/#63.
`ccfcf75`, `9995312` and `9843a20` are all ancestors of app `main`, and
`2b5e63c` is an ancestor of api `origin/main`. So the decision below is no
longer "what do we do before this merges" but "do we review it retrospectively
now that it has". Note also that the local `main` in the **api** checkout is
behind `origin/main` — pull before drawing conclusions from it.

- [ ] **Decide what to do about the unreviewed range.** It is on
      `origin/staging` already, so the options are a retrospective review of
      `9995312..ccfcf75` or accepting it as-is. Do not wait on a PR from
      `fix/auth-hardening-and-cleanup` — there is nothing in it to review.
- [ ] **Delete `fix/auth-hardening-and-cleanup`** once that is settled. It has no
      commits of its own and will only mislead the next person.
- [ ] The API's one commit had the same treatment. Leave it or revert-and-reapply
      for consistency.

---

## 1. Verification — the largest real gap

Everything below passed `tsc`, lint, build and unit tests. **Almost none of it
has been seen working in a browser.** The tests assert request counts and class
names; they would pass just as happily if the proxy returned garbage.

- [ ] **Mobile admin**: open `/admin` narrow, tap the hamburger, pick a tab from
      the drawer, approve and reject a pending item (the reject reason field is
      new and untested).
- [ ] **Venue detail on mobile**: the sticky booking bar, the `ExperienceBuilder`
      summary bar, the new single-hero gallery.
- [ ] **`NavMobileMenu`**: it was orphaned and reconnected — never seen open.
- [ ] **Password change and reset**: both now revoke all sessions. Confirm the
      user is signed out and can sign back in with the new password.
- [ ] **Proxy edge cases**: any multipart upload, and the 401 → refresh → replay
      path (let an access token expire, then act).

Login through the proxy *is* browser-confirmed. That is the only part that is.

---

## 2. Decisions only you can make

- [x] **Poll cadence — resolved 1 Sep by removing polling's role, not by tuning
      it.** See §3b. Every data query now runs on one 60s fallback and the socket
      carries normal operation, so the question "what freshness do these need"
      no longer has to be answered per screen.
- [ ] **Does `MobileAdminView` earn its keep?** It and `AdminContent` are now two
      implementations of one screen. The mockup had *already* drifted into pure
      placeholder content once — expect that again. The alternative is deleting
      it and letting the real admin render at all widths, which it largely can.
- [ ] **Single-session across a user's own devices.** Signing in on a phone ends
      the laptop session. Right for shared-credential abuse; noticeable for
      anyone working across two devices. Also: the first sign-in after deploy
      ends every session that existed before it.
- [ ] **Is there a mobile/Flutter client planned for FoxPassport?** One fact,
      but it gates the whole token-storage recommendation in
      `mapanytime-comparison.md` §1. If one is coming, the httpOnly-cookie +
      proxy design needs revisiting before it hardens.

---

## 3. Security follow-ups

- [x] **Rotate refresh tokens on use** — done 27 Aug, verified against a live API
      and database. See [`api-audit.md`](./api-audit.md) §4.9. A rotated token
      replayed outside a 60-second race window revokes every session for the
      account, so a stolen refresh token is now *detectable* rather than merely
      time-limited.
- [ ] **Move login behind a route handler.** Tokens still transit client
      JavaScript for one tick (`useAuth.ts:87`) before reaching `setAuthCookies`.
      Never stored, but present in memory — the last place a token touches the
      client.
- [ ] **Purge legacy tokens on every read**, not once on mount. mapanytime's
      version is stronger and explains why.
- [x] **`has_session` cookie marker** so middleware can gate routes without
      touching the credential. **Overtaken by §3e and no longer needed:**
      middleware now checks only that `fox_token` is *present* and never reads
      it, which is the property the marker existed to buy. A second cookie
      would add a way for the two to disagree.
- [x] **Review update/delete had no ownership check** — any authenticated user
      could rewrite or delete any review, and inflate the ratings that grant
      never-revoked Earned Specializations. Fixed and verified 27 Aug;
      [`api-audit.md`](./api-audit.md) §4.10.
- [x] **`GET /users/:id` published the password hash to anyone** — no auth, and
      a bare `findUnique` that returned the whole row. Fixed 27 Aug: the Prisma
      client now omits `User.password` globally, the lookup selects an explicit
      field list, and the route is authenticated. §4.15.
- [x] **`GET /bookings` was public and leaked every customer's name and email**,
      with Prisma filter operators taken from the query string. Fixed: auth,
      a filter allow-list, and results scoped to what the caller is party to.
      §4.16.
- [x] **Verified §4.15 and §4.16 against a running stack** — 27 Aug, once
      Postgres and Redis were back up. Anonymous requests to both endpoints
      return 401; an authenticated user lookup returns twelve fields with no
      password, phone, address or Stripe ids; an admin sees all 19 bookings
      while a citizen sees only their own 4; and neither a `userId` filter nor
      Prisma bracket-syntax injection widens that scope.
- [x] **Docker stack corrected.** `docker-compose.yml` had no `api` service
      despite `DOCKER_SETUP.md` being written around one, and neither service
      had the healthchecks the doc claimed. Both rewritten on the pattern used
      in `mapanytime-api`; existing volumes and ports preserved. §4.18.
- [ ] **Decide what to do about `requireOwnerOrAdmin`** — zero call sites, but
      cited as an enforced control. Every resource hand-rolls ownership its own
      way, which is exactly how the review hole stayed invisible. §4.11.
- [x] **Fail fast on missing secrets at boot.** **Stale entry — this is already
      done in `main`.** `src/config.ts:42-51` wraps `ACCESS_TOKEN_SECRET` and
      `REFRESH_TOKEN_SECRET` in `requireSecret()` from
      `src/utils/require-secret.ts`, with `tests/require-secret.spec.ts`
      covering it. The branch that did it, `fix/fail-fast-on-weak-secrets`, is
      fully merged and can be deleted. §4.12.
- [x] **Guard the seed** — done 27 Aug. `prisma/seed.ts` now refuses unless
      `NODE_ENV` is development/test **and** `DATABASE_URL` is a local host;
      `ALLOW_SEED=1` overrides deliberately. The seeder still creates
      `admin@example.com` with a password committed to the repo, which is fine
      precisely because the seed can no longer reach a shared database. §4.13.

---

## 3a. Google OAuth — landed after the last consolidation, never reviewed

Arrived 27 Aug in api `30eb362` and app `bc68d02`, after this file was last
consolidated, so nothing below was ever tracked. Verified against the code
1 Sep 2026. Both commits reached `main` through PRs #62 / #39 with no security
review, and the flow adds a **second, weaker** way to obtain a session than the
one §3 has been hardening all along.

- [x] **No `state` parameter — the flow was open to login CSRF.** Fixed 1 Sep.
      `getAuthUrl` took no `state` and `googleCallback` read only `code` and
      `error`, so nothing tied a callback to the browser that started it: an
      attacker could feed a victim a callback URL bearing the attacker's own
      `code` and silently sign the victim into the attacker's account.
      `GoogleAuthSvc.createState()` now mints 32 random bytes, the redirect
      stores them in a `g_oauth_state` cookie — httpOnly, `secure` outside dev,
      `SameSite=Lax` because `Strict` would be stripped on the top-level return
      from Google — and the callback compares the echoed `state` against that
      cookie in constant time before touching the code. The cookie is cleared on
      every path, success or failure. The API mounts no cookie parser, so the
      one cookie it now needs is read straight off the header rather than
      pulling in app-wide middleware.
- [x] **Access *and* refresh token were handed over in the URL query string.**
      Fixed 1 Sep with a one-time exchange code. The callback built
      `?accessToken=…&refreshToken=…` and redirected the browser to it, which
      put a **refresh token** — the long-lived credential §3 rotates and treats
      as detectable-on-theft — into browser history, the `Referer` on the next
      request, server and proxy access logs, and anything reading
      `window.location`. It was strictly worse than the one-tick exposure at
      `useAuth.ts:87` that §3 is still open on.

      What crosses now is `?xc=<32 random bytes>`: `stashSession` parks the real
      pair in Redis for 60 seconds, and the app's `completeGoogleAuth` — which
      runs server-side — POSTs the reference to `POST /auth/google/exchange`,
      gets the tokens, and puts them straight into the same httpOnly cookies a
      password login uses. `getDel` makes redemption atomic and single-use, the
      same way the OTP helper does it. Redis is optional elsewhere in the API;
      here sign-in fails closed rather than falling back to a URL.

      **Note for deploys:** Google sign-in now has a hard Redis dependency.
- [x] **`email_verified` was never checked, and an existing account was linked
      on email alone.** Fixed 1 Sep. `handleCallback` read only `sub`, `email`
      and `name`; nothing in the API looked at `payload.email_verified`. Since
      an unmatched `googleId` falls through to an email lookup and
      `AuthRepo.linkGoogleId`, anyone able to present a Google identity carrying
      a victim's address inherited the victim's password account — and
      `createGoogleUser` then wrote `isEmailVerified: true` on a claim it had
      not verified. On a Workspace domain an administrator can set an address
      arbitrarily, so this was reachable. `handleCallback` now refuses unless
      `payload.email_verified === true`, before either branch; a missing claim
      counts as unverified.
- [ ] **Decide whether silent account linking is acceptable at all.** With the
      check above, a *verified* Google address still merges into an existing
      password account with no confirmation from the account holder. That is the
      common behaviour and is defensible, but it is a choice nobody has made
      here — the alternative is asking the user to confirm the link, or
      requiring them to sign in with the password once first.
- [x] **`?googleAuthError=1` was never handled.** Fixed 1 Sep. Every failure
      path redirects to `${FRONTEND_URL}/?googleAuthError=1` and nothing in the
      app read the param, so a failed sign-in dropped the user on the landing
      page looking exactly like a successful sign-in that had forgotten them.
      `GoogleAuthErrorToast` (mounted on `/` in its own Suspense boundary) now
      raises a toast and strips the param, so a refresh does not re-raise it.
- [x] **No tests on the API side.** Fixed 1 Sep: `google-oauth.state.spec.ts`
      (16) pins the CSRF property — a callback reaches `handleCallback` only
      when the echoed `state` matches the cookie — plus the exchange endpoint
      and an assertion that no token appears in the redirect URL.
      `google-oauth.identity.spec.ts` (14) pins the verification gate, the
      link/create/known-identity branches, and that an exchange code is
      single-use and fails closed without Redis. Both mock at the module
      boundary and need no database, following `refresh-token.rotation.spec.ts`.
      Full API suite: 98 passing.
- [ ] **The app side is still uncovered.** `src/app/auth/google/callback/page.tsx`
      and `completeGoogleAuth` have no tests. Worth doing together with whatever
      replaces the token-in-URL handover, since that rewrites both.
- [ ] **Google sign-in does not enforce the single-session rule that password
      sign-in does.** `AuthSvc.login` calls `revokeAllForUser` before issuing
      (`auth.service.ts:183`), which is what makes "one account, one session"
      true. `GoogleAuthSvc.handleCallback` calls `issueRefreshToken` directly
      with no revocation, so signing in with Google leaves every other session
      alive. Two ways in, two different security properties, and
      `fox-passport-republic-api/README.md` states the single-session behaviour
      as a property of the system — it is now false for one of the two paths.
      Which way this should resolve depends on the open decision in §2; the
      README is wrong either way until it does.
- [ ] **Browser-verify the flow end to end** — new account, existing-email
      account, cancelled consent, a tampered `state`, and a replayed `xc`. Same
      gap as §1: the fixes above pass `tsc`, lint and 98 unit tests, and have
      not been through a browser. Needs Redis up and a Google client configured.
      **This is the next thing to do on this section.**
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are `as string` casts with no
      validation (`config.ts:87-88`), and `GOOGLE_CALLBACK_URL` silently falls
      back to `localhost:${PORT}`. Same class as the fail-fast item in §3 —
      fold them into that fix rather than treating them separately.

---

## 3b. Polling → Socket.IO — the migration, 1 Sep

Branches: app `perf/poll-cadence`, api `perf/socket-driven-invalidation`.
**Uncommitted at time of writing.** App 60 tests, API 115, tsc and lint clean.

**§2's premise was wrong, and that was the real finding.** "Socket.io already
exists, so event-driven invalidation is a real option" — it did not exist in any
working sense. `SocketProvider` required an `accessToken` from the client auth
store, and that store has held `null` permanently since tokens moved to httpOnly
cookies, so it returned before ever calling `connectSocket`. The socket has not
connected since that change. **Realtime notifications were silently dead too**,
not just polling — nobody noticed, because a socket that never connects looks
exactly like a quiet one. This is the same class of bug the codebase already
caught once in `useSessionManager`, whose comment says the same condition "would
have silently switched role polling off"; the fix was never applied here.

- [x] **Socket authentication rebuilt on tickets.** `POST /auth/socket-ticket`
      mints a 60-second, single-use ticket in Redis; the handshake presents that.
      A cookie cannot do this job — the access cookie belongs to the app's origin
      and the socket connects to the API's — so this is the same shape as the
      Google exchange code in §3a. `auth` is passed to socket.io as a *function*,
      not a value: single-use tickets and socket.io's reconnect-replay are
      otherwise incompatible, and a captured ticket would authenticate once then
      fail every reconnection, which is exactly when reconnecting matters.
- [x] **Admins get a room.** `role:admin`, because approval queues are shared
      state rather than per-user state.
- [x] **60 emit sites across six topics** — `admin:pending`, `venues`, `events`,
      `bookings`, `waitlist` and `roles` — covering user submissions,
      not just admin actions: create/update/delete on venues, assets, services and
      templates; `submitTemplate`; `verifyEmail`; `createBooking`; waitlist
      join/leave; and every approve/reject. Owner ids came from the `update()`
      return, which carries the full row. Emits are best-effort and wrapped: a
      socket failure cannot fail a write that already succeeded.
- [x] **Every interval replaced with one shared fallback.** `pollWhileVisible`
      from `src/shared/lib/realtime.ts`, 60s, documented against its actual job —
      dropped connection, event missed while the tab was closed, Redis down. Admin
      5s, host 10s, user 15s/30s and both waitlist queries all now use it; the
      waitlist pair also gained visibility gating it never had. Session-role
      polling stays at 5min because it is not socket-driven.
- [x] **Role approvals are live too.** `RoleRequestController.review` emits
      `roles` to the applicant, mapped to the shared `["me"]` profile key that
      `useProfile` and `useSessionManager` both read — so a newly granted role
      reaches the UI immediately instead of waiting out the 5-minute profile
      poll. That interval is now the recovery path, not the mechanism, and its
      comment says so.
- [x] **Room and event names extracted to `socket.constants.ts`**, mirrored in the
      app's `realtime.ts` and pinned by a test. These strings are the contract
      between the two repos, and a typo on either side fails *silently* — no error,
      no dropped connection, just a screen that never updates. Nothing retypes them
      now.
- [x] **The topic → query-key mapping is enforced by tests, not care.** 16 tests
      assert every server topic has a mapping, that the map holds nothing the
      server cannot emit, that each formerly-polled key is reachable from some
      topic, and **that no hook has reintroduced a literal interval** — a fast
      interval creeping back would make polling the mechanism again while the
      socket rots unnoticed.
- [ ] **Browser-verify — this now blocks release, and more than §3a does.** With
      polling demoted to 60s, a broken socket means screens that update once a
      minute instead of live, and no test can tell the difference. Needs: two
      sessions side by side (citizen submits, admin queue updates with no
      refresh); network killed and restored, confirming reconnection takes a
      *fresh* ticket and rejoins the room; a non-admin confirmed never to receive
      `admin:pending`; and Redis stopped, confirming the fallback carries the
      screen.
- [x] **Should draft edits notify admins? — no; submission is the boundary.**
      `attachAsset` / `attachService` / `attachVenue` and their `remove` pairs
      edit a template nobody has been asked to review yet, and a builder attaching
      six assets would emit six times for a draft no admin can act on.
      `submitTemplate` is the moment it enters the queue and is wired; `create`,
      `update` and `delete` are wired because they change a row the admin list
      already shows. Reversible in one line each if the queue turns out to want
      draft activity.
- [x] **Does the citizens tab show unverified users? — yes, and the first
      assumption was wrong.** `UsersRepo.getAllUsers` filters only on `roleType`;
      there is no `isEmailVerified` condition anywhere in the listing, so an
      unverified signup appears in the admin tab immediately. Emitting only on
      `verifyEmail` would have left those rows up to a minute late. `register`
      now emits as well, and `verifyEmail` still does — the row changes twice and
      the admin should see both.
- [x] **What feeds the categories tab? — admin action only.** `POST /categories/create`,
      `PUT /categories/:id` and `DELETE /categories/:id` are all `requireAdmin`;
      there is no user-facing path. All three now emit, so one admin's change
      reaches every other admin's screen live.
- [x] **In-app notifications on approval decisions — the duplication had already
      cost something.** Invalidation tells a screen to refetch; it does not tell a
      person anything. Notifications existed for bookings, matches, refunds, role
      requests and waitlist, but not for venue/asset/service/template decisions —
      and tracing that turned up worse: the resource-level routes send an approval
      **email**, while the `/admin/*` routes every screen actually calls sent
      **neither email nor notification**. An owner approved through the admin
      console learned about it by going and looking. `notifyDecision` now writes a
      notification from all ten `AdminCtrl` handlers, fire-and-forget so a failed
      write cannot fail a decision already committed; rejections carry the reason
      the admin gave.
- [x] **The admin path now sends the email too.** `sendDecisionEmail` reuses the
      existing `sendApprovedEmail` / `sendRejectedEmail` templates rather than
      writing new ones, so both approval paths say the same thing. Each model keeps
      its owner under a different relation — `mayor`, `owner`, `client` — so the
      recipient lookup is spelled out per entity rather than generalised, since a
      generic lookup is exactly the kind of thing that would pick the wrong person
      silently. Fire-and-forget like the notification: a slow mail provider must
      not fail a decision that is already committed. Rejections carry the admin's
      reason, falling back to "No reason given."; approvals carry none.
- [ ] **Approve/reject exists twice, and this app only uses one.** `AdminCtrl`
      serves `/admin/venues/:id/approve`; `VenueCtrl` serves `/venues/:id/approve`.
      Both mounted, both `requireAdmin`, both working. Every call site in the app —
      `AdminVenuesTable`, `AdminAssetsTable`, `AdminServicesTable`,
      `AdminEventsTable`, `MobileAdminView` — hits `/admin/*`; the resource-level
      pair is unused by this frontend. Both are instrumented so behaviour is
      correct either way. Deleting the unused pair is the obvious cleanup, but it
      is an API removal and something outside this repo could be calling it, so it
      needs a decision rather than a commit. **No longer hypothetical drift:** the
      notification gap above is exactly it — the two paths had already diverged on
      whether the owner gets told anything, and nobody noticed because both
      "work". Same shape as the review-ownership hole in §3.
- [x] **`favorites` has no server topic, deliberately.** It changes only through
      the viewer's own favourite/unfavourite, which `useFavorites` already
      invalidates locally (`useFavorites.ts:68`). Nothing server-side moves it, so
      a topic would never fire. Recorded in the map itself so the absence reads as
      a decision, not an oversight.

**New operational dependency:** realtime now requires Redis, on top of the
requirement Google sign-in added in §3a. With Redis down the socket cannot
authenticate and every screen falls back to its 60s poll — deliberate, since the
alternative was passing a real token through client JavaScript.

---

## 3c. `admin_secretary` and permission-based access, 1 Sep

Same branches as §3b. **Uncommitted.** API 143 tests, app 73, tsc and lint clean.

A third `SystemRole`, granted the approval queues and nothing else. The point of
the role is what it *cannot* see — the citizens list, role applications, and
category management — so those absences are asserted, not merely unlisted.

- [x] **Fixed the silent downgrade first, because nothing else was testable
      without it.** `toAuthenticatedUser` narrowed every token claim through
      `claims.systemRole === "admin" ? "admin" : "user"`, so a valid
      `admin_secretary` token would have been rewritten to `user` on every
      request — no error, no log, just a person quietly missing permissions. It
      now parses against a `Record<SystemRole, true>`, which **fails to compile**
      the day a fourth role is added rather than failing at runtime. Unknown
      roles are denied, not defaulted.
- [x] **A grant table replaced 26 hand-rolled role comparisons.**
      `src/types/permissions.ts` names seven capabilities — `admin:access`,
      `queue:read`, `queue:decide`, `users:read`, `roles:manage`,
      `categories:manage`, `bookings:read:all` — and `can(role, permission)`
      answers every question that used to be asked as `systemRole === "admin"`.
      Adding a role is now an edit to one table instead of an audit of both
      repos.
- [x] **`requirePermission` guards the routes.** 21 of the 35 `/admin/*` routes —
      the queue reads and decisions — now gate on capability; the other 14
      (bookings, disputes, refunds) stay admin-only, which is the safe default
      for a new role. `requireAdmin` survives, marked deprecated, with a note
      that it excludes the secretary by design.
- [x] **Tokens carry a `permissions` claim** so the app's edge middleware can gate
      `/admin` without a round trip. The API never trusts it — `can()` always
      re-derives from the role — it is a convenience for the client.
- [x] **The admin nav is capability-driven.** Each item in `AdminSidebar` names
      the permission it needs and is filtered out otherwise, so a secretary sees
      Dashboard, Events, Venues, Assets and Services and nothing else. Hiding is
      courtesy; the API refuses those routes regardless.
- [x] **41 tests pin the boundary** — 28 server-side, 13 client — including that
      the four converted gates no longer compare `systemRole` to a literal, and
      that every nav item declares a permission.
- [x] **Found and removed dead `super_admin` references.** `useLandingPage.ts`
      and `UserMenuButton.tsx` both branched on a role that has never existed in
      the schema. Someone had planned a third tier before; those branches would
      have started behaving differently the moment one was added.
- [ ] **Nobody has this role yet.** Adding it to the enum does not grant it —
      an existing admin has to be changed to `admin_secretary` in the database,
      and there is no UI for that (`roles:manage` covers role *applications*, not
      system roles). Decide whether that is a seeder, a migration, or a screen.
- [ ] **The migration adds an enum value and is not reversible in place.**
      `ALTER TYPE ... ADD VALUE` cannot be rolled back inside a transaction on
      Postgres. It is additive and safe, but a rollback means a new migration,
      not a `migrate resolve`.
- [ ] **Browser-verify the role** alongside §3b: sign in as `admin_secretary`,
      confirm the console opens, the queues work, and Citizens/Bookings/
      Categories/Disputes/Policies/Settings are absent — then confirm a direct
      `GET /api/v1/users` still 403s, because that is the control.

---

## 3d. The socket emit gaps — everything needed to close them, 2 Sep

Branch `fix/socket-emit-gaps` in both repos, cut 1 Sep from the merged `main`
(api `9da6d62`, app `9e78cbf`). **Nothing below is started.** §3b and §3c
describe what landed; this section is the repair list for what it left behind,
written so it can be worked without re-deriving anything — every item names the
file, the line as of the branch point, who has to be told, and which topic tells
them.

**A count correction.** The handover note said "14 mutating handlers that emit
nothing". 14 is the number of `/admin/*` routes left on `requireAdmin` in §3c —
bookings, disputes, refunds — not the number of silent handlers. Auditing every
`static async` in `src/controllers/` against the `announce*` call sites gives
**26** in the booking/dispute/refund area: 6 in `admin.controller.ts`, 7 in
`booking.controller.ts`, 6 each in `asset-booking.controller.ts` and
`service-booking.controller.ts`, and the Stripe webhook. All 26 are listed in
§3d.3. Handlers outside that area — profile, reviews, matches, favourites,
files — are silent too, but nothing polled them before either, so they are not a
regression and are out of scope here.

### 3d.1 Guard `NotificationService.create` — highest severity, smallest fix

`api/src/modules/notifications/user-notification.service.ts:14`

`io` is `export let io: Server` (`src/infrastructure/socket/socket.server.ts:5`)
and is assigned only by `initSocketServer`, which is called only from
`src/server.ts:9`. Any entry point that imports `app` without going through
`server.ts` — a serverless handler, a script, a test that mounts the Express app
— leaves `io` `undefined`, and `emitToUser` runs `io.to(...)`:
`TypeError: Cannot read properties of undefined (reading 'to')`.

The blast radius is not the notification. It is whatever awaited it:

| Call site | Shape | What a throw costs |
|---|---|---|
| `src/services/role-request.service.ts:123` | `await`, **no try/catch** | `RoleRequestSvc.review` rejects *after* the transaction committed. The applicant already has the role; the admin gets a 500 and retries a decision that is done. |
| `src/services/waitlist.service.ts:98` | `await`, inside `try/catch` (`:97-107`) | Already safe — logs and continues. |
| `src/modules/notifications/decision-notification.ts:38` | `void … .catch()` | Already safe. |

So one of the three is exposed, and it is the one behind role review. Fix the
service, not the call site — the next `await` added anywhere else inherits the
same hazard:

```ts
    // Best-effort. The row is already written, and `io` is assigned only by
    // `server.ts`, so any entry point that imports `app` alone has none.
    try {
      emitToUser(io, input.userId, SOCKET_EVENTS.NEW_NOTIFICATION, {
        ...notification,
        metadata: notification.metadata as
          Record<string, unknown> | null | undefined,
      });
    } catch (e) {
      console.error("Failed to push notification over the socket:", e);
    }
```

- [x] **Wrapped the emit in `create()`.** This is the shape
      `invalidate.ts:15-21` already uses for every invalidation; the notification
      path is the one place that reaches `io` without it.
- [x] **Guarded `emitToUser` itself** (`socket.utils.ts`) with
      `if (!io) return;`, and widened its `io` parameter to `Server | undefined`
      so the type says what the runtime already knew. One line, and it covers every future caller rather than
      relying on every future caller remembering. Keep the try/catch as well —
      `io` being assigned does not mean `.to().emit()` cannot throw.
- [x] **Tested** — `tests/notification.emit.spec.ts`, 3 cases (no socket server, an emit that throws, and a live socket reaching the right room). Loads the service through `vi.doMock` per case. Mock
      `../src/infrastructure/socket/socket.server` to `{ io: undefined }`, call
      `NotificationService.create`, assert it resolves and that the repository
      write still happened. Without the mock the test proves nothing, because
      `io` happens to be defined whenever the suite boots through `server.ts`.

### 3d.2 The wiring the emits need before any of them can work

Two of these are prerequisites for §3d.3, not optional polish.

- [x] **Added `announceToAdmins(topic)`** to
      `src/infrastructure/socket/invalidate.ts`. `announceAdminQueueChanged()` is
      hardcoded to `admin:pending`, which maps to `["admin-data"]` — the approval
      queues. The disputes tables are a different query key entirely, so there is
      currently no way to invalidate them at all:

      ```ts
      export function announceToAdmins(topic: InvalidateTopic): void {
        try {
          emitInvalidateToAdmins(io, topic);
        } catch {
          // Best-effort: clients still hold a slow poll and a focus refetch.
        }
      }
      ```

      Keep `announceAdminQueueChanged()` as a one-line wrapper over it so the
      ~40 existing call sites do not churn.
- [x] **Added the `disputes` topic.** Three files change together or the app suite
      fails, because the mapping test asserts *exact* set equality between the
      server union and the client map:
      1. api `src/infrastructure/socket/socket.types.ts:19` — add `| "disputes"`
         to `InvalidateTopic`.
      2. app `src/shared/lib/realtime.ts:50` — add
         `disputes: [["admin", "disputes"]]`. React Query matches keys by prefix,
         so this one entry covers `["admin","disputes"]`
         (`AdminDisputesPanel.tsx:39`) and both `["admin","disputes",type]`
         tables (`AdminDisputesPanel.tsx:166`).
      3. app `src/__tests__/data/realtimeInvalidation.test.ts:23` — add
         `"disputes"` to `SERVER_TOPICS`. That array is hand-maintained; the
         "maps nothing the server cannot emit" assertion at `:46` is what makes
         those three files a single commit.
- [x] **The Disputes panel did not poll at all — worse than the 5s → 60s the
      handover note recorded.** Neither query in
      `src/features/admin/components/AdminDisputesPanel.tsx` (`:39`, `:166`) sets
      `refetchInterval`, and neither sets `refetchOnWindowFocus`. Today they
      refresh on mount and after their own mutation, and nothing else — two
      admins working the same queue never see each other's resolutions, and a
      refund that fails in Stripe minutes later never appears. Give both
      `refetchInterval: pollWhileVisible` from `@/shared/lib/realtime`, matching
      every other live screen, so the socket has a fallback underneath it. Add
      the file to `POLLING_HOOKS` in the realtime test while there.

### 3d.3 The 26 silent handlers

**Done, with one deliberate departure from the plan below.** Where a handler's
work already lived in a service that had loaded the booking to authorise the
request, the emit went in the service rather than the controller:
`BookingSvc.updateStatus` / `confirmArrival` / `dispute`,
`AssetBookingSvc` and `ServiceBookingSvc`. That covers callers a controller
cannot see - `cancel()` reaches `updateStatus` directly, and
`checkInAndSettle` reaches it too, which is why `checkInBooking` needs no emit
of its own - and costs no extra queries. The controllers keep the emits for
work they do themselves: `cancelBooking` (both branches - the no-payment branch
writes no refund, so only the paid branch announces `disputes`), `confirmBooking`,
`checkInAttendee`, the six admin dispute/refund handlers, and the webhook.
Refund rows carry only `bookingId`, so `announceRefundChanged` in
`admin.controller.ts` spends one `findUnique` on the owner rather than widening
what `RefundSvc` returns to screens that parse it.

Recipients are spelled out per handler on purpose: each model keeps its owner
under a different relation, and a generic "look up the owner" helper is exactly
the kind of thing that picks the wrong person silently — the same reasoning
`sendDecisionEmail` records in §3b.

`bookings` is the right topic for anything a citizen or host can see on a
booking; it maps to `["host-data"]`, `["user-upcoming-events"]` and
`["admin-data"]`, so one emit reaches the guest's dashboard, the host's, and the
admin Bookings tab. `disputes` is additional, not a replacement — the Disputes
tab reads `/admin/disputes`, which no `bookings` invalidation touches.

**`src/controllers/admin.controller.ts`** — all six also need
`announceToAdmins("disputes")`, because every one of them changes a row the
Disputes or Refunds table is showing.

| Handler | Line | Tell the citizen | Note |
|---|---|---|---|
| `resolveDispute` | `:119` | `booking.userId`, `"bookings"` | Two branches. The reject branch's `prisma.refund.update` (`:136`) has no `include` — add `include: { booking: { select: { userId: true } } }`. The approve branch delegates to `RefundSvc.retryRefund`, which returns a bare `Refund` row (`refund.service.ts:458`), so either add the same `include` there or resolve the owner from `updated.bookingId` with one `findUnique`. |
| `resolveAssetBookingDispute` | `:172` | `booking.userId`, `"bookings"` | `prisma.assetBooking.update` (`:178`) already returns `userId` on the row — no extra query. Tell the provider too: `asset.ownerId`, which does need a lookup. |
| `resolveServiceBookingDispute` | `:209` | `booking.userId`, `"bookings"` | Mirror of the above; provider is `service.ownerId`. |
| `manualRefund` | `:229` | the booking's `userId`, `"bookings"` | `prisma.refund.create` (`:238`) takes `value.bookingId` and returns no relation. Add `include: { booking: { select: { userId: true } } }`. |
| `retryRefund` | `:818` | the booking's `userId`, `"bookings"` | Same lookup problem as `resolveDispute`'s approve branch — fix it once in `RefundSvc.retryRefund` and both call sites are covered. |
| `resolveManualRefund` | `:831` | the booking's `userId`, `"bookings"` | `RefundSvc.resolveManual` (`refund.service.ts:500`) also returns a bare row; add the `include` there. |

**`src/controllers/booking.controller.ts`**

| Handler | Line | Emit |
|---|---|---|
| `cancelBooking` | `:302` | `announceToUser(booking.userId, "bookings")`, the host (`booking.event?.host?.id ?? booking.event?.organizerId`), and `announceAdminQueueChanged()`. Put it beside `notifyBookingCancelled(...)` (`:549`) — that call already has both ids resolved, so nothing new is queried. |
| `confirmBooking` | `:664` | Guest `req.user!.userId` and host `booking.event?.host?.id`, both `"bookings"`, plus `announceAdminQueueChanged()`. Both ids are already in scope at `:795-797`. |
| `updateStatus` | `:833` | The `BookingSvc.updateStatus` return carries `userId`; emit to it and to the host. This is the handler the app's own status buttons call, so a stale screen here is the most visible of the seven. |
| `confirmArrival` | `:865` | Same shape as `updateStatus` — it releases escrow, which the host's payout view shows. |
| `dispute` | `:879` | Citizen + `announceToAdmins("disputes")`. This is the *only* way a row enters the Disputes tab, and today it arrives silently: an admin sees a new dispute only by reloading. Do this one first of the seven. |
| `checkInBooking` | `:890` | Guest (`booking.userId`) and host (`req.user!.userId`), `"bookings"`. Payout may have been triggered (`result.payoutTriggered`), so the host's dashboard is stale too. |
| `checkInAttendee` | `:936` | Host `req.user!.userId` and the booking owner `attendee.booking.userId`, `"bookings"`. `attendee.booking` is already loaded at `:941`. |

**`src/controllers/asset-booking.controller.ts`** — six handlers, none emitting.
Every returned row carries `userId` (`schema.prisma:746`); the provider is
`asset.ownerId` and needs a lookup, so do that once inside `AssetBookingSvc`
rather than in six controller bodies.

| Handler | Line | Emit |
|---|---|---|
| `create` | `:7` | booker + provider, `"bookings"`; `announceAdminQueueChanged()`. A new asset booking appears in the admin Bookings tab and in the provider's dashboard, and today neither is told. |
| `confirmPayment` | `:81` | booker + provider, `"bookings"` |
| `updateStatus` | `:107` | booker + provider, `"bookings"` |
| `cancel` | `:132` | booker + provider, `"bookings"`. It delegates to `updateStatus` in the service (`asset-booking.service.ts:149`), so emitting in the service covers both. |
| `confirmArrival` | `:146` | booker + provider, `"bookings"` |
| `dispute` | `:160` | booker + provider + `announceToAdmins("disputes")` — this is what fills `/admin/asset-bookings/disputes`. |

**`src/controllers/service-booking.controller.ts`** — the same six handlers at
`:7`, `:76`, `:102`, `:127`, `:141`, `:155`, with `service.ownerId` as the
provider. Deliberately kept as a mirror rather than generalised: the two
controllers have been edited in step so far, and a shared abstraction here would
have to reach across two Prisma models to earn nothing.

**`src/controllers/payment.controller.ts:273` — the Stripe webhook.** The
`payment_intent.succeeded` branch flips the booking to `confirmed` (`:358-370`),
and this is the one handler where nobody is in the room: there is no `req.user`,
and the browser that started the payment is sitting on a page waiting for
exactly this. Without an emit the guest waits out the full 60s fallback after
paying.

- The `findUnique` at `:307` selects `{ id, status, stripePaymentId }` — **add
  `userId`**, and the event's `organizerId` if the host's screen should move too.
- Emit `"bookings"` to the booker only when the status actually changed, inside
  the same `if (booking.status === BookingStatus.pending)` block, so a Stripe
  retry of an already-confirmed intent does not re-emit.
- `charge.refunded` (`:381`) updates a payment row with no booking loaded.
  Either widen that query or leave it — the refund paths in `admin.controller`
  already cover the admin view, and this branch is Stripe-initiated only.

### 3d.4 Found while auditing — the app's query defaults are dead code

`app/src/shared/providers/QueryProvider.tsx`

`queryDefaults` (`:28-36`) — `staleTime: 30_000`, `refetchOnWindowFocus: false` —
is declared and **never passed to the `QueryClient`**. The constructor at
`:45-52` supplies only `{ retry: 1, retryDelay: 1000 }`. So React Query's own
defaults still apply everywhere a hook does not override them: `staleTime: 0`
and `refetchOnWindowFocus: true` — precisely the behaviour the comment above the
object says was fixed.

`src/__tests__/data/queryDefaults.test.ts` passes anyway, because all three of
its assertions match on the *source text* of the file (`:33`, `:37`, `:43`) and
the object is present in the source. That file's own comment admits the
assertions are weaker than a render test; this is the failure they miss.

- [x] **Passed the object**:
      `new QueryClient({ defaultOptions: { queries: { ...queryDefaults.queries, retry: 1, retryDelay: 1000 } } })`.
- [ ] **Then re-measure `/admin` before assuming it is an improvement.** Fifteen
      call sites have been running on `staleTime: 0` since that commit landed;
      turning the intended defaults on will change request counts across the app,
      and a hook or two may have been tuned against the accidental behaviour.
- [x] **Replaced the source-text assertions with behavioural ones** — construct
      the provider and read `queryClient.getDefaultOptions().queries`. That is
      the test that would have caught this, and it is barely longer.
- [x] **`["user-bookings"]` was invalidated by nothing and defined by nothing —
      settled, and the answer was the third option.** It was not a renamed key.
      The screen it was aimed at, the `/booking` list, does not use React Query
      at all: `BookingListClient` and `MobileBookingsView` fetch in a
      `useEffect` and hold their rows in component state. No key can reach it.
      The dead call is removed, with the finding recorded where it was.
- [x] **`/booking` was outside the cache — it is in it now.** The citizen's own
      bookings list was the last screen fetching in a `useEffect` and holding
      rows in component state, so every emit in §3d.3 reached the dashboards and
      the admin tab but not the person the booking belongs to.
      `BookingListClient` and `MobileBookingsView` are on `useQuery` now, keyed
      `["user-bookings", userId, page, limit]`, and `bookings` maps onto
      `["user-bookings"]` — prefix matching, so one emit refreshes whichever page
      is open on desktop and the mobile view besides. Both carry
      `pollWhileVisible` as the fallback and are pinned in `POLLING_HOOKS`.
      Desktop paging gained `keepPreviousData`, which it did not have: it used
      to replace the whole list with a spinner.

### 3d.5 Browser verification — still the thing that has never been done

§3b listed this and it remains untouched. It now covers more, and it is the only
check that can tell "the socket works" from "the socket has been dead since the
cookie change" — the exact bug §3b found, which passed every test suite.

Needs Redis up and a Google client configured (§3a).

- [ ] Two sessions side by side: citizen submits a venue, admin queue updates
      with no refresh.
- [ ] Kill the network, restore it: confirm the reconnect fetches a **fresh**
      ticket (single-use — a captured one authenticates once and then fails every
      reconnection) and rejoins `role:admin`.
- [ ] A non-admin session never receives `admin:pending`.
- [ ] Stop Redis: the handshake fails, and every screen still corrects itself
      inside 60s on the fallback poll.
- [ ] Sign in as `admin_secretary`: console opens, queues work,
      Citizens/Bookings/Categories/Disputes/Policies/Settings absent, and a
      direct `GET /api/v1/users` still 403s — that last one is the control.
- [ ] After §3d.3: raise a dispute as a citizen and watch it appear in the admin
      Disputes tab with no refresh; resolve it and watch the citizen's booking
      update. That round trip exercises the new topic, the new admin helper and
      both sides of the map at once.

### 3d.6 Order of work

1. §3d.1 — two guards and a test. Independent of everything else; land it alone.
2. §3d.2 — the helper, the topic, the panel's fallback poll. Nothing in §3d.3
   can be verified before this exists.
3. §3d.3 — `BookingCtrl.dispute` and the Stripe webhook first (a person is
   actually waiting on both), then the admin disputes/refunds, then the
   asset/service pairs.
4. §3d.4 — one line, but re-measure before calling it done.
5. §3d.5 — the whole point. Everything above is unproven until this is run.

---

## 3e. The API's signing key left the frontend, 2 Sep

`middleware.ts` verified the session cookie itself with `jwtVerify`, which meant
this repo's environment held `ACCESS_TOKEN_SECRET` — the API's signing key.
HS256 is symmetric, so the value that checks a token also mints one: the
frontend could forge an admin token for its own backend. Nothing did, but the
capability sat there in an `.env` that gets copied between machines.

The middleware is now a navigation guard and nothing else: it checks that
`fox_token` is **present**, redirects to login when it is not, and reads none of
its contents. `ACCESS_TOKEN_SECRET` is gone from `.env` and `.env.example`, and
`src/__tests__/auth/middlewareSecrets.test.ts` scans the whole tree to keep it
gone.

**Nothing in the API changed.** Token issuance, HS256, `authenticate` and
`requirePermission` are all untouched — that was the point. The enforcement that
was already there is now the only enforcement:

- the API verifies the token, checks expiry, loads the user and answers 401/403;
- `requireAuth` / `requireAdmin` / `requireHost` in `shared/lib/server/auth.ts`
  redirect from the page itself, off a live `/profile` call rather than a cookie
  claim — fresher information than the middleware ever had.

So `/admin` is still closed to a non-admin: `app/admin/page.tsx` calls
`requireAdmin()` on its first line. What changed is *where* the redirect happens
and what it is based on.

- [x] **`/booking`, `/checkout`, `/mayor`, `/foxer` and `/reviews` had no
      page-level guard — they now have one each, as a layout.** They had been
      leaning on the edge check nobody remembered was load-bearing, so a
      fabricated `fox_token` of any random value loaded their shell. Each tree
      got a `layout.tsx` calling `await requireAuth()`, which covers all 23
      pages under them with five files rather than 23 — and covers the one
      client page (`/foxer/create-event`) that could not guard itself.
      `requireAuth`, not `requireHost`: `/mayor/apply` and `/foxer/apply` are
      how someone *becomes* one. `getUser` is memoised per render pass, so the
      pages that already call it pay no second round trip.
      `/progress` is in `PROTECTED_ROUTES` and has no pages at all; left as is,
      and the middleware redirect covers the day one appears.
      `src/__tests__/auth/middlewareSecrets.test.ts` now reads
      `PROTECTED_ROUTES` out of the middleware and fails if any tree in it has
      neither a layout guard nor a guard on every page. Comments are stripped
      before matching, or a layout would count as guarded on the strength of
      the comment explaining its own guard.
- [x] **`/creator-dashboard` was guarded client-side only — split, and now
      guarded on the server too.** Its layout was a `"use client"` component
      wrapping `RequireAuth`, which reads the auth store after render rather
      than resolving a session before it. The client half moved to
      `features/dashboard/components/CreatorDashboardShell.tsx` (it owns the
      create-venue modal state, which is what forced the layout to be a client
      component); `app/creator-dashboard/layout.tsx` is now a server component
      calling `await requireAuth()`. `RequireAuth` stays inside the shell on
      purpose — it covers a session dying mid-navigation, and it is what opens
      the signup modal, which a server `redirect("/")` cannot do.
- [ ] **`jose` is an unused dependency, and removing it is blocked on a pnpm
      mismatch.** `middleware.ts` was its only importer. `pnpm remove jose`
      refuses: `node_modules` here was linked from the pnpm **11** store, while
      `packageManager` pins **10.34.5**, so pnpm wants store v10 and asks for a
      full reinstall first. Forcing that to delete one unused package is a bad
      trade, so the dependency stays for now.
- [ ] **The pnpm pin and the installed tree disagree — which is the real
      finding above.** Anyone running `pnpm install` per `packageManager` gets a
      full relink, and anyone using their own pnpm 11 gets a tree the pin does
      not describe. Settle on one major and update `packageManager` to match.
- [ ] **RS256/ES256 remains the real answer** if middleware ever needs to verify
      rather than merely check. The API would sign with a private key and this
      app would hold only the public one — able to verify, unable to mint. That
      is a change to token issuance and deliberately out of scope here.

**If a deploy breaks after this:** the app no longer needs
`ACCESS_TOKEN_SECRET`, but it does no harm if a deployed environment still sets
it. The API still needs its own copy — do not remove it there.

---

## 4. Structure

- [ ] **Zod response contracts**, starting with `/venues`. `extractList()`
      currently guesses between eight envelope keys, exists only server-side, and
      has a near-identical copy inlined in `useAdminData`. One contract per
      endpoint, most-used first — the first one will show whether the envelopes
      are consistent enough to describe at all.
- [ ] **Consistent per-feature API clients.** The `features/*/api/` convention
      exists in eight features but is not applied everywhere.
- [ ] Test asserting queries are gated on whatever decides rendering. The
      `enabled` pattern has now been applied by hand three times.

Declining unless enforcement comes with it: feature manifests
(`mapanytime-comparison.md` §4).

---

## 5. Responsive backlog

`responsive-plan.md` has **21 open items** — Phases 1–4, largely untouched. The
one item that is not cosmetic:

- [ ] **The experience builder is drag-and-drop, on the citizen path, and
      silently broken on touch.** It looks responsive (12 breakpoint prefixes)
      and does nothing under a finger. It exists **twice**, and neither copy is a
      file named `CustomExperienceBuilder` — grepping that name finds nothing and
      reads as "already done". The two are:
      - `src/features/venue/components/detail/ExperienceBuilder.tsx`
      - `CustomExperienceBuilder`, declared **inline** at
        `src/app/event/[eventId]/page.tsx:21`, inside a 1,483-line page

      Dedupe before fixing, or the work gets done twice.
- [ ] Fold the admin-responsive correction into `responsive-plan.md` §2.3. That
      section says "desktop-only is an acceptable answer" for admin, which is
      wrong — following it would mean deleting working code.

---

## 6. Known traps

- **`npm run format` still churns line endings** on any branch that lacks the new
  `.gitattributes`. If a teammate formats before pulling it, expect a ~156-file
  diff.
- **The mobile reject reason** is new and unverified — if the API rejects an
  empty reason, the "No reason given" default needs checking.
- **`api/.env` edits are local-only** (gitignored). The dead Supabase vars were
  removed here but remain in everyone else's env and in deployed environments.

---

## 7. Flag pass — all 39 open items, who can close them, 2 Sep

Every open box in this file, checked against the code as it stands. The point
is not to restate them — it is to say which ones are actually waiting on a
keyboard and which are waiting on you or on a browser, because those had been
sitting in one undifferentiated list.

Two turned out to be already done and are now ticked: **fail fast on missing
secrets** (§3 — `requireSecret` has been in `main` since
`fix/fail-fast-on-weak-secrets` merged, with a spec covering it) and the
**`has_session` cookie marker** (§3 — §3e made it unnecessary rather than done).
Anything in this file older than a week is worth this treatment before it is
worked.

| Waiting on | Count | Items |
|---|---|---|
| **A browser** | 16 | §1 all five; §3a browser-verify; §3b browser-verify; §3c browser-verify; §3d.4 re-measure `/admin`; §3d.5 all six |
| **Your decision** | 10 | §0 all three; §2 all three; §3 `requireOwnerOrAdmin`; §3a silent account linking; §3b duplicate approve/reject routes; §3c who gets `admin_secretary` |
| **A keyboard** | 13 | §3 login route handler, legacy-token purge; §3a app-side callback coverage, single-session on Google, the `as string` casts; §3c enum-migration note; §3e `jose`, the pnpm pin, RS256; §4 all three; §5 the experience builder |

### The browser column is the one that matters

Sixteen of thirty-nine, and they are not evenly weighted: §3d.5 gates a release,
because with polling demoted to 60s a broken socket looks exactly like a working
one. Nothing in the keyboard column changes that, and nothing in it should be
started in preference to it.

### The keyboard column, ordered by what it would cost to keep ignoring it

1. **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are `as string` casts** (§3a).
   The API validates every other secret through `requireSecret` and these two
   slipped past — so a missing Google secret fails at first sign-in rather than
   at boot, which is exactly the shape §3 already decided against. Smallest fix
   here, and it removes an inconsistency rather than adding a feature.
2. **Google sign-in does not revoke other sessions** (§3a) where password login
   does. Two doors, one locked.
3. **The app-side Google callback is untested** (§3a).
4. **Zod response contracts** (§4). `extractList()` guessing between eight
   envelope keys is the same class of problem as everything in §3d: it fails
   quietly and looks like empty data.
5. **The experience builder** (§5) — drag-and-drop, on the citizen path,
   silently broken under a finger, and duplicated in two files. Dedupe before
   fixing or the work happens twice.
6. **`jose` and the pnpm pin** (§3e) — both trivial, both blocked on deciding a
   pnpm major.
7. **RS256/ES256** (§3e) — the only one that is genuinely large, and the only
   one that is genuinely optional.

### Two things found during this pass that were not in the file

- [ ] **`x-auth-required` is set and read by nothing.** `middleware.ts:72` sets
      it on the login redirect with a comment saying it "signals the client to
      open the login modal", and nothing in `src/` reads it — a response header
      on a redirect is not visible to the page that lands. The modal is opened
      by `RequireAuth` client-side instead. Either wire it (the redirect target
      would have to carry a query param, not a header) or delete the line and
      the comment; leaving it invites someone to trust it.
- [ ] **`/progress` is in `PROTECTED_ROUTES` and has no pages.** Harmless, and
      the guard-coverage test skips it deliberately, but it is a route that
      looks protected and protects nothing. Delete it or build it.
