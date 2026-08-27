# What to take from mapanytime — and what not to

Status: proposed, for tomorrow
Compared against: `marketPlace/mapanytime-market-web` + `mapanytime-api`

Written after reading mapanytime's auth and feature structure directly. The
starting assumption was that its authentication should be copied here. **That
turned out to be wrong on the specific axis of token storage, and right on
structure.** Both halves are recorded so the question does not get re-opened
from memory.

---

## 1. Do NOT copy its token storage

mapanytime keeps tokens in **`sessionStorage`**. Its own `shared/lib/token.ts`
says why that is a compromise rather than a target:

> "This is a blast-radius reduction, **NOT XSS protection** — script running on
> this origin reads sessionStorage exactly as easily as localStorage. What
> changes is lifetime and scope: the token dies with the tab instead of
> persisting indefinitely."

And it names the constraint that forced it:

> "Removing JS access entirely needs HttpOnly cookies, which this stack cannot
> adopt unilaterally **while the Flutter app authenticates with bearer tokens**."

FoxPassport has no Flutter client, so that constraint does not apply — which is
why the httpOnly-cookie + `/api/proxy` design landed here on 26 Aug. Adopting
sessionStorage would move us from "unreachable by JS" back to "readable by any
script on the page".

- [ ] **Confirm there is no mobile/Flutter client for FoxPassport.** This is the
      single fact that would invalidate the above. If one exists or is planned,
      the proxy design needs revisiting before it hardens.

### Two details worth stealing anyway

- [ ] **A `has_session` cookie marker.** mapanytime sets a non-sensitive
      `has_session=1` session cookie alongside the token, so middleware can gate
      routes without reading storage it cannot see. Ours currently relies on the
      httpOnly token cookie being present, which works — but an explicit marker
      makes "is there a session" a separate question from "here is the
      credential", and it is what lets the edge decide without touching the token.
- [ ] **Purge legacy tokens on every read, not once on mount.** Their
      `purgeLegacyStorage()` runs on every `getToken()`, deliberately:
      "unconditional rather than memoised on purpose: removeItem on an absent key
      is free, and a one-shot flag would make the behaviour order-dependent."
      Ours purges once in `AuthStoreProvider`. Theirs is the stronger version.

Note their comment also flags a real UX consequence of sessionStorage that we do
**not** inherit: a new tab starts with no token, so users re-authenticate per
tab. Another reason not to adopt it.

---

## 2. Refresh token rotation — take this

mapanytime rotates the refresh token on every refresh
(`newRefreshToken = data?.refreshToken || existingRefreshToken`). FoxPassport
reuses the same refresh token for its full 7 days.

- [x] **Rotate refresh tokens on use.** Done 27 Aug — see
      [`api-audit.md`](./api-audit.md) §4.9. Went further than mapanytime's
      version: reuse of a rotated token revokes every session for the account,
      which is the part that turns rotation from hygiene into detection.

This was cheap, as predicted: the `RefreshToken` table added on 26 Aug already
stored a jti per issued token, so rotation was "revoke the old jti, issue a new
one" alongside the existing `verifyRefreshToken` path.

It also closes the loop on two things already recorded in `api-audit.md`:

- §2.2 kept a note that the concurrent-refresh mutex "becomes load-bearing the
  moment refresh tokens become single-use". Rotation is that moment — and the
  claim attached to it, that "the proxy serialises refreshes server-side", was
  **wrong**. The proxy had no lock: two parallel 401s each called
  `/auth/refresh-token` independently. Harmless while refresh was idempotent,
  a logout bug the moment it was not. Closed on 27 Aug from both ends — an
  in-flight map in the proxy, and a 60-second grace window on the API so a race
  that slips through is not mistaken for theft.
- §4.1's caveat (a displaced session's access token stays valid up to 15m)
  is unaffected, but rotation means a **stolen refresh token is detectable**:
  if a revoked jti is presented, that is evidence of theft, not just expiry.

---

## 3. Zod response contracts — the biggest structural win

mapanytime has `features/<x>/contracts/<x>.contract.ts` defining Zod schemas for
every response envelope it consumes.

FoxPassport has `extractList()`:

```ts
const list =
  body?.venues ?? body?.templates ?? body?.assets ?? body?.services ??
  body?.events ?? body?.users ?? body?.categories ?? body?.data ?? body;
```

That function exists because the backend returns lists under at least eight
different keys. It guesses, and it lives **only on the server side** — every
client caller re-derives the shape by hand, which is why `useAdminData` has its
own near-identical `extractList` copy inline.

- [ ] **Introduce contracts for the endpoints `extractList` currently guesses at**,
      starting with the ones with the most callers: `/venues`, `/asset`,
      `/service`, `/event-templates`, `/categories`.
- [ ] Once a contract exists for an endpoint, both the server fetcher and the
      client hook validate against it instead of pattern-matching keys.

Worth doing in that order rather than all at once: each contract is independently
useful, and the first one will reveal whether the envelopes are actually
consistent enough to describe.

**Second-order benefit:** a contract makes the backend's inconsistency *visible*.
Right now `extractList` silently absorbs it, so nobody has ever had to decide
whether eight envelope shapes is intentional.

---

## 4. Skip the feature manifests

mapanytime has `feature.manifest.ts` per feature:

```ts
export const featureManifest = {
  name: "auth",
  dependsOn: [] as const,
  exposes: ["useAuthStore", "SellerAuthGate", ...] as const,
};
```

Declarative and readable — but nothing appears to enforce it. An undeclared
dependency compiles fine; an `exposes` list that goes stale breaks nothing.

- [ ] **Not recommended without enforcement.** If we want feature boundaries, a
      lint rule (e.g. `import/no-restricted-paths`) enforces them for real. A
      manifest nobody checks is documentation that drifts — and this codebase
      spent 26 Aug proving what drift costs: five dead barrels, two copies of one
      hook, and a mobile admin that had decayed into a static mockup.

---

## 5. Also worth a look tomorrow

- [ ] **Consistent per-feature API clients.** mapanytime uses `*.client.ts`
      uniformly. Ours is mixed: `features/*/api/*.ts` in eight features, inline
      `api.get` in hooks elsewhere, and until 26 Aug two places calling the
      backend with bare `axios`. The `api/` convention already exists here — it
      just is not applied everywhere.
- [ ] **They keep a `docs/connection-audit.md`** and reference it from code
      comments (`see docs/connection-audit.md §4`). Ours now has `api-audit.md`;
      pointing at it from the code it explains would make the same link.

---

## Suggested order

1. Confirm the no-Flutter-client assumption (§1) — cheapest, and it gates §1.
2. Refresh token rotation (§2) — small, and the table already supports it.
3. First Zod contract (§3) — pick `/venues`, see what it reveals.

§4 is a decline unless enforcement comes with it. §5 is opportunistic.
