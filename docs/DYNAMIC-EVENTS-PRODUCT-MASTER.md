# FoxPassport Republic — Product Management Master Document

**Document Type:** Product Management
**Version:** 2.0
**Status:** Active
**Date:** 11 September 2026

## 1. Purpose

This document defines the product vision, strategy, requirements, priorities, roadmap, and product decision framework for FoxPassport Republic.

The Product Manager is responsible for defining: what the product should do, why it should do it, who it is for, what problems it solves, what should be prioritized, what should be deferred, and what product outcome is expected.

This document is focused on product direction, not development task management.

## 2. Product Vision

FoxPassport is a community experience platform where people can discover, create, participate in, and build experiences through events, venues, gear, services, and community activities.

FoxPassport should not be restricted to a fixed set of event types. The platform should be capable of supporting new types of experiences without requiring a new architecture for every category — weddings, birthdays, corporate events, hiking, camping, concerts, festivals, conferences, workshops, seminars, sports activities, community meetups, online events, hybrid events, and future event types.

## 3. Product Mission

FoxPassport connects People + Experiences + Events + Venues + Gear + Services + Community into one ecosystem.

Desired user journey:

```
Discover → Understand → Book / Register → Participate → Attend → Build Experience
```

## 4. Product Principles

**4.1 Capability Over Hard-Coded Event Types.** Avoid `HikingEvent`, `ConcertEvent`, `WeddingEvent`, `ConferenceEvent`. Prefer `EventTemplate` + Category + Subcategory + Tags + Format + Capabilities.

**4.2 Capability Is Not Ownership.** The system must distinguish: creating an event, owning a venue, providing equipment, providing services, participating in an event, booking an event. These are separate business concepts.

**4.3 Preserve Existing Business Meaning.** The existing event architecture already supports a marketplace booking flow. The product direction must not unnecessarily break it:

```
EventTemplate → Event → Booking → BookingAttendee → Vendor / Escrow
```

This remains a valid FoxPassport business flow.

## 5. Current Product Model

FoxPassport currently operates primarily as an event-booking marketplace. An EventFoxer can assemble an event offering using Venues, Assets/Gear, and Services. Citizens can discover and book these experiences.

Supporting business capabilities: payments, vendor payouts, escrow, event requests, waitlists, check-in, role applications, admin approval, notifications, community functionality.

Dynamic Events should extend this foundation rather than replace it.

## 6. User Roles

- **Citizen** — the default FoxPassport user. Can discover experiences, browse events, book events, register for public events, attend events, manage participation, participate in the community.
- **EventFoxer** — creates and manages event offerings: event definitions, configuration, publishing, organization, capabilities.
- **VenueFoxer** — provides venues.
- **GearFoxer** — provides equipment and assets.
- **ServiceFoxer** — provides professional services.
- **Investor** — represents a separate funding/business capability, kept separate from normal event permissions.
- **Admin** — platform governance and operational control.

## 7. Dynamic Events Product Strategy

Core principle: an event is defined by its category, characteristics, format, and enabled capabilities rather than by a fixed event type.

The reusable product definition is `EventTemplate`, which can contain: Category, Subcategory, Tags, Format, Visibility, Capabilities, Configuration, Venue, Assets, Services.

## 8. EventTemplate vs Event

**EventTemplate** represents a reusable event definition or event offering (e.g. "Weekend Hiking Adventure"). Describes what the event *is*.

**Event** represents an actual occurrence or client-specific event generated from the existing business flow. The existing meaning of `Event` should remain intact.

## 9. Two Participation Models

**9.1 Private Booking** (existing marketplace flow):

```
EventTemplate → Client → Event → Booking → BookingAttendee → Vendor Transactions / Escrow
```

Example: a company books a corporate event for 80 employees.

**9.2 Public Event** (new community participation flow):

```
EventTemplate → Published Event / Occurrence → Multiple Participants → Registration → Ticket → Check-in
```

Example: an EventFoxer publishes a hiking event that 30 Citizens can join independently.

## 10. Critical Product Decision

The existing `Event` entity should not be redefined as a universal public-event entity. Changing its meaning could affect existing bookings, vendor escrow, event requests, existing foreign keys, historical transactions, partner relationships, and existing business logic.

**Therefore:** keep the existing `Event` domain and add public participation as an additional capability/domain.

## 11. Event Taxonomy

The current fixed event category approach should evolve into a database-driven taxonomy:

```
Outdoor    ├─ Hiking, Camping, Adventure
Sports     ├─ Basketball, Cycling, Running
Music      ├─ Concert, Festival
Education  ├─ Workshop, Seminar
Business   ├─ Conference, Corporate
Social     ├─ Birthday, Meetup
```

New categories should be configurable without requiring application code changes.

> **Open reconciliation item (carried from `DYNAMIC-EVENTS-PLAN.md`):** this example taxonomy doesn't show where the current five `EventCategory` enum values (`corporate`, `birthday`, `wedding`, `social`, `other`) land as subcategories. Needs an explicit mapping before the Phase 2 (Taxonomy) migration runs, so nothing already in the database is orphaned.

## 12. Tags

Tags support flexible discovery, separate from category classification. Example: Category `Outdoor` / Subcategory `Hiking` / Tags `Baguio`, `Beginner`, `Nature`, `Weekend`, `Family-Friendly`.

## 13. Event Formats

`IN_PERSON` (physical location required), `VIRTUAL` (virtual access info required), `HYBRID` (both required).

## 14. Event Visibility

`PUBLIC` (discoverable through the platform), `PRIVATE` (restricted to authorized/invited participants), `UNLISTED` (not publicly discoverable, accessible via direct link).

## 15. Event Capabilities

Modular. Initial: `REGISTRATION`, `CAPACITY`, `CHECK_IN`, `TICKETING`, `SESSIONS`, `SPEAKERS`. Future: `TEAMS`, `SPONSORS`, `VENDORS`, `LIVESTREAM`, `REQUIREMENTS`, `ADVANCED_FORMS`, `CERTIFICATES`. Only capabilities that provide actual product value should be implemented.

## 16. Capability Dependencies

```
TICKETING → REGISTRATION
CHECK_IN  → REGISTRATION
CAPACITY  → REGISTRATION
```

Backend must enforce these rules; frontend only represents the available configuration.

> **Open reconciliation item:** `CAPACITY → REGISTRATION` conflicts with current behavior — `maxAttendees` on `EventTemplate` already caps private-booking events that have no registration capability at all. See the same item tracked in `DYNAMIC-EVENTS-PROJECT-MASTER.md` §11.

## 17. Public Registration

The existing `BookingAttendee` model should **not** automatically become the public event registration system — it represents attendees associated with a *booking*. Public participation should have its own concept:

```
Event → EventRegistration → User, Status, RegisteredAt, Ticket, CheckIn
```

This allows independent Citizens to participate in public events.

## 18. Ticketing

Implemented after the public registration model is established:

```
Event → TicketTier (General / VIP / Student) → Ticket → Participant
```

Existing payment infrastructure should be reused where appropriate.

## 19. Sessions and Speakers

Separate entities:

```
Event → Session (Title, Start, End, Speaker)
      → Speaker (Name, Bio, Image)
```

Enables conferences, seminars, workshops, panels, training events.

## 20. Product Roadmap

**Resequenced 13 Sep** to MVP-first — see `docs/adr/0001-dynamic-events-architecture.md`'s "Decided 13 Sep" section for the reasoning. Phase 1 used to be Taxonomy; it is now Public Event MVP, and every phase after it shifted down one slot. Task content is unchanged from before this resequencing — only the order changed.

- **Phase 0 — Architecture Decision:** `EventTemplate` remains reusable/public definition; `Event` remains existing occurrence; public registration is additive.
- **Phase 1 — Public Event MVP:** A minimal `EventRegistration` capability (join/leave, capacity check against `EventTemplate.maxAttendees`, check-in reuse) — no taxonomy, no capability toggles, no ticketing yet. Proves a stranger can find and join a public event before any supporting infrastructure is built. Full technical detail in `DYNAMIC-EVENTS-PLAN.md` §4 Phase 1.
- **Phase 2 — Taxonomy:** Categories, subcategories, tags, search, filtering.
- **Phase 3 — Event Configuration:** Format, visibility, capability framework, capability dependencies. Formalizes Phase 1's hardcoded public/registration behavior behind explicit per-template toggles — retrofitting what was proven ad hoc, not building it from scratch.
- **Phase 4 — Public Participation:** Extends the Phase 1 MVP's registration model with capacity, waitlist, and cancellation handling now that Phase 3 has given it a formal capability to hang off — not a separate, from-scratch domain.
- **Phase 5 — Ticketing:** Ticket tiers, inventory, purchase, payment, ticket codes, cancellation, refund rules.
- **Phase 6 — Sessions and Speakers:** Sessions, speakers, scheduling, public event schedule.
- **Phase 7 — Advanced Capabilities (deferred until demand justifies them):** Teams, sponsors, vendors, livestream, certificates, advanced registration forms, advanced analytics.

## 21. Product Prioritization Framework

Evaluate features using: User Value + Business Value + Strategic Value + Technical Risk + Implementation Effort + Dependencies. Do not prioritize features merely because they are technically interesting.

## 22. Product Requirements

Every significant feature should define: Problem, Target User, Goal, Scope, Non-Scope, User Stories, Acceptance Criteria, Dependencies, Risks, Success Metrics.

## 23. Product Decision Framework

```
Problem → Options → Impact Analysis → Recommendation → Decision → Documentation
```

Major architectural/product decisions should be recorded in an ADR or equivalent decision record.

## 24. Product Metrics

- **Discovery:** event views, search activity, category usage, event saves.
- **Conversion:** template → booking, template → registration, registration → attendance.
- **Participation:** registrations, attendance, check-in rate, cancellation rate.
- **Marketplace:** event bookings, venue/asset/service usage, transaction value.
- **Retention:** returning Citizens, repeat participation, repeat EventFoxers.

## 25. Product Manager Responsibilities

Owns: product vision, strategy, roadmap, requirements, prioritization, user problems, business requirements, product decisions, acceptance criteria, product metrics, stakeholder alignment, scope decisions. Does not own daily developer task coordination.

## 26. Product Definition of Ready

Problem understood; target user identified; business objective clear; scope and non-scope defined; acceptance criteria exist; dependencies identified; major product decisions resolved; UX requirements sufficiently clear; technical feasibility reviewed.

## 27. Product Definition of Done

Requirements implemented; acceptance criteria pass; user flow works as intended; backend business rules enforced; important edge cases handled; documentation updated; product validation completed; stakeholder acceptance obtained.

## 28. Product Guardrails

The Product Manager should reject: duplicate event architectures, hard-coded event categories, unnecessary new domains, frontend-only business rules, breaking changes without migration plans, premature advanced features, features without a clear user/business problem.

## 29. Product North Star

Make FoxPassport capable of supporting almost any real-world experience while keeping the underlying product architecture stable, flexible, and understandable — growing through Configuration + Capabilities + Reusable Domains, not continuous creation of new event systems.

## 30. Final Product Direction

FoxPassport should evolve from a primarily event-booking marketplace into a broader community experience platform. The architecture should allow:

```
Any Event Type + Any Appropriate Format + Any Required Capability + Existing Marketplace Services
```

without requiring the core Event architecture to be redesigned every time a new experience is introduced.

---

*Companion to `DYNAMIC-EVENTS-PLAN.md` (technical plan) and `DYNAMIC-EVENTS-PROJECT-MASTER.md` (execution/delivery process) — this document owns the product direction those two execute against.*
