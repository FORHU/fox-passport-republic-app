---
domain: Fox Passport Republic
updated: 2026-08-27
---

# Domain Glossary

A glossary of canonical terms used across the Fox Passport Republic platform.
This file is the source of truth for ubiquitous language — code, APIs, and UI copy should align with these definitions.

The role vocabulary here mirrors the API's `RoleType` / `SystemRole` Prisma enums.
When they disagree, the schema wins — see `fox-passport-republic-api/CONTEXT.md`.

## Roles

**Citizen**
A registered platform user who discovers venues, books events, and collects Passport stamps.
Code: `systemRole: "user"`, `roleType: []`.
_Avoid_: Regular user, plain user

**RoleType**
A supply-side capability a Citizen can apply for and be approved to hold. Multiple RoleTypes may be held simultaneously — they are additive, not exclusive.
Values: `venueFoxer`, `eventFoxer`, `gearFoxer`, `serviceFoxer`, `investor`.
Distinct from `systemRole` (`user`/`admin`), which governs platform administration.
There is no `super_admin` — `enum SystemRole` in `schema.prisma` has exactly two values.
_Avoid_: Role (ambiguous with systemRole), permission

**VenueFoxer**
A Citizen approved to list and manage Venues. A Venue is bare space — VenueFoxers don't sell experiences standalone; they earn only when an EventFoxer selects their Venue into an Event Template.
Code: `roleType` includes `"venueFoxer"`.
_Avoid_: Mayor (old name)

**EventFoxer**
A Citizen approved to assemble Event Templates: attaches an existing Venue (from a VenueFoxer) plus Assets/Services (from GearFoxers/ServiceFoxers), then submits for admin approval. Curates and coordinates — does not supply their own Venue, Assets, or Services. Also acts as program manager for the event, coordinating all suppliers (decorations, catering, etc.) to deliver the full experience.
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

---

## Core Concepts

**Citizen ID**
A permanent, human-readable identifier assigned to every Citizen at signup. Format: `FX-{YYYY}-{5-digit sequential}` (e.g. `FX-2026-00481`). Stored as `citizenId` on the User record. Displayed prominently on the Passport booklet card.
_Avoid_: User ID (that's the internal UUID), account number

**Passport**
A Citizen's gamification profile. Tracks stamps collected, badges earned, XP earned, and level progress per Path.

**Path**
A per-RoleType XP progression track. Each Citizen has one Path per role they hold (`user`, `eventFoxer`, `venueFoxer`, `gearFoxer`, `serviceFoxer`, `investor`). Levels and tier labels are independent per Path.

**Level**
A numeric milestone within a Path, earned by accumulating XP. XP required per level scales by 15% per level (`XP_PER_LEVEL = 1000` base). Each Path has named tier labels at milestone levels:

| Path | Tier sequence |
|---|---|
| Citizen (`user`) | Newcomer (1) → Explorer (5) → Adventurer (10) → Trailblazer (15) → VIP Explorer (20) |
| EventFoxer | Event Starter (1) → Event Planner (3) → Event Pro (7) → Premium Creator (12) → Super Creator (18) |
| VenueFoxer | Ward Officer (1) → District Head (3) → City Planner (7) → City Leader (12) → Grand Foxer (18) |
| GearFoxer | Starter Foxer (1) → Social Butterfly (5) → Event Curator (10) → Master Foxer (15) → Elite Foxer (20) |
| ServiceFoxer | Starter Foxer (1) → Social Butterfly (5) → Event Curator (10) → Master Foxer (15) → Elite Foxer (20) |
| Investor | Seed Funder (1) → Angel Investor (3) → Venture Partner (6) → Major Stakeholder (10) → Elite Investor (15) |

**Badge**
A collectible unlocked by completing specific achievements within a Path. Has a rarity tier: Common, Uncommon, Rare, Epic, Legendary. Rarity determines visual treatment (color/glow).

**VIP Status**
A cross-path prestige tier earned by sustained activity across roles: Bronze → Silver → Gold → Platinum. Distinct from Path Level — it is an aggregate status, not per-Path.

**Stamp**
A collectible awarded to a Citizen when a Booking reaches `completed` status. Triggered by event completion, not booking confirmation — a no-show or cancellation does not earn a Stamp.

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

**Match**
A confirmed two-way connection between any two platform participants. The same entity covers two collaboration patterns:
- *Citizen ↔ Foxer* — a Citizen selects and connects with a Foxer; leads toward a Booking.
- *Foxer ↔ Foxer* — two supply-side participants connect so they can collaborate; an EventFoxer can add a matched GearFoxer or ServiceFoxer directly into their Event Template builder and negotiate pricing within that match.

A Match begins as a Match Request (pending), becomes a Match once both parties accept. The match score (expressed as a percentage) represents compatibility based on specializations and history.
_Avoid_: Partner, connection, collaboration (use Match)

**Booking**
A confirmed reservation linking a Citizen, an Event Template (or direct Venue/Asset/Service), dates, and a payment. Each Booking has a unique `ticketCode` — format `BKG-{10 uppercase hex chars}` (e.g. `BKG-A3F72E8C41`) — used for check-in scanning and receipts.
_Avoid_: confirmation code, booking code

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

**Note:** KYC (identity and document verification) is not a separate process — it is the document-upload step within a Role Application. The `/kyc` screen is a status view of the same Role Application, not an independent entity.

---

## What This Glossary Is NOT

This file does not contain implementation details, file paths, API contracts, or architectural decisions.
Those belong in code comments, or in the ADRs — which live in the **API** repo at
`fox-passport-republic-api/docs/adr/`, not here:

- `0001-host-markup-and-server-computed-event-total.md`
- `0002-stripe-connect-payouts.md`

Ongoing engineering trackers are in [`docs/`](./docs/); start at
[`docs/TOMORROW.md`](./docs/TOMORROW.md).
