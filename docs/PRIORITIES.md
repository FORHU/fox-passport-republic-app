# Pending Priorities

**Last updated:** 11 September 2026
**Purpose:** single tracked list across both open threads (Redis/caching branch, Dynamic Events). Check items off and flag anything that needs discussion when picking this back up.

---

## P0 — Live bug, blocking

- [ ] **Merge `feat/auth-03-api-cookies`.** The API's cookie authorship has been live on `main` since PR #77 (8 Sep), but the app's half is still unmerged — that mismatch is what's currently causing a logout that doesn't actually log anyone out.
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

## P2 — Before Dynamic Events Phase 1 can start

- [ ] **Reconcile the `CAPACITY → REGISTRATION` capability dependency.** Confirmed intentional in both `DYNAMIC-EVENTS-PRODUCT-MASTER.md` §16 and `DYNAMIC-EVENTS-PROJECT-MASTER.md` §11, but it contradicts current behavior — `maxAttendees` on `EventTemplate` already caps private-booking events with no registration capability at all. Decide: drop the `CAPACITY → REGISTRATION` edge, or redefine `REGISTRATION` in that graph to mean "some attendee-tracking mechanism" (booking OR public) rather than specifically the new public flow.
- [ ] **Map the 5 legacy `EventCategory` enum values into the new taxonomy** (`corporate`, `birthday`, `wedding`, `social`, `other` → which Category/Subcategory each becomes) before the Phase 1 migration runs, so nothing already in the database is orphaned.
- [ ] **Formalize the ADR.** `DYNAMIC-EVENTS-PLAN.md` + `DYNAMIC-EVENTS-PRODUCT-MASTER.md` + `DYNAMIC-EVENTS-PROJECT-MASTER.md` already contain everything one needs (problem, options, decision, rationale) — just not yet assembled as a single decision record per the Product Master's own §23 process.
- [ ] Confirm Decision Point Zero and §3a are explicitly approved (currently inferred from the Product Master doc being marked Active, not separately confirmed).

## P3 — New work, nothing broken, do after P0–P2

- [ ] **Kick off Dynamic Events Phase 1 (Taxonomy)** — TASK-01 through TASK-10 per `DYNAMIC-EVENTS-PROJECT-MASTER.md` §9, once the three P2 items above are settled.

---

*Related docs: `DYNAMIC-EVENTS-PLAN.md`, `DYNAMIC-EVENTS-PRODUCT-MASTER.md`, `DYNAMIC-EVENTS-PROJECT-MASTER.md`, `REDIS-PLAN.md`, `VERIFY.md`.*
