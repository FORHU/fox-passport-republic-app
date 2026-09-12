# Dynamic Events: Implementation Plan

**Status:** Draft for review
**Scope:** `event`, `event-template`, `booking` modules
**Prepared:** 2026-09-11
**Input:** "Dynamic Events" product recommendation

A working plan for making the Event system category-agnostic and capability-driven, checked line by line against what the API and schema actually do today.

---

## 1. Reality check first

The recommendation describes a fully generic event platform — one `Event` object, a flexible category, and optional capabilities (registration, ticketing, sessions, speakers, teams, check-in) toggled per event. Before sequencing work, it's worth being precise about how much of that already exists in `fox-passport-republic-api` versus what would be new.

Today the domain is a two-tier, vendor-marketplace model, not a single flat `Event`:

- **`EventTemplate`** — a reusable, publicly browsable listing a host (an *Event Foxer*, an already-vetted role with its own KYC application flow) builds by attaching `Venue`, `Asset`, and `Service` rows, each with its own price, optionality, and match status.
- **`Event`** — one client's booked occasion, spawned either from a template (`event-request.service.ts → spawnRequestFromTemplate`) or created directly with no template at all (`createDirectEvent`). It carries a single `clientId`, a single `guestCount`, and per-vendor escrow rows for payout.
- **`Booking` / `BookingAttendee`** — the client's purchase and its guest list, already carrying `ticketCode`, `checkedIn`, and `inviteStatus`.

That matters because three of the recommendation's proposed "capabilities" — registration, capacity, check-in — are not gaps. They're existing, working columns that simply aren't exposed as an opt-in toggle yet. The real gaps sit elsewhere.

---

## 2. Capability gap analysis

Verdict per proposed capability, checked against the current schema (`prisma/schema/event.prisma`, `booking.prisma`) and code, not the recommendation's assumptions.

| Capability | Current reality | Verdict |
|---|---|---|
| **Registration** | `BookingAttendee` already models invited guests with `inviteStatus`, email/phone, and a per-attendee ticket code — scoped to a *booking*, not directly to the event. | Exists |
| **Capacity** | `EventTemplate.maxAttendees` plus a `Waitlist` model already tied to templates. | Exists |
| **Check-in** | `checkedIn` + `ticketCode` on both `Booking` and `BookingAttendee`; a working host UI at `creator-dashboard/check-in`. | Exists |
| **Category / subcategory / tags** | `EventCategory` is a fixed 5-value enum (`corporate, birthday, wedding, social, other`). `category.repository.ts` says outright: *"the current schema has no Category model."* | Missing |
| **Format** (in-person / virtual / hybrid) | No field at all — only `targetCity/State/Country`, i.e. physical-only. | Missing |
| **Visibility** (public / private / unlisted) | `EventTemplate.isPublic` is a boolean (no "unlisted"); `Event` itself has no visibility field — it's inherently a private, single-client record. | Partial |
| **Ticketing** (paid tiers, per-attendee price) | Pricing is computed once per booking (`totalAmount`, split into vendor escrow rows). No per-tier, per-attendee ticket price exists. | Missing |
| **Sessions / Speakers** | No models. | Missing |
| **Teams** | No models. | Missing |
| **Sponsors / Vendors-as-capability** | Assets/Services/Venues are already attached to templates — but as required, paid, escrow-tracked marketplace items, not optional "sponsor" listings. | Partial, different semantics |

*Aside: the app's Next.js pages already use `export const dynamic = "force-dynamic"` everywhere — unrelated to this plan, just worth flagging so "dynamic" doesn't get conflated with rendering mode.*

---

## 3. Decision point zero

This has to be settled before any schema work starts, because it changes what "Event" means.

> **Open question:** The recommendation's worked examples (a concert, a conference with per-attendee ticket tiers) treat `Event` as a public listing that many independent people register or buy tickets into directly. Today's `Event` is the opposite: one client, one guest count, spawned privately from a template purchase. Which one does "Event" become?

### Option A — Event becomes the public multi-attendee entity

Redefine `Event` itself as the thing people register/buy tickets into, with capabilities and visibility on it directly. Cleanest long-term shape, but it changes the meaning of every existing `eventId` foreign key (bookings, escrow transactions, posts, partner investments all point at `Event` today) and forces a real data migration for every wedding/corporate/birthday event already booked.

### Option B — Capabilities live on EventTemplate; Event stays the private booking instance (recommended)

`EventTemplate` is already the public, browsable, reusable entity — it's the natural home for capability toggles, category/subcategory/tags, format, and visibility. `Event` keeps its current job (a client's private booked occasion, with vendor escrow) unchanged. A new, additive direct-registration path lets a template with `Registration`/`Ticketing` enabled spawn multiple independent attendee sign-ups per occurrence, running alongside — not replacing — the existing single-client Booking flow. Nothing already shipped (wedding/corporate/birthday bookings, escrow payouts, check-in) has to move.

> **Recommendation:** Go with Option B. It matches the recommendation doc's own §18–19 (template = reusable definition, event = actual occurrence) and costs no migration of existing bookings. The phases below assume Option B.

### 3a. Refinement — don't force public participation through Booking/BookingAttendee

Option B settles *where capabilities live*, but not *how a stranger joins a public event*. The tempting shortcut is to reuse `Booking`/`BookingAttendee` for that too, since they already have `ticketCode` and `checkedIn`. Don't — the two flows have different business semantics that don't compress into one model:

| | Private booking (existing) | Public participation (new) |
|---|---|---|
| Who initiates | One client books a vendor package | Many independent people join the same occurrence |
| Money | Vendor escrow split across `EventAssetTransaction`/`ServiceTransaction`/`VenueTransaction` | A flat ticket price (or free), no vendor split |
| Cancellation rules | Tied to `CancellationPolicy` on the template, refunds vendor-by-vendor | Tied to the ticket/registration itself |
| Owning record | `Booking` (one per client purchase) | A new `EventRegistration` (one per participant) |

So this plan introduces a genuinely new, small domain — `EventRegistration` (or `EventParticipant`) — for the public flow, and leaves `Booking`/`BookingAttendee` untouched for the private flow. They can share the same `ticketCode`/`checkedIn` *shape* without sharing a table. This is folded into the roadmap as its own phase (Phase 3, below) rather than treated as a rename of existing Registration/Check-in.

---

## 4. Phased roadmap

**Resequenced 11 Sep** (see the note at the end of this section): the plan originally ran Taxonomy → Capability framework → Public Participation. It now runs Public Event MVP → Taxonomy → Capability framework, on the reasoning that a fun run or sports tournament doesn't need subcategories or a toggle framework to prove FoxPassport can turn a stranger into a registered, checked-in participant — it needs `EventRegistration` and nothing else. Taxonomy and the formal capability system get built once that loop is proven, not before.

### Phase 1 — Public Event MVP `(L)`

This is the piece that actually proves the "dynamic" claim, and it's deliberately the *first* thing built, not the third. No taxonomy, no capability toggles, no ticketing — just enough for one real public occurrence to run end-to-end. Category stays the existing hardcoded `EventCategory` enum for now; visibility is a plain boolean (`isPublic`) rather than the full `PUBLIC/PRIVATE/UNLISTED` enum. Both get formalized in Phase 2/3 once this is proven, not before.

- **Schema:** New `EventRegistration` (eventId, userId, status, ticketCode, checkedIn, registeredAt) — see §3a for why this is a new table rather than a reuse of `BookingAttendee`. Wire it to the same `Waitlist` model templates already have, so capacity overflow behaves identically whether the join came from a private booking or a public registration.
- **Backend:** New endpoints for join/leave on a public `Event`, enforcing `EventTemplate.maxAttendees` against live `EventRegistration` counts before falling to `Waitlist`. Check-in reuses the same `checkedIn`/`ticketCode` shape and the existing `creator-dashboard/check-in` UI, pointed at `EventRegistration` rows for public templates.
- **Frontend:** A "Join" / "Register" action on `app/event/[eventId]` for templates flagged public, distinct from the existing booking-request flow. Bundled with the Phase 1 sharing work already tracked in `PRIORITIES.md` (OG fix, share/invite UI, QR) — the MVP is worthless if nobody can find the link.
- **Role note:** this phase is what a lightweight event partner (run club, community organizer) would actually touch. `"Partner"` is taken — `investor` already owns that word, displayed as **"Partner Foxer"** (`ROLE_BADGE.investor.label`, `fox-passport-republic-app/src/shared/constants/roles.ts:71`), tied to `PartnerInvestment` (capital/inventory/venue-equity/sponsorship). A run-club organizer who just wants check-in tech shouldn't need the full `EventFoxer` KYC flow (BIR permit, NBI, portfolio, valid ID, TIN) either. Name and scope a separate role (e.g. "Event Operator," "Community Host") before or alongside this phase — see `PRIORITIES.md`.
- **Depends on:** Decision Point Zero (Option B) and §3a only. Nothing else.

### Phase 2 — Taxonomy foundation `(M)`

- **Schema:** New `Category` model (id, name, slug, parentId for subcategory) + `EventTag` join table. Seed it from the current `EventCategory` enum values so existing rows don't need re-tagging on day one.
- **Backend:** `prisma/schema/event.prisma`, a new `category` table replacing the string-groupBy logic in `category.repository.ts` (it currently says outright there's no Category model — this phase makes that comment obsolete), plus the `category`/`targetCity` filters in `event-template.repository.ts`.
- **Frontend:** Category picker in the template-creation flow (`app/creator-dashboard/events`) becomes a searchable category + tag input instead of a fixed 5-item dropdown.
- **Risk:** Every existing `eventCategory` filter (search, trending-by-category, category landing page) needs to keep working during the enum→table migration — do it additively (new columns alongside the old enum) and cut over reads once seeded.
- **Depends on:** Phase 1 proving the acquisition loop is worth building the discovery layer under.

### Phase 3 — Event configuration: format, visibility, capability framework `(M)`

Retrofits Phase 1's hardcoded public/registration behavior behind an explicit, per-template toggle system — formalizing what was proven ad hoc, not building it from scratch.

- **Schema:**

  ```prisma
  enum EventCapability {
    REGISTRATION
    CAPACITY
    CHECK_IN
    TICKETING
    SESSIONS
  }

  model EventTemplateCapability {
    id         String @id @default(uuid())
    templateId String
    capability EventCapability
    config     Json?  // e.g. { requireWaiver: true } — flags only, never entities
    template   EventTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

    @@unique([templateId, capability])
  }
  ```

  Also add `format` (`IN_PERSON | VIRTUAL | HYBRID`) and `visibility` (`PUBLIC | PRIVATE | UNLISTED`), replacing Phase 1's plain `isPublic` boolean (keep `isPublic` as a computed/derived read so existing queries don't break).

- **Capability dependency rules, enforced server-side, not just modeled:** `TICKETING` and `CHECK_IN` each require `REGISTRATION` to already be enabled on the same template — reject the write in `event-template.service.ts` rather than letting the client submit an inconsistent capability set. This is also where the `CAPACITY → REGISTRATION` conflict tracked in `PRIORITIES.md` has to be resolved — `maxAttendees` already caps private-booking events with no registration capability at all today, so that edge needs redefining or dropping before this phase ships. `config: Json` is for lightweight flags only (`requireWaiver`, `allowWaitlist`); anything that becomes a real business entity — a speaker, a session, a ticket tier — gets its own relational table in a later phase, never a JSON blob.
- **Backend:** Gates Phase 1's registration/capacity/check-in behavior behind an explicit per-template flag (enforced in `event-template.service.ts` and `event-request.service.ts`; reuse the `can()` pattern in `types/permissions.ts` for who may edit capabilities). Invalidate `eventTemplateCache` on every capability write, same as every other template mutation. `TICKETING` and `SESSIONS` are declared here but have no behavior yet — they're just valid enum values ahead of Phases 4–5.
- **Frontend:** The template builder gains a "what does your event need?" step with checkboxes (disabled/greyed for capabilities whose dependency isn't met) plus format/visibility fields alongside Phase 2's category picker.
- **Depends on:** Phase 1 (something real to formalize) and Phase 2 (shares the builder step).

### Phase 4 — Ticketing `(L)`

- **Schema:** New `EventTicketTier` (templateId, name, price, quantity) and `EventTicket` (tierId, registrationId, ticketCode, checkedIn) — hangs off `EventRegistration` from Phase 1, and stays deliberately separate from the existing per-vendor `EventAssetTransaction`/`EventServiceTransaction`/`EventVenueTransaction` escrow rows, which stay exactly as they are for the private-booking flow.
- **Backend:** Reuse the existing Stripe integration (`payment.service.ts`, `stripe-connect` module) rather than building a second payment path.
- **Depends on:** Phase 3 (per the dependency rule there, `TICKETING` requires `REGISTRATION` to already be a formal, gated capability, not just Phase 1's hardcoded version).

### Phase 5 — Sessions & speakers `(M)`

- **Schema:** New `EventSession` (templateId, title, startAt, endAt, speakerId?) and `EventSpeaker` (templateId, name, bio, imageId).
- **Depends on:** Phase 3 only. No dependency on Phase 4 — can ship in parallel with Ticketing if there's capacity, since a conference agenda doesn't require ticket sales to exist first.

### Deferred — Teams, Sponsors, Vendor-as-capability, Livestream

Real demand hasn't shown up for these yet, and the `EventCapability` enum is additive by design — each one slots in later as one new enum value plus its own relation table, with zero changes to Phases 1–5. Building them now would be the exact over-engineering the original recommendation itself warns against (§17).

---

## 5. What ships in what order

| Phase | Size | Blocks on |
|---|---|---|
| 1 · Public Event MVP | L | Decision point zero (Option B) + §3a only |
| 2 · Taxonomy | M | Phase 1 (proves the loop first) |
| 3 · Event configuration (format, visibility, capabilities) | M | Phases 1 and 2 |
| 4 · Ticketing | L | Phase 3 (`TICKETING` requires `REGISTRATION` as a formal capability) |
| 5 · Sessions & speakers | M | Phase 3 only — can run parallel to Phase 4 |
| Teams / Sponsors / Livestream | — | Deferred, no timeline |

> **Before starting Phase 1:** Get explicit sign-off on Decision Point Zero (Option B) and its refinement in §3a (a new `EventRegistration` domain, not a reuse of `BookingAttendee`). Everything downstream branches from those two calls. The Phase 1 sharing/OG-preview work in `PRIORITIES.md` can and should start immediately, in parallel — it has no dependency on this plan at all.

---

## 6. The rule that keeps this from sprawling

> Never create a new event model because a new category appeared.

If someone asks "can we support cycling meetups," the answer is `Category = Sports`, `Subcategory = Cycling` — not a `CyclingEvent` model, controller, and page. If someone asks "can we support concerts," the answer is `Category = Music` + `TICKETING`/`CAPACITY`/`CHECK_IN` enabled — not a `ConcertEvent`. The plan succeeds when the existing five categories (`corporate`, `birthday`, `wedding`, `social`, `other`) *and* net-new ones (hiking, concerts, conferences, sports meetups) all run through the same `EventTemplate` + capability set, with nothing but data changing underneath.

---

*FoxPassport Republic · Dynamic Events Implementation Plan · grounded against fox-passport-republic-api as of 2026-09-11*
