# Dynamic Events architecture — reconciling four documents into one decision

**Status:** Mostly decided. One open item needs an explicit call before Phase 1
work starts (see "Still open" below).

Before this record, Dynamic Events had four documents describing its
architecture, written across three days, that agreed on almost everything but
disagreed — silently, in two of the four cases — on one thing that actually
matters for sequencing work: `DYNAMIC-EVENTS-PLAN.md` (technical plan, revised
11 Sep), `DYNAMIC-EVENTS-PRODUCT-MASTER.md` (product direction, 11 Sep),
`DYNAMIC-EVENTS-PROJECT-MASTER.md` (execution process, 11 Sep), and an external
"Dynamic Events — Architecture Recommendation" doc (12 Sep) reviewed against
the other three and against `prisma/schema/event.prisma` directly. This is the
single decision record `DYNAMIC-EVENTS-PRODUCT-MASTER.md` §23 and
`PRIORITIES.md` P2 both said was still owed.

## Decided — all four sources agree, no conflict

- **No `organizationFoxer` role.** The five `RoleType` values
  (`venueFoxer`, `eventFoxer`, `gearFoxer`, `serviceFoxer`, `investor`) stay as
  they are. The organization/membership concept in `roles-and-spaces.md` §3 is
  a future product concept with no `orgType`, no organization model, no
  membership table — and stays out of scope for Dynamic Events specifically,
  not just deferred in general.

- **`EventTemplate` is where taxonomy and capabilities go — not `Event`.**
  This is `DYNAMIC-EVENTS-PLAN.md`'s "Decision Point Zero" (Option B),
  restated as settled fact in `DYNAMIC-EVENTS-PRODUCT-MASTER.md` §8/§10 and
  `DYNAMIC-EVENTS-PROJECT-MASTER.md`'s Phase 0 exit criteria. Confirmed
  against the actual schema 12 Sep: `Event` (`prisma/schema/event.prisma`)
  already has `clientId`, `guestCount`, `startAt`/`endAt`, and three vendor
  escrow transaction tables (`EventAssetTransaction`, `EventServiceTransaction`,
  `EventVenueTransaction`) — it is a private, single-client booked instance,
  not the public listing. `EventTemplate` is the separate, reusable, public
  entity. The external recommendation doc's diagrams say "Event" throughout
  where they mean `EventTemplate` — read them with that substitution; they
  don't propose redefining `Event`, they're just imprecise about which model
  they mean.

  **Rejected, consistently, everywhere:** redefining `Event` itself as the
  universal public-participation entity. Every source gives the same reason —
  it would touch every existing `eventId` foreign key (bookings, escrow
  transactions, posts, partner investments) and force a migration of every
  wedding/corporate/birthday event already booked, for a rename that gains
  nothing `EventTemplate` doesn't already provide.

- **Public participation is a new domain, `EventRegistration` — not a reuse
  of `BookingAttendee`.** All four sources independently reach the same
  model:

  ```
  Private booking (existing):  EventTemplate → Client → Event → Booking → BookingAttendee → Vendor escrow
  Public participation (new):  EventTemplate → Event/Occurrence → EventRegistration → Participant
  ```

  Reason, stated identically in `DYNAMIC-EVENTS-PLAN.md` §3a and
  `DYNAMIC-EVENTS-PRODUCT-MASTER.md` §17: a public participant is not
  necessarily a paying customer in a vendor-escrow transaction, and the two
  flows' cancellation/refund/money semantics don't compress into one table.
  `BookingAttendee` stays exactly as it is for the private flow.

- **Event Operator role: documented as future work, not built now.** A
  lightweight organizer (run clubs, community groups) needing only
  creation/registration/check-in without full `EventFoxer` KYC (BIR permit,
  NBI, TIN, portfolio) is a real gap, named the same way in
  `DYNAMIC-EVENTS-PLAN.md`'s Phase 1 role note, `PRIORITIES.md` P2, and the
  external doc's §6. Nobody has scoped or named it yet (`"Partner"` is taken
  by `investor`). Stays a product decision, not a schema task, until scoped.

- **Organization/Membership layer: future work, explicitly out of this
  migration's scope.** Matches `roles-and-spaces.md` §3 and the external
  doc's §7 exactly, down to the "do not introduce `orgType` /
  `organization_id` / membership tables yet" instruction.

## Still open — needs an explicit decision before Phase 1 starts

**Phase sequencing: prove the loop first, or build the foundation first?**

`DYNAMIC-EVENTS-PLAN.md` §4 was **resequenced on 11 Sep**, with its own
reasoning recorded: originally Taxonomy → Capabilities → Public Participation,
changed to **Public Event MVP (`EventRegistration`) → Taxonomy →
Capabilities**, because *"a fun run or sports tournament doesn't need
subcategories or a toggle framework to prove FoxPassport can turn a stranger
into a registered, checked-in participant — it needs `EventRegistration` and
nothing else. Taxonomy and the formal capability system get built once that
loop is proven, not before."*

`DYNAMIC-EVENTS-PRODUCT-MASTER.md` §20 and `DYNAMIC-EVENTS-PROJECT-MASTER.md`
§9–§15 were **not updated to match** — both still run Taxonomy (Phase 1) →
Capability Framework (Phase 2) → Format/Visibility (Phase 3) → Public
Participation (Phase 4) → Ticketing (Phase 5), the pre-resequencing order. The
external recommendation doc (12 Sep) independently proposes the same
Taxonomy-first order, unaware of the 11 Sep resequencing.

So the count is 3 of 4 documents favoring Taxonomy-first, and one — the most
recently and deliberately revised one — favoring MVP-first. That is not a
typo or staleness in the same way this session's other doc-drift findings
were; it reads like a technical resequencing that never got carried back into
the product/project masters that are supposed to own sequencing decisions
(`DYNAMIC-EVENTS-PROJECT-MASTER.md` §3: Product Manager owns priority,
Technical Lead owns architecture — sequencing sits closer to the former).

**Recommendation, not a decision:** MVP-first. The reasoning in
`DYNAMIC-EVENTS-PLAN.md` §4 is sound on its own terms — `EventRegistration`
alone is enough to prove a stranger can find and join a public event, and
building taxonomy/capability infrastructure ahead of that risks the exact
premature-generalization the Product Master's own guardrails (§28: "reject...
unnecessary new domains... premature advanced features") warn against. But
this is a sequencing call with product-priority implications, not a technical
correctness question, and three other documents reached a different answer —
**it needs the Product Manager role (per §3's own separation of
responsibilities) to make the call explicitly, not inherit it by whichever
document gets read first.**

**Until decided:** treat `DYNAMIC-EVENTS-PLAN.md` §4 as the working order
(it's the most recently reasoned-through), but do not start Phase 1 task
breakdown from `DYNAMIC-EVENTS-PROJECT-MASTER.md` §9's Taxonomy tasks without
confirming this first — that document still assumes Taxonomy is Phase 1.

## Still open — carried forward, unresolved in every source that mentions it

- **`CAPACITY → REGISTRATION` capability dependency contradicts current
  behavior.** Flagged identically in `DYNAMIC-EVENTS-PLAN.md`,
  `DYNAMIC-EVENTS-PRODUCT-MASTER.md` §16, `DYNAMIC-EVENTS-PROJECT-MASTER.md`
  §11, and `PRIORITIES.md` P2 — `EventTemplate.maxAttendees` already caps
  private-booking events with no registration capability at all today. Two
  options on the table, neither chosen: drop the `CAPACITY → REGISTRATION`
  edge, or redefine `REGISTRATION` in the dependency graph to mean "some
  attendee-tracking mechanism" (booking OR public) rather than specifically
  the new public flow.
- **Map the 5 legacy `EventCategory` enum values** (`corporate`, `birthday`,
  `wedding`, `social`, `other`) into whatever taxonomy Phase 1/2 lands on,
  before that migration runs — flagged in every source, not yet done.

## New since the three original documents — not yet assessed

**`EventOccurrence`**, proposed in the external recommendation's §4: a
separate model so one `EventTemplate`/`Event` can have multiple scheduled
occurrences (single-day, recurring, multi-session). Not in any of the three
original Dynamic Events documents, and not costed against the fact that
`Event` already carries a single `startAt`/`endAt` pair directly. Worth
evaluating on its own merits once the sequencing decision above is made — it's
a genuine gap for recurring events (a weekly run club can't be modeled as one
`EventTemplate` occurrence today), but it's additive schema work that should
go through the same Problem → Options → Impact Analysis process as everything
else here, not get adopted by inclusion in a recommendation doc.

---

*Reconciles `DYNAMIC-EVENTS-PLAN.md`, `DYNAMIC-EVENTS-PRODUCT-MASTER.md`,
`DYNAMIC-EVENTS-PROJECT-MASTER.md`, and the 12 Sep external "Dynamic Events —
Architecture Recommendation" doc. None of the four are superseded by this
record — this is the cross-reference the Product Master's own §23 decision
framework asked for, not a replacement for any of them.*
