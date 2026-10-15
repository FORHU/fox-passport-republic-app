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
Values: `venueFoxer`, `eventFoxer`, `gearFoxer`, `serviceFoxer`, `performerFoxer`, `investor`.
Distinct from `systemRole` (`user`/`admin`), which governs platform administration.
There is no `super_admin` — `enum SystemRole` in `schema.prisma` has exactly two values.
_Avoid_: Role (ambiguous with systemRole), permission

**VenueFoxer**
A Citizen approved to list and manage Venues. A Venue is bare space — VenueFoxers don't sell experiences standalone; they earn only when an EventFoxer selects their Venue into an Event Template.
Code: `roleType` includes `"venueFoxer"`.
_Avoid_: Owner (for a venue — see **Mayor**)

**EventFoxer**
A Citizen approved to assemble Event Templates: attaches an existing Venue (from a VenueFoxer) plus Assets/Services (from GearFoxers/ServiceFoxers), then submits for admin approval. Curates and coordinates — does not supply their own Venue, Assets, or Services. Also acts as program manager for the event, coordinating all suppliers (decorations, catering, etc.) to deliver the full experience.
Code: `roleType` includes `"eventFoxer"`.
_Avoid_: Host (old name)

**GearFoxer**
A Citizen approved to supply physical Assets (equipment, furniture, decorations, sound systems, etc.) into the marketplace for standalone booking or attachment to Event Templates.
Code: `roleType` includes `"gearFoxer"`.
_Avoid_: FoxerAsset, Asset Foxer (old names)

**ServiceFoxer**
A Citizen approved to supply Services (catering, design, staffing, etc.) into the marketplace for standalone booking or attachment to Event Templates. Public-facing name is **Talent Foxer** — decided 14 Sep 2026, see `docs/BUSINESS-STRATEGY-MASTER.md` §11.5. `ServiceFoxer`/`serviceFoxer` remains the code-level term; use it in code, API, and this glossary. `entertainment` is a legacy `ServiceCategory` value here — new entertainment-type supply is PerformerFoxer, not ServiceFoxer.
Code: `roleType` includes `"serviceFoxer"`.
_Avoid_: FoxerService (old name)

**PerformerFoxer**
A Citizen approved to supply entertainment-type Services — photography, videography, DJ, live band, MC — via the same `Service` model ServiceFoxer uses. Public-facing name is **Performer Foxer**. Added 14 Sep 2026, re-keyed from the originally-planned `talentFoxer` to avoid colliding with ServiceFoxer's public name — see `docs/roles-and-spaces.md` §1.
Code: `roleType` includes `"performerFoxer"`; category values `photography`/`videography`/`dj`/`live_band`/`mc` (plus legacy `entertainment` for pre-migration listings).
_Avoid_: TalentFoxer (rejected key, collides with ServiceFoxer's public name)

**Foxer**
Umbrella term for a GearFoxer, ServiceFoxer or PerformerFoxer — anyone supplying inventory. Used when the distinction between them doesn't matter. Same grouping as **Provider** in `docs/roles-and-spaces.md`.

**Investor**
A Citizen approved as a financial stakeholder. Application requires proof of funds and an investment range, unlike operational RoleTypes.
Code: `roleType` includes `"investor"`.

**Organizer**
A RoleType a Citizen applies for and is admin-approved to hold, which makes them eligible to be **Appointed** to help run a specific Event or Venue. Holding the role alone grants nothing over any Event or Venue — only an Appointment does.
_Avoid_: Delegate, staff, co-host

**Mayor**
The VenueFoxer a Venue belongs to — exactly one per Venue. The only one who can make or revoke Appointments on that Venue, and the only one who sets its prices.
_Avoid_: Owner, venue owner

**Event Owner**
The EventFoxer who created an Event — exactly one per Event. The only one who can make or revoke Appointments on that Event, and the only one who controls its pricing and payouts. Stored in code as `Event.organizerId`, a legacy name: the Event Owner is not an Organizer by Appointment.
_Avoid_: Host, organizer (for the Event Owner) — an Event has one Event Owner and any number of Organizers

**Appointment**
A Mayor or Event Owner naming an approved Organizer to help run one of their own Venues or Events. They may make any number of Appointments per Event or Venue. It starts from either side (the Mayor or Event Owner invites, or an Organizer requests to join one that accepts requests) and takes effect only once the other side accepts. Either side can end it at any time. The Mayor or Event Owner is always an Organizer of what they own, without applying and without an Appointment.
_Avoid_: Assignment, delegation

**Check-in Helper**
Any user a Mayor or Event Owner adds to an Event or Venue solely to check guests in. Needs no RoleType and no admin approval — the lightweight tier beneath Organizer. Every Organizer can also check guests in, so an Organizer is never also added as a Check-in Helper.
_Avoid_: Door staff, delegate, check-in delegate

**Shared Inbox**
The one conversation space an Event or Venue has with guests — and, for an Event, with its Suppliers. Every conversation belongs to the Event or Venue, not to whoever replied; its Mayor or Event Owner and every current Organizer read and answer it, and each reply shows who sent it.
_Avoid_: Organizer inbox, personal thread (for these conversations)

**Supplier**
Anyone an Event depends on to happen: the Mayor of its booked Venue, and the Foxers booked to supply its Talent or Gear, or bidding to. An Event's Organizers talk to its Suppliers through its Shared Inbox, but only the Event Owner agrees prices with them.
_Avoid_: Vendor, provider (in conversation; `providerId` in code)

---

## Core Concepts

**Citizen ID**
A permanent, human-readable identifier assigned to every Citizen at signup. Format: `FX-{YYYY}-{5-digit sequential}` (e.g. `FX-2026-00481`). Stored as `citizenId` on the User record. Displayed prominently on the Passport booklet card.
_Avoid_: User ID (that's the internal UUID), account number

**Passport**
A Citizen's gamification profile. Tracks stamps collected, badges earned, XP earned, and level progress per Path.

**Path**
A per-RoleType XP progression track. Each Citizen has one Path per role they hold (`user`, `eventFoxer`, `venueFoxer`, `gearFoxer`, `serviceFoxer`, `performerFoxer`, `investor`, `organizer`). Levels and tier labels are independent per Path.

**Level**
A numeric milestone within a Path, earned by accumulating XP. XP required per level scales by 15% per level (`XP_PER_LEVEL = 1000` base). Each Path has named tier labels at milestone levels:

| Path | Tier sequence |
|---|---|
| Citizen (`user`) | Newcomer (1) → Explorer (5) → Adventurer (10) → Trailblazer (15) → VIP Explorer (20) |
| EventFoxer | Event Starter (1) → Event Planner (3) → Event Pro (7) → Premium Creator (12) → Super Creator (18) |
| VenueFoxer | Ward Officer (1) → District Head (3) → City Planner (7) → City Leader (12) → Grand Foxer (18) |
| GearFoxer | Starter Foxer (1) → Social Butterfly (5) → Event Curator (10) → Master Foxer (15) → Elite Foxer (20) |
| ServiceFoxer | Starter Foxer (1) → Social Butterfly (5) → Event Curator (10) → Master Foxer (15) → Elite Foxer (20) |
| PerformerFoxer | Starter Foxer (1) → Social Butterfly (5) → Event Curator (10) → Master Foxer (15) → Elite Foxer (20) |
| Investor | Seed Funder (1) → Angel Investor (3) → Venture Partner (6) → Major Stakeholder (10) → Elite Investor (15) |
| Organizer | Crew Member (1) → Stage Manager (3) → Floor Lead (7) → Production Chief (12) → Master Organizer (18) |

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

**Marketplace**
The platform-wide pool of registered, available Venues, Assets, and Services any Citizen or Foxer can browse, independent of any Event Template. Two existing views already cover it: foxer-grouped (`/search`, browsing Foxers as profiles — currently missing a VenueFoxer section) and item-grouped (`GET /venues` / `/asset` / `/service`, the same source an EventFoxer's own Event Template builder already browses). A Swap reuses the item-grouped view, filtered to the category being replaced.
_Avoid_: Search (that's one view of the Marketplace, not the concept itself), Directory

**Swap**
A citizen's request, made while browsing an Event Template's proposed package (before submitting a Match Request), to replace one of that Template's attached items (Venue, Asset, or Service) with a same-category alternative picked from the Marketplace — e.g. swapping a Template's included florist Service for a different ServiceFoxer's florist listing. Scoped to same-category alternatives only, not a free-for-all browse. A Match Request may carry any number of Swaps, submitted as structured data (not free text) so the EventFoxer can review and click through to each exact replacement. The original, published Event Template is never modified by a Swap — it stays intact for other Citizens to book as-is. Estimated cost recalculates using the same Host Markup formula against the replacement item's price. The EventFoxer accepts or declines the whole Match Request (Swaps included) — there is no separate per-Swap approval state; disagreements are worked out over the Match's chat before a decision is made. An accepted Swap attaches its outside item directly (by id), the same way Event Template building already works — it does not require a Foxer↔Foxer Match with the outside supplier first.
_Avoid_: Substitution, replacement (use Swap)

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
[`docs/NEXT.md`](./docs/NEXT.md).
