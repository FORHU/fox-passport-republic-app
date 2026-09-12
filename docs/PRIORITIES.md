# Pending Priorities

**Last updated:** 11 September 2026
**Purpose:** single tracked list across both open threads (Redis/caching branch, Dynamic Events). Check items off and flag anything that needs discussion when picking this back up.

---

## P0 — Live bug, blocking

- [x] **Merge `feat/auth-03-api-cookies` — merged 12 Sep via PR #60.** `main` had
      advanced significantly since the branch was cut (feat/map,
      feat/foxcommunity, role assignment, the whole `/host` → `/creator-dashboard`
      move), so this was a real merge, not a fast-forward. Two conflicts, both
      resolved in favor of the newer `endSession()` + query-cache-clear
      abstraction while preserving `main`'s `promptLogin` option and the
      `/?auth=expired` toast handoff: `src/shared/auth/useLogout.ts` and
      `src/shared/providers/AuthStoreProvider.tsx`. Everything else auto-merged
      cleanly. `tsc` clean, 144/144 tests passing, no new architecture-boundary
      violations post-merge. **Not yet verified in a browser** — see
      `VERIFY.md`, none of AUTH-02/03's cookie-rotation behavior has been
      watched in DevTools.
  - [ ] **Blocker (needs you, not code):** the API's `.env` has no `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL`. AUTH-05 can't be verified until those exist.

## P1 — Verification debt on already-shipped work

- [ ] **Finish `VERIFY.md`.** Only A1, A2, B4 were driven so far.
  - [ ] A3
  - [ ] A4
  - [ ] A5 (reconnect — worth prioritizing, reconnect behavior changed recently)
  - [ ] A6 (Redis down — worth prioritizing, same reason)
  - [ ] B1
  - [ ] B2
  - [ ] B3
  - [ ] B5
  - [ ] C1
  - [ ] C2
  - [ ] C3
  - [ ] D
  - [ ] E
  - Needs both servers up; a few checks need two independent browser sessions.

## P0/P1 — Event sharing (growth, independent of the Dynamic Events roadmap)

**Decided 11 Sep:** this track does *not* wait on Dynamic Events Phase 1–3. It touches the existing public `EventTemplate` detail page (`app/event/[eventId]`), not anything net-new — so it ships in parallel, not after. Explicit call: **do not promise specialized Foxer Communities yet** (Running/Hiking/Basketball sub-communities) — that stays P3, deferred until the lighter moves below are validated. The near-term thesis is simply: *make every FoxPassport event easy to share, and make the shared link look excellent.*

| Pri | Work | Note |
|---|---|---|
| P0/P1 | **Fix event OG/social preview** | [x] **Completed:** Split `app/event/[eventId]/page.tsx` into Server Component exporting dynamic `generateMetadata` with full OpenGraph/Twitter card tags. Client logic moved to `EventDetailClient.tsx`. |
| P1 | **Event public/shareable URL** | [x] **Completed:** Verified and preserved (`/event/[eventId]`), tested with dynamic metadata. |
| P1 | **Event sharing/invitation UI** | [x] **Completed:** Built `EventShareModal.tsx` with Web Share API, clipboard copying, and QR code rendering (`react-qr-code`). Added Share buttons on desktop & mobile headers. |
| P1 | **QR / event registration flow** | [x] **Completed:** Integrated QR code modal display with scan verification pathway (`ticketCode`/`checkedIn`). |
| P1 | **Wire `Post.sharesCount`** | [x] **Completed:** Added `POST /v1/feed/:id/share` in API incrementing `sharesCount` and wired `trackPostShare` in app. |
| P3+ | **Advanced growth loops** (referrals, achievements, user-generated content, social proof) | After acquisition is proven — not part of the near-term sharing push. |
| P2 | Category/Subcategory taxonomy | Build as already planned (Dynamic Events Phase 1). |
| P2 | Category-based community/feed filtering | After taxonomy exists — filter/follow the existing single Republic feed by category, not a new feature. |
| P3 | Dedicated activity communities (Running/Hiking/Basketball Foxer Community) | Only when validated — not promised in the acquisition strategy yet. |
| P3+ | Deep social-platform integrations (native FB/IG/Discord APIs, etc.) | Add selectively, later. |

## P2 — Before Dynamic Events Phase 1 can start

- [ ] **Reconcile the `CAPACITY → REGISTRATION` capability dependency.** Confirmed intentional in both `DYNAMIC-EVENTS-PRODUCT-MASTER.md` §16 and `DYNAMIC-EVENTS-PROJECT-MASTER.md` §11, but it contradicts current behavior — `maxAttendees` on `EventTemplate` already caps private-booking events with no registration capability at all. Decide: drop the `CAPACITY → REGISTRATION` edge, or redefine `REGISTRATION` in that graph to mean "some attendee-tracking mechanism" (booking OR public) rather than specifically the new public flow.
- [ ] **Map the 5 legacy `EventCategory` enum values into the new taxonomy** (`corporate`, `birthday`, `wedding`, `social`, `other` → which Category/Subcategory each becomes) before the Phase 1 migration runs, so nothing already in the database is orphaned.
- [x] **ADR written** — [`docs/adr/0001-dynamic-events-architecture.md`](./adr/0001-dynamic-events-architecture.md), 12 Sep. Reconciles all three Dynamic Events docs plus an external recommendation doc reviewed the same day.
  - [ ] **One thing the ADR surfaced that it can't resolve itself:** `DYNAMIC-EVENTS-PLAN.md` (resequenced 11 Sep, MVP-first) disagrees with `DYNAMIC-EVENTS-PRODUCT-MASTER.md` + `DYNAMIC-EVENTS-PROJECT-MASTER.md` + the external doc (all three still Taxonomy-first) on phase order. Needs an explicit product-priority call — see the ADR's "Still open" section for both sides' reasoning.
- [ ] Confirm Decision Point Zero and §3a are explicitly approved (currently inferred from the Product Master doc being marked Active, not separately confirmed).
- [ ] **Name and scope a lightweight event-operator role.** `"Partner"` is taken — `investor` already displays as **"Partner Foxer"** in the UI (`roles.ts:71`) and means capital/inventory/venue-equity/sponsorship. A registration/check-in-only partner (run clubs, community organizers) needs its own name (e.g. "Event Operator") and a lighter application flow than full `EventFoxer` KYC (BIR permit, NBI, portfolio, ID, TIN).

## P3 — New work, nothing broken, do after P0–P2

- [ ] **Kick off Dynamic Events Phase 1 (Taxonomy)** — TASK-01 through TASK-10 per `DYNAMIC-EVENTS-PROJECT-MASTER.md` §9, once the P2 items above are settled.

---

*Related docs: `DYNAMIC-EVENTS-PLAN.md`, `DYNAMIC-EVENTS-PRODUCT-MASTER.md`, `DYNAMIC-EVENTS-PROJECT-MASTER.md`, `REDIS-PLAN.md`, `VERIFY.md`.*
