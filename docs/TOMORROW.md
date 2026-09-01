# Tomorrow — consolidated

**This is the running order.** When the trackers disagree about what to do next,
this file wins; when they disagree about a fact, the tracker wins.

| Document | Role |
|---|---|
| `TOMORROW.md` (this file) | **The running order.** What to do next, in priority order. |
| `api-audit.md` | **The record.** API, data-fetching and auth — what was found, what was fixed, what is open. Cited by everything else. |
| `responsive-plan.md` | Input — responsive and touch backlog. |
| `mapanytime-comparison.md` | Input — what to adopt from the mapanytime codebase. |

Open counts, measured 1 Sep 2026: `api-audit.md` 9, `responsive-plan.md` 21,
`mapanytime-comparison.md` 8.

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

- [ ] **Poll cadence.** Admin 5s, host 10s, user 15–30s. Gating cut the volume
      4–10×, but nobody has decided what freshness these actually need.
      Socket.io already exists, so event-driven invalidation is a real option.
      **Partly addressed 27 Aug:** the client-wide `staleTime` is now 30s and
      `refetchOnWindowFocus` is off by default ([`api-audit.md`](./api-audit.md)
      §4.14), which removed the refetch-on-every-focus noise. The deliberate
      `refetchInterval` values are untouched and still undecided — and 30s is a
      first guess, not a researched number.
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
- [ ] **`has_session` cookie marker** so middleware can gate routes without
      touching the credential.
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
- [ ] **Fail fast on missing secrets at boot.** No fallback secrets exist (good),
      but nothing validates presence, so a missing `ACCESS_TOKEN_SECRET` 500s
      every login instead of refusing to start. §4.12.
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
