---
domain: Fox Passport Republic
updated: 2026-06-08
---

# Domain Glossary

A glossary of canonical terms used across the Fox Passport Republic platform.
This file is the source of truth for ubiquitous language — code, APIs, and UI copy should align with these definitions.

## Roles

**Citizen**
A registered platform user who discovers venues, books events, and collects Passport stamps.
Code: `systemRole: "user"`.

**Fox / Foxer**
A creator who provides physical equipment (Asset Foxer) or professional services (Service Foxer) to support events.
Code: `roleType: "foxerAsset"` or `roleType: "foxerService"`.

**Mayor**
A space provider who lists and manages Venues on the platform.
Code: `roleType: "mayor"`.

**Host**
A curated event creator who packages Venues, Assets, and Services into bookable Event Templates.
Code: `isHost: true`, `roleType: "host"`.

**Admin / Super Admin**
Platform operators who approve content submissions and manage all entities.
Code: `systemRole: "admin"` or `"super_admin"`.

**Investor**
A stakeholder role defined in the type system but not yet implemented in the product.
Code: `roleType: "investor"` (planned).

---

## Core Concepts

**Passport**
A Citizen's gamification profile. Tracks stamps collected, badges earned, and events attended. Displayed at `/user/passport`.

**Stamp**
A collectible awarded to a Citizen after attending an event or visiting a Venue. Displayed as a visual badge on the Passport.

**Event Template**
A reusable event package created by a Host. Defines the event type, venue, included Assets/Services, dates, and estimated cost. Citizens book from Event Templates.

**Venue**
A physical space listed by a Mayor. Has a capacity, base rate, location, and gallery. Can be included in Event Templates.

**Asset**
A piece of physical equipment (e.g., camera, sound system, lighting rig) that an Asset Foxer rents out per event.

**Service**
A professional offering (e.g., photography, DJ, catering) that a Service Foxer provides per event or per hour.

**Experience**
A customized event configuration a Citizen assembles on the Venue detail page by selecting add-on Assets and Services before booking.

**Blueprint**
The financial summary sidebar in the Event Builder. Shows estimated cost breakdown of included items.

**Fulfillment**
The delivery/execution stage after a booking is confirmed — the Foxer delivers the Asset or Service to the event.

**Booking**
A confirmed reservation linking a Citizen, an Event Template (or direct Venue/Asset/Service), dates, and a payment.

**Listing**
A published Asset or Service created by a Foxer, visible in the marketplace for discovery.

---

## Status States

Status values are sourced from backend Prisma enums — the frontend must mirror these exactly.

| Entity | States |
|---|---|
| Venue | `draft` → `pending` (admin review) → `available` / `rejected` / `archived` |
| Asset | `draft` → `pending` (admin review) → `available` / `reserved` / `rejected` / `archived` |
| Service | `draft` → `pending` (admin review) → `available` → `paused` / `archived` / `rejected` |
| Event Template | `eventStatus: draft` → `eventStatus: pending` + `requestStatus: pending` (admin review) → `eventStatus: ongoing` / `completed` / `cancelled` |
| Booking | `pending` → `confirmed` → `active` → `completed` / `cancelled` / `disputed` |
| Role Application | `pending` → `approved` / `rejected` |

Notes:
- `"paused"` on Service is the Foxer's availability toggle (not a separate field) — only valid after `"available"`
- `"reserved"` on Asset is system-set when an asset is booked
- Event Template has two status fields: `eventStatus` (lifecycle) and `requestStatus` (admin approval gate)
- Submitting an Event Template for admin review requires a dedicated `POST /event-templates/:id/submit` endpoint (backend gap — the existing `updateTemplate` endpoint does not accept status fields)

---

## What This Glossary Is NOT

This file does not contain implementation details, file paths, API contracts, or architectural decisions.
Those belong in `docs/adr/` (Architecture Decision Records) or code comments.
