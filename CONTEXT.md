---
domain: Fox Passport Republic
updated: 2026-07-24
---

# Domain Glossary

A glossary of canonical terms used across the Fox Passport Republic platform.
This file is the source of truth for ubiquitous language — code, APIs, and UI copy should align with these definitions.

## Roles

**Citizen**
A registered platform user who discovers venues, books events, and collects Passport stamps.
Code: `systemRole: "user"`, `roleType: []`.
_Avoid_: Regular user, plain user

**RoleType**
A supply-side capability a Citizen can apply for and be approved to hold. Multiple RoleTypes may be held simultaneously — they are additive, not exclusive.
Values: `venueFoxer`, `eventFoxer`, `gearFoxer`, `serviceFoxer`, `investor`.
Distinct from `systemRole` (`user`/`admin`/`super_admin`), which governs platform administration.
_Avoid_: Role (ambiguous with systemRole), permission

**VenueFoxer**
A Citizen approved to list and manage Venues. A Venue is bare space — VenueFoxers don't sell experiences standalone; they earn only when an EventFoxer selects their Venue into an Event Template.
Code: `roleType` includes `"venueFoxer"`.
_Avoid_: Mayor (old name)

**EventFoxer**
A Citizen approved to assemble Event Templates: attaches an existing Venue (from a VenueFoxer) plus Assets/Services (from GearFoxers/ServiceFoxers), then submits for admin approval. Curates and coordinates — does not supply their own Venue, Assets, or Services.
Code: `roleType` includes `"eventFoxer"`.
_Avoid_: Host (old name)

**GearFoxer**
A Citizen approved to supply physical Assets (equipment, furniture, decorations, sound systems, etc.) into the marketplace for standalone booking or attachment to Event Templates.
Code: `roleType` includes `"gearFoxer"`.
_Avoid_: FoxerAsset, Asset Foxer (old names)

**ServiceFoxer**
A Citizen approved to supply Services (catering, entertainment, design, staffing, etc.) into the marketplace for standalone booking or attachment to Event Templates.
Code: `roleType` includes `"serviceFoxer"`.
_Avoid_: FoxerService, Service Foxer (old names)

**Foxer**
Umbrella term for a GearFoxer or ServiceFoxer — anyone supplying inventory. Used when the distinction between the two doesn't matter.

**Investor**
A Citizen approved as a financial stakeholder. Application requires proof of funds and an investment range, unlike operational RoleTypes.
Code: `roleType` includes `"investor"`.

**Admin / Super Admin**
Platform operators who approve content submissions and manage all entities.
Code: `systemRole: "admin"` or `"super_admin"`.

---

## Core Concepts

**Passport**
A Citizen's gamification profile. Tracks stamps collected, badges earned, and events attended.

**Stamp**
A collectible awarded to a Citizen after attending an event or visiting a Venue.

**Specialization**
A category tag on a Foxer's profile and listings showing their area of focus. Two forms:
- *Claimed* — declared at role-application time, admin-backed, capped at 3 per RoleType
- *Earned* — auto-granted after 3 completed bookings in that category with 4.0+ average rating, unlimited count, never revoked

**Event Template**
A reusable event package created by an EventFoxer. Attaches a Venue, Assets, and Services; sets pricing via Host Markup; submitted for admin approval before it becomes bookable.

**Venue**
A physical space listed by a VenueFoxer. Has capacity, base rate, location, gallery, and feature lists (spaceType, amenities, techAv, staffing, policies).

**Asset**
A physical item (equipment, furniture, sound system, etc.) listed by a GearFoxer for rental.

**Service**
A professional offering (photography, DJ, catering, etc.) listed by a ServiceFoxer.

**Venue Studio**
The venue builder UI used by VenueFoxers to create and configure a Venue. Five palette tabs: Space Types, Tech & AV, Amenities, Staffing, Policies. Tech & AV, Amenities, and Staffing are pre-populated from a server-side catalog (`GET /api/v1/venues/catalog`); Space Types and Policies are manual-only.

**Host Markup**
The percentage an EventFoxer adds on top of an Event Template's attached items' agreed prices — this is how an EventFoxer earns.
_Avoid_: Host fee, commission

**Platform Fee**
The percentage the platform takes on every transaction, added on top of (itemsTotal + Host Markup). Not carved out of any role's earnings.

**Booking**
A confirmed reservation linking a Citizen, an Event Template (or direct Venue/Asset/Service), dates, and a payment.

---

## Status States

| Entity | States |
|---|---|
| Venue | `draft` → `pending` → `available` / `rejected` / `archived` |
| Asset | `draft` → `pending` → `available` / `reserved` / `rejected` / `archived` |
| Service | `draft` → `pending` → `available` → `paused` / `archived` / `rejected` |
| Event Template | `draft` → `pending` → `published` / `rejected` / `archived` |
| Booking | `pending` → `confirmed` → `active` → `completed` / `cancelled` / `disputed` |
| Role Application | `pending` → `approved` / `rejected` |

---

## What This Glossary Is NOT

This file does not contain implementation details, file paths, API contracts, or architectural decisions.
Those belong in `docs/adr/` or code comments.
