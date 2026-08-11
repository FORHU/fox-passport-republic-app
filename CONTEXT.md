---
domain: Fox Passport Republic
updated: 2026-08-11
---

# Domain Glossary

A glossary of canonical terms used across the Fox Passport Republic platform.
This file is the source of truth for ubiquitous language — code, APIs, and UI copy should align with these definitions.

The role vocabulary here mirrors the API's `RoleType` / `SystemRole` Prisma enums.
When they disagree, the schema wins — see `fox-passport-republic-api/CONTEXT.md`.

## Roles

**Citizen**
A registered platform user with no approved RoleType yet (`roleType: []`). The default state for every signed-up user.
RoleType is additive: gaining a role does not stop someone being a citizen.
Code: `systemRole: "user"`.

**RoleType**
A supply-side capability a citizen can apply for and be approved to hold: `venueFoxer`, `eventFoxer`, `gearFoxer`, `serviceFoxer`, or `investor`.
A user may hold several at once. Distinct from `SystemRole`, which governs platform administration rather than marketplace participation.

**Foxer**
Umbrella term for a `gearFoxer` or `serviceFoxer` — anyone supplying inventory (Assets or Services) into the marketplace.

**VenueFoxer**
Role-holder who owns and lists Venues. A Venue is bare space, so unlike an Asset or Service it isn't independently bookable — a VenueFoxer earns only when an EventFoxer selects their Venue into an Event. That is intentional, not a gap.
Code: `roleType: "venueFoxer"`. _Avoid_: Mayor (old name).

**EventFoxer**
Role-holder who assembles Events: an Event Template attaches an existing Venue plus Assets/Services, then spawns an Event Request for admin approval. Also acts as program manager, coordinating suppliers to deliver the event.
Code: `roleType: "eventFoxer"`. _Avoid_: Host (old name).

**GearFoxer**
Role-holder who supplies physical Assets (equipment, furniture, sound systems) for standalone booking or attachment to Event Templates.
Code: `roleType: "gearFoxer"`. _Avoid_: FoxerAsset, Asset Foxer (old names).

**ServiceFoxer**
Role-holder who supplies Services (catering, entertainment, staffing) for standalone booking or attachment to Event Templates.
Code: `roleType: "serviceFoxer"`. _Avoid_: FoxerService, Service Foxer (old names).

**Investor**
Role-holder who provides funding rather than operational supply. Application requires proof of funds and an investment range.
Code: `roleType: "investor"`.

**Admin**
Platform operator who approves content submissions and manages all entities.
Code: `systemRole: "admin"`.
There is no `super_admin`: `SystemRole` is exactly `user | admin`. Guards that tested for a super-admin tier could never match and have been removed.

---

## Core Concepts

**Passport**
A Citizen's gamification profile. Tracks stamps collected, badges earned, and events attended. Displayed at `/user/passport`.

**Stamp**
A collectible awarded to a Citizen after attending an event or visiting a Venue.

**Event Template**
A reusable event package created by an EventFoxer. Defines the event type, venue, included Assets/Services, dates, and cost. Citizens book from Event Templates.

**Venue**
A physical space listed by a VenueFoxer. Has capacity, base rate, location, and gallery.

**Asset**
Physical equipment (camera, sound system, lighting rig) that a GearFoxer rents out per event.

**Service**
A professional offering (photography, DJ, catering) that a ServiceFoxer provides per event or per hour.

**Experience**
A customised event configuration a Citizen assembles on the Venue detail page by selecting add-on Assets and Services before booking.

**Blueprint**
The financial summary sidebar in the Event Builder.

**Host Markup**
The percentage an EventFoxer adds on top of the summed prices of a template's attached items — this is how they earn. Set per template by the EventFoxer, not by the platform.
Code: `hostMarkupPct`. _Avoid_: commission (implies platform-set).

**Platform Fee**
The percentage the business takes on every transaction, added on top of what the citizen already sees (itemsTotal + Host Markup). It is an extra line item, never carved out of any role's earnings.
See `docs/adr/0002-stripe-connect-payouts.md` in the API.

**Specialization**
A category tag on a foxer's profile and listings. Either *Claimed* (declared at role-application time, admin-backed, max 3 per role) or *Earned* (auto-granted after 3 completed bookings in that category at 4.0+ average rating, unlimited, never revoked). Each role uses its own vocabulary: EventFoxer → EventCategory, ServiceFoxer → ServiceCategory, GearFoxer → AssetCategory, VenueFoxer → VenueCategory.

**Fulfillment**
The delivery/execution stage after a booking is confirmed.

**Booking**
A confirmed reservation linking a Citizen, an Event Template (or direct Venue/Asset/Service), dates, and a payment.

**Listing**
A published Asset or Service created by a Foxer, visible in the marketplace.

---

## Status States

Status values are sourced from backend Prisma enums — the frontend must mirror these exactly.

| Entity | States |
|---|---|
| Venue | `draft` → `pending` (admin review) → `available` / `rejected` / `archived` |
| Asset | `draft` → `pending` (admin review) → `available` / `reserved` / `rejected` / `archived` |
| Service | `draft` → `pending` (admin review) → `available` → `paused` / `archived` / `rejected` |
| Event Template | `draft` → `pending` (admin review) → `published` / `rejected` / `archived` |
| Booking | `pending` → `confirmed` → `active` → `completed` / `cancelled` / `disputed` |
| Role Application | `pending` → `approved` / `rejected` |

Notes:
- `"paused"` on Service is the Foxer's availability toggle (not a separate field) — only valid after `"available"`
- `"reserved"` on Asset is system-set when an asset is booked
- Event Template uses a single `status: EventTemplateStatus` field (`draft/pending/published/rejected/archived`) — not the `EventStatus` enum used by the spawned `Event` model
- An EventFoxer submits a template via `POST /event-templates/:id/submit` — only valid from `draft`, sets status to `pending`

---

## Routing Note

`/host` and `/mayor` are redirect shims kept from the pre-rename vocabulary; the live supply-side surface is `/creator-dashboard`. Use `getDashboardPath()` in `src/shared/lib/dashboard-path.ts` rather than re-deriving a landing route from roles.

---

## What This Glossary Is NOT

This file does not contain implementation details, file paths, API contracts, or architectural decisions.
Those belong in `docs/adr/` (Architecture Decision Records) or code comments.
