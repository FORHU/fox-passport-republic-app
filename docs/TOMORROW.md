# Tomorrow — consolidated

**This is the running order.** When the trackers disagree about what to do next,
this file wins; when they disagree about a fact, the tracker wins.

| Document | Role |
|---|---|
| `TOMORROW.md` (this file) | **The running order.** What to do next, in priority order. |
| `api-audit.md` | **The record.** API, data-fetching and auth — what was found, what was fixed, what is open. Cited by everything else. |
| `responsive-plan.md` | Input — responsive and touch backlog. |
| `mapanytime-comparison.md` | Input — what to adopt from the mapanytime codebase. |
| `session-report-2026-08-26.md` | Closed record of the 26 Aug session. Not a tracker. |
| `AUDIT_REPORT.md` | **Superseded.** The external audit; its fixes are refuted in `api-audit.md` §1. Do not apply them. |

Counts at the last consolidation: `api-audit.md` 7 open,
`mapanytime-comparison.md` 9 open, `responsive-plan.md` 21 open.

---

## 0. Read this first — where the work actually is

Verified 27 August 2026, at app `ccfcf75` / api `2b5e63c`.

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
