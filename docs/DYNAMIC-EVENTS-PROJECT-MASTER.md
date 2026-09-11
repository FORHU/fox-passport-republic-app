# FoxPassport Republic — Project Management Master Document

**Document Type:** Project Management
**Version:** 2.0
**Status:** Active
**Date:** 11 September 2026

## 1. Purpose

This document defines how FoxPassport development work is planned, organized, assigned, executed, monitored, tested, released, and closed.

The Project Manager is responsible for:

- HOW
- WHEN
- WHO
- DEPENDENCIES
- DELIVERY
- RISKS
- STATUS

This document is focused on project execution and delivery, not product strategy.

## 2. Project Management Objectives

The project management process ensures that:

- Product requirements become actionable development work.
- Developers understand their assigned responsibilities.
- Dependencies are identified early.
- Risks are visible.
- Scope changes are controlled.
- Development progress is measurable.
- Testing is included in delivery.
- Releases are properly controlled.
- Blockers are escalated quickly.
- Product and engineering remain aligned.

## 3. Separation of Responsibilities

**Product Manager** owns: WHAT, WHY, WHO IS THE USER, PRIORITY, PRODUCT OUTCOME

**Project Manager** owns: HOW THE WORK IS ORGANIZED, WHEN IT SHOULD BE DELIVERED, WHO IS ASSIGNED, DEPENDENCIES, PROJECT STATUS, DELIVERY RISKS

**Technical Lead / Architect** owns: TECHNICAL ARCHITECTURE, TECHNICAL DESIGN, ENGINEERING QUALITY, TECHNICAL STANDARDS

**Developers** own: IMPLEMENTATION, UNIT/INTEGRATION TESTS, CODE QUALITY, TECHNICAL FEEDBACK

**QA** owns: TEST EXECUTION, REGRESSION TESTING, BUG VALIDATION, QUALITY REPORTING

## 4. Delivery Lifecycle

```
Product Requirement → Product Decision → Technical Assessment → Project Breakdown
→ Task Assignment → Development → Code Review → QA → Product Validation
→ Staging → Release → Monitoring → Project Closure
```

## 5. Work Hierarchy

```
EPIC → FEATURE → USER STORY → TASK → SUBTASK
```

Example:

- **EPIC:** Dynamic Events
- **FEATURE:** Event Taxonomy
- **USER STORY:** EventFoxer can select an event category.
- **TASK:** Create Category Prisma model.
- **SUBTASK:** Create migration. Seed categories. Create repository. Add tests.

## 6. Project Lifecycle

**Phase 0 — Discovery:** Review existing implementation, schema, API, frontend. Identify existing/missing functionality, constraints, dependencies.

**Phase 1 — Planning:** Confirm requirements, break into tasks, estimate effort, identify owners/dependencies/risks, define sprint scope.

**Phase 2 — Development:** Implement, code review, automated tests, track blockers, update status.

**Phase 3 — QA:** Functional, regression, API, UI, permission, edge-case testing.

**Phase 4 — Product Validation:** PM validates user flow, product behavior, acceptance criteria, business requirements.

**Phase 5 — Release:** Merge, deploy to staging, smoke test, deploy to production, monitor.

## 7. Dynamic Events Project

Dynamic Events should be managed as a dedicated project Epic.

```
EPIC: Dynamic Events
```

Approved architecture:

```
EventTemplate → Dynamic Configuration → Capabilities → Public Participation
```

while preserving `Event → Booking → BookingAttendee` for the existing private booking flow.

## 8. Dynamic Events — Phase 0: Architecture Decision

Before database implementation begins, the team must confirm:

- `EventTemplate` = reusable/public event definition
- `Event` = existing event/client booking occurrence
- `Booking` = existing booking transaction
- `BookingAttendee` = existing booking attendee model
- Public event participation is additive.

**Exit criteria:** Architecture approved. Existing relationships documented. Migration impact reviewed. Developers understand the new domain boundaries.

## 9. Dynamic Events — Phase 1: Event Taxonomy

**Scope:** `Category`, `Parent Category`, `Subcategory`, `Tag`, `EventTag`

**Tasks:**

| Task | Description |
|---|---|
| TASK-01 | Design Category schema |
| TASK-02 | Create Prisma migration |
| TASK-03 | Seed existing categories |
| TASK-04 | Create category repository |
| TASK-05 | Update EventTemplate category logic |
| TASK-06 | Add category filtering |
| TASK-07 | Implement tag management |
| TASK-08 | Add backend tests |
| TASK-09 | Implement frontend category selector |
| TASK-10 | Implement frontend tag selector |

**Migration rule:** Additive. Existing category data must be preserved.

**Exit criteria:** Existing EventTemplates continue working. Existing categories preserved. New categories addable without code changes. Search/filter works. Tests pass.

## 10. Dynamic Events — Phase 2: Capability Framework

Implement `EventCapability`, `EventTemplateCapability`.

Initial capabilities: `REGISTRATION`, `CAPACITY`, `CHECK_IN`, `TICKETING`, `SESSIONS`, `SPEAKERS`

**Tasks:**

| Task | Description |
|---|---|
| TASK-01 | Create capability enum |
| TASK-02 | Create EventTemplateCapability model |
| TASK-03 | Create capability service |
| TASK-04 | Implement capability dependency validation |
| TASK-05 | Gate registration functionality |
| TASK-06 | Gate capacity functionality |
| TASK-07 | Gate check-in functionality |
| TASK-08 | Implement cache invalidation |
| TASK-09 | Add API tests |
| TASK-10 | Implement capability configuration UI |

## 11. Capability Dependencies

The backend must enforce:

- `TICKETING` requires `REGISTRATION`
- `CHECK_IN` requires `REGISTRATION`
- `CAPACITY` requires `REGISTRATION`

The frontend may disable invalid combinations, but the backend remains authoritative.

> **Open reconciliation item (carried from `DYNAMIC-EVENTS-PLAN.md`):** this is now confirmed, in two separate documents, as an intentional dependency — not a typo. It still needs reconciling against current behavior, where `maxAttendees` on `EventTemplate` already caps private-booking events with no registration capability at all. Decide: drop the `CAPACITY → REGISTRATION` edge, or redefine `REGISTRATION` in this graph to mean "some attendee-tracking mechanism" (booking OR public) rather than specifically the new public flow.

## 12. Dynamic Events — Phase 3: Format and Visibility

Implement `format` (`IN_PERSON`, `VIRTUAL`, `HYBRID`) and `visibility` (`PUBLIC`, `PRIVATE`, `UNLISTED`).

**Migration:** existing `isPublic` must remain compatible during migration.

**Tasks:** Add format field. Add visibility field. Add validation. Update API. Update frontend. Update filtering. Add tests. Verify backward compatibility.

**Exit criteria:** Existing templates remain functional. New visibility options work. Format validation works. API tests pass. UI reflects the new state.

## 13. Dynamic Events — Phase 4: Public Event Participation

Introduces the new public participation domain. **Do not simply repurpose `BookingAttendee`.**

```
Event → EventRegistration → Participant
```

**Tasks:**

| Task | Description |
|---|---|
| TASK-01 | Finalize public event occurrence model |
| TASK-02 | Create EventRegistration model |
| TASK-03 | Create registration service |
| TASK-04 | Create registration API |
| TASK-05 | Create cancellation flow |
| TASK-06 | Implement capacity validation |
| TASK-07 | Implement waitlist |
| TASK-08 | Implement participant list |
| TASK-09 | Integrate check-in |
| TASK-10 | Add backend tests |
| TASK-11 | Implement frontend registration flow |
| TASK-12 | Implement participant management UI |

**Exit criteria:** User can register. Limits enforced. Cancellation works. Waitlist works where enabled. Check-in works. Unauthorized access rejected. Existing Booking flow unaffected.

## 14. Dynamic Events — Phase 5: Ticketing

Implement `EventTicketTier`, `EventTicket` (e.g. General / VIP / Student).

**Tasks:** Ticket tier CRUD. Ticket inventory. Ticket purchase. Payment integration. Ticket generation. Ticket validation. Ticket cancellation. Refund handling. Check-in integration. Tests.

**Dependency:** Ticketing requires `REGISTRATION`. Reuse existing payment infrastructure.

## 15. Dynamic Events — Phase 6: Sessions and Speakers

Implement `EventSession`, `EventSpeaker`.

**Tasks:** Speaker management. Session management. Session scheduling. Speaker assignment. Public schedule. Frontend display. API tests.

## 16. Deferred Dynamic Event Features

Not in the initial implementation unless specifically approved: Teams, Sponsors, Vendor-as-Capability, Livestream, Certificates, Advanced Registration Forms, Advanced Analytics.

## 17–23. Process Scaffolding

Sprint planning, sprint goals, task status vocabulary (`BACKLOG → READY → IN PROGRESS → BLOCKED → CODE REVIEW → QA → PRODUCT REVIEW → READY FOR RELEASE → DONE → CANCELLED`), Definition of Ready/Done, the developer task template (Title/Context/Objective/Scope/Technical Notes/Acceptance Criteria/Tests/Dependencies/Out of Scope/Definition of Done), and blocker documentation (Blocker/Owner/Dependency/Date Raised/Expected Resolution/Impact) — standard process scaffolding, unchanged from the source document.

## 24. Risk Management (RAID Log)

| ID | Type | Description | Impact | Owner | Status |
|---|---|---|---|---|---|
| R-001 | Risk | Public registration may conflict with existing booking assumptions | High | Technical Lead | Open |
| D-001 | Dependency | Ticketing depends on public registration | High | Project Manager | Open |
| I-001 | Issue | Existing category enum limits Dynamic Events | Medium | Backend Developer | Open |

## 25–39. Process Scaffolding

Change management (Change Request → Impact Assessment → Product Decision → Technical Assessment → Schedule/Effort Assessment → Approval → Backlog Update), database change management (identify affected models/FKs/data/backward-compatibility, test migration, review rollback, verify API/frontend impact — **for Dynamic Events specifically: never change the meaning of `Event` without reviewing every `eventId` relationship and dependent business flow**), API/frontend delivery requirements (backend stays authoritative for permissions, capability rules, capacity, registration state, ticket state, financial rules — frontend visibility is never authorization), code review checklist, QA coverage requirements, release process/checklist, weekly reporting format, project health indicators (🟢/🟡/🔴), team capacity guidance (70–80% planned feature work, 20–30% operational overhead), the product-to-project handoff, and escalation rules — standard process scaffolding, unchanged from the source document.

## 40. Core Project Principle

The project team should deliver the approved product outcome safely, predictably, and with controlled scope. A feature is successfully delivered when Product Requirement + Technical Implementation + Quality + Product Validation + Successful Release are all satisfied.

## 41. Final Project Management Rule

For Dynamic Events:

**DO NOT:** redesign the entire Event domain → break existing booking flows → migrate unrelated systems unnecessarily.

**Instead:** Preserve Existing Event Architecture → Expand EventTemplate → Add Dynamic Configuration → Add Capabilities → Add Public Participation → Add Ticketing.

The project manager's responsibility is to ensure this evolution happens in controlled, testable, incremental phases.

---

*Companion to `DYNAMIC-EVENTS-PLAN.md` (technical plan) — this document governs how that plan gets executed, not what it contains.*
