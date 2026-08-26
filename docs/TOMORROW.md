# Tomorrow — consolidated

One list, in priority order, pulled from `api-audit.md` (7 open),
`mapanytime-comparison.md` (9 open) and `responsive-plan.md` (21 open). Those
stay the detailed record; this is the running order.

---

## 0. Read this first — where the work actually is

Both PRs were merged during the session (app #? / api #59) and both repos were
switched to `staging`. That was not noticed, so the last commits went onto
`staging` directly rather than onto a feature branch.

| | State |
|---|---|
| **API** | `fix(auth): stop reporting server errors as invalid credentials` is **already pushed to `origin/staging`** |
| **App** | 6 commits on local `staging`, **not pushed** — token purge, deabstraction, mobile reject reason, 3 docs commits |
| `perf/dedupe-dashboard-fetching` | still exists, but has **0 commits** beyond staging — everything was merged |

Nothing is lost and both repos build and test clean. But the app's six commits
bypassed review, and one of them (`purge legacy tokens`) is security-relevant.

- [ ] **Decide how to land the app's 6 commits.** Either move them to a feature
      branch (`git branch <name>` from staging, then `git reset --hard
      origin/staging`, push the branch, open a PR) or push to staging to match
      where the API commit already sits. The first keeps review discipline; the
      second is consistent with what already happened on the API side.

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

- [ ] **Rotate refresh tokens on use** (`mapanytime-comparison.md` §2). Cheap now
      that the jti table exists. Makes a stolen token *detectable*: a revoked jti
      presented later is evidence of theft, not just expiry.
- [ ] **Move login behind a route handler.** Tokens still transit client
      JavaScript for one tick (`useAuth.ts:87`) before reaching `setAuthCookies`.
      Never stored, but present in memory — the last place a token touches the
      client.
- [ ] **Purge legacy tokens on every read**, not once on mount. mapanytime's
      version is stronger and explains why.
- [ ] **`has_session` cookie marker** so middleware can gate routes without
      touching the credential.

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

- [ ] **`CustomExperienceBuilder` is drag-and-drop, on the citizen path, and
      silently broken on touch.** It looks perfectly responsive (13 breakpoint
      prefixes) and does nothing under a finger. It also exists **twice**, in two
      separate implementations — dedupe before fixing, or the work gets done
      twice.
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
