# Role flows — how each role is obtained and what it can do

This documents the *actual, built* end-to-end flow for every role in FoxPassport
Republic, traced from the frontend (`fox-passport-republic-app`) and backend
(`fox-passport-republic-api`) source as of 2026-09-30. Unlike `roles-and-spaces.md`
(the design conversation that proposed this model) and `RBAC.md` (the permission
tables), this file follows one citizen through the screens and endpoints they'd
actually hit.

Role vocabulary (`src/shared/constants/roles.ts`):
- **SystemRole** (one per user): `user`, `admin_secretary`, `admin`
- **RoleType** (a user may hold several): `venueFoxer`, `eventFoxer`, `gearFoxer`,
  `serviceFoxer`, `performerFoxer`, `investor`, `organizer`

---

## 0. Base citizen — signup and applying for a role

Anyone can sign up with no approval (`user` SystemRole is the default).

- **Signup/login:** `src/features/auth/components/{SignupForm,LoginForm}.tsx`,
  `useAuth.ts` → `POST /auth/register`, `POST /auth/login` (via `/api/proxy`,
  where auth cookies get set).
- **Applying for a RoleType:** every Foxer application goes through one pipeline.
  - Shared hook `src/features/role-application/hooks/useApplyRole.ts` →
    `POST /role-requests/apply` → redirects to `/onboarding` on success.
  - Role-specific forms/routes:
    | Role | Form component | Route |
    |---|---|---|
    | eventFoxer | `HostApplicationClient.tsx` | `/creator-dashboard/apply` |
    | venueFoxer | `MayorApplicationClient.tsx` | `/mayor/apply`, `/venue-foxer/apply` |
    | gearFoxer / serviceFoxer / performerFoxer / organizer | `FoxerApplicationClient.tsx` (tabbed) | `/foxer/apply` |
  - Documents: `FOXER_KYC_DOCUMENTS` (valid ID, NBI, TIN, BIR permit, selfie) for
    business-side roles; `ORGANIZER_KYC_DOCUMENTS` (valid ID, background
    clearance, selfie) for Organizer — vetted as a *person*, not a business.
  - Backend: `src/modules/role-request/` — `RoleRequestService.submitApplication`
    creates a `RoleRequest` + a per-role `*Application` row.

- **Admin review** (`AdminSubmissionsTable.tsx`, backend
  `PATCH /role-requests/review/:id`, permission `roles:manage`):
  - **Approve** → roleType pushed onto `user.roleType[]`, specializations copied in.
  - **Reject** → terminal, `rejectionReason`, must reapply from scratch.
  - **Revision requested** → admin flags specific documents + a note; applicant
    fixes only those via `ResubmitDocumentsClient.tsx`
    (`PATCH /role-requests/:id/resubmit-documents`), which reopens the request
    to `pending`.

  ```
  pending ──approve──────────> approved (role granted)
  pending ──reject───────────> rejected (terminal)
  pending ──flag docs────────> revision_requested ──resubmit flagged docs──> pending
  ```

- **Admin can also bypass this entirely:** `RoleAssignmentControls.tsx` lets an
  `admin` directly set a citizen's SystemRole or toggle their RoleType[]
  (`roles:assign`), e.g. to bootstrap or correct a role.

---

## 1. eventFoxer — build and publish events

1. Apply at `/creator-dashboard/apply` → roleType `eventFoxer` granted
   (permissions: `template:manage`, `booking:check-in`, `payouts:onboard`, `bid:manage`).
2. **Build an `EventTemplate`** (the reusable public listing — *not* a bookable
   `Event` yet): `src/app/foxer/create-event/page.tsx`, store
   `useEventBuilderStore.ts`, hook `useEventBuilder.ts`. Drag real
   venues/assets/services into a "Core Package"; auto-saves every 2s.
3. **Publish requires:** title, category, description ≥100 words, gallery ≥5
   photos, and an **approved venue affiliation** (see below) — enforced by
   `blueprintHealth` client-side and mirrored server-side.
4. **Edit an existing template:** `/creator-dashboard/events/[id]/edit` →
   `useHostEventEdit.ts` → `updateEvent` then `submitEventTemplate`.
5. Backend: `src/modules/event-template/` — attaching a venue is only allowed
   if the eventFoxer owns it, or holds an **approved venue affiliation** with
   `template:attach`.

**Venue affiliation (eventFoxer ↔ venueFoxer marketplace):**
An eventFoxer applies to a venue (or a venue Mayor invites an eventFoxer) via
`src/features/venue-affiliation/`. Whichever party didn't initiate decides
(approve/reject); if the application carries an `agreedPrice`, only the Mayor
(not a Venue Organizer) may approve it. Dashboard: `/foxer/affiliations`.

**What a citizen does with a published event:**
- **Book the whole private event** (the built flow): `event-requests` module →
  `POST /event-requests` spawns an `Event` from the template →
  `useEventCheckout.ts` → Stripe Checkout.
- **"Apply for a role within an event"** — this is what Organizer/Appointments
  (§6) is for: an *approved Organizer* applies to help **run** the event
  (staffing), not to attend it. There is currently **no public
  "sign up to attend" flow** (`EventRegistration`) — ADR 0001 (frontend
  `docs/adr/0001-dynamic-events-architecture.md`) explicitly defers this as
  future work, sequenced after the current MVP.

---

## 2. venueFoxer — list a venue

1. Apply at `/mayor/apply` (or `/venue-foxer/apply`) → roleType `venueFoxer`
   (permissions: `venue:manage`, `payouts:onboard`, `promotions:manage-own`).
2. **List a venue:** `/mayor/create-venue` → `CreateVenueWizard.tsx`, store
   `useVenueBuilderStore.ts`. Edit existing: `/creator-dashboard/venues/[id]/edit`.
3. **Manage team (Organizers / Check-in Helpers):** `/creator-dashboard/team`
   → `TeamPanel` (§6).
4. **Manage affiliations** with eventFoxers wanting to host events there:
   `VenueAffiliatesSection.tsx` on the venue's own edit page.

**Citizen booking a venue:** `/booking/venue/[id]` → `VenueBookingClient.tsx`
(date range, price preview) → `/booking/venue/checkout` (Stripe) → success/pending
pages.

---

## 3. gearFoxer — list gear/assets

1. Apply at `/foxer/apply` (tab: gear) → roleType `gearFoxer`
   (permissions: `asset:manage`, `payouts:onboard`, `bid:submit-asset`, `promotions:manage-own`).
2. **List an asset:** `/foxer/create-listing` → `ListingBuilderClient.tsx`,
   store `useListingBuilderStore.ts`. Edit: `/creator-dashboard/assets/[id]/edit`.
3. Backend: `src/modules/asset/` — new listings go through admin pending approval.

**Citizen booking an asset:** `/booking/asset/[id]` → `AssetBookingClient.tsx`
→ shared `/booking/item-checkout` flow. Escrow/transaction lifecycle in
`src/modules/asset-booking/`.

---

## 4. serviceFoxer / performerFoxer — list services or performances

Both use the same tabbed application (`/foxer/apply`) and the same underlying
`Service` Prisma model — `performerFoxer` just owns performer-category rows
of it (photography/videography/dj/live_band/mc vs. serviceFoxer's
design/catering/service_staff/other).

1. Apply → roleType `serviceFoxer` or `performerFoxer` (permissions:
   `service:manage` or `performer:manage`, `payouts:onboard`, `bid:submit-service`,
   `promotions:manage-own`). Requires NBI clearance + portfolio + experience years.
2. **List:** `/foxer/create-service` → store `useServiceBuilderStore.ts`.
   Edit: `/creator-dashboard/services/[id]/edit`. Performer dashboard:
   `/creator-dashboard/performers`.
3. Backend: `src/modules/service/`.

**Citizen booking:** `/booking/service/[id]` → `ServiceBookingClient.tsx` →
shared `/booking/item-checkout` flow. Escrow lifecycle in
`src/modules/service-booking/`.

**Alternative path — bidding:** gearFoxer/serviceFoxer/performerFoxer can bid
on an event's open slots instead of a fixed listing price
(`EventBidsPanel.tsx`, `src/features/event/api/bids.ts`). Only the Event
Owner (or an Organizer with `event:manage-bids`) can accept a bid.

---

## 5. investor ("Partner Foxer") — partnership proposals

1. Apply → roleType `investor` (permissions: `partnership:propose`,
   `payouts:onboard`).
2. **Create an investment:** `/foxer/create-investment` →
   `CreateInvestmentWizard.tsx`.
3. **Propose a partnership** to an event/venue: `src/features/partnership/` —
   `ProposePartnershipModal.tsx` → accept/reject/withdraw lifecycle
   (`usePartnerships.ts`), payment via `usePartnershipCheckoutMutation`
   (`required → processing → paid | failed | cancelled | refunded`).
   Dashboard: `/creator-dashboard/partnerships`.
4. `isPartnerUser()` also grants a cosmetic "Partner" badge on posts/profiles
   — display only, not an extra capability.

---

## 6. organizer — the "apply for a role within an event/venue" mechanism

This is the role that matches your example most closely: **an eventFoxer (or
venueFoxer) creates something, and a citizen applies for a role on it.**

**Key design fact (ADR 0005,
`fox-passport-republic-api/docs/adr/0005-organizer-role-and-appointments.md`):
the `organizer` RoleType itself grants *nothing*.** All authority comes from
being **appointed** to one specific Venue or Event. One vetting process
(`/foxer/apply`, tab: Organizer — government ID + background clearance +
selfie, no business docs) covers both.

### Two ways to get appointed

**A. Owner invites an Organizer** (`TeamPanel.tsx`, on the venue/event's
team page, e.g. `/creator-dashboard/team`):
1. Mayor/Event Owner invites by email or by searching approved Organizers
   (`GET /appointments/organizers?q=`, never surfaces emails).
2. Invitation sits as `invited`; expires after **14 days** if not answered.
3. Organizer sees it in `OrganizingSection.tsx` (their own "Organizing" view)
   and accepts/declines (`POST /appointments/:id/accept|decline`).
4. On accept → `active`.

**B. Organizer requests to join** (if the owner has "accepts requests" on):
1. Owner toggles `acceptsOrganizerRequests` in `TeamPanel.tsx`
   (`PATCH .../appointments/settings`).
2. Approved Organizers browse `OpenToOrganizersSection.tsx` — the list of
   venues/events currently open to requests (`GET /appointments/open`). Since
   Events have no public discovery page of their own, **this is the only way
   an Organizer finds an event to join.**
3. Organizer sends a request (`JoinRequestButton.tsx` → `POST
   .../appointments/request`); max 5 open requests at once; 14-day expiry.
4. Owner approves/declines from `TeamPanel.tsx`'s pending-requests list.
5. On approve → `active`.

### Once active

Fixed permission sets (never a role-to-permission map the app computes —
the API just returns the grant):
- **Event Organizer:** check people in, approve bookings, message attendees
  *and* suppliers, manage bids, view sales. **Never** edit event details/price
  — that stays the Owner's.
- **Venue Organizer:** check-in, calendar, approve affiliations, reply to
  inquiries, edit the listing (never prices), view bookings.
- **Check-in Helper** (separate, lighter tier): check-in only, added by email,
  no KYC, no acceptance step needed.

A Venue's staff (Mayor, or an appointed Organizer/Helper with check-in) may
check in guests of *any* Event held at that venue, on the event's day (±6h) —
the venue owner's consent to host the event implies that.

### Ending

- Losing the `organizer` RoleType ends **every** active appointment
  immediately (history preserved, nothing auto-restored if re-approved later).
- Event appointments end 7 days after the event (or immediately if cancelled);
  Venue appointments are open-ended until removed/left/revoked.

```
                 invite ──────────────┐
Owner/Mayor ─────────────────────────>│ invited ──accept──> active ──(various)──> ended
                                       │           └decline─> declined
Organizer ── request (if open) ──────>│ requested ──approve──> active
                                       │            └decline──> declined
                 (either, unanswered) └─────────── 14 days ───> expired
```

---

## 7. admin / admin_secretary — the console

- `admin_secretary` ("Queue Secretary"): approval queues only — role
  applications, pending listings. Cannot see citizens, bookings, disputes.
- `admin` ("Administrator"): everything, including `RoleAssignmentControls`
  (assigning roles directly) and refunds (`/admin/refunds`,
  `src/modules/refund/`).
- Reports/moderation (`AdminReportsPanel.tsx`): resolving a report only
  records the decision — it does not itself touch the reported target
  (unpublishing a venue, suspending a user still goes through that target's
  own admin tab).

---

## Where "applying for a role" ≠ "attending an event"

Worth flagging since it's easy to conflate: today there is **no flow for a
plain citizen to sign up to attend/participate in a published event**
(`EventRegistration` — named in ADR 0001, not yet built). What exists is:
1. A citizen can **book the whole private event** as a paying client
   (`event-requests` → checkout).
2. An **approved Organizer** can apply for a *staffing* role on the event or
   venue (§6, Appointments) — this is the flow that looks like "apply for a
   role," but it's about running the event, not attending it.

If a public "apply to attend" flow is wanted, that's new work, not something
already built and undiscovered.

---

## Evaluation — 2026-10-01

**The authorization model itself is sound.** The API is the only place a grant
is written (`permissionsForUser()` merges SystemRole + RoleType grants); the
app is *told* permissions and never computes them (`shared/lib/permissions.ts`,
`useRoleAccess`), and the API re-derives every guard. Approve / reject /
revision-requested is a clean state machine, and Organizer authority is
correctly per-appointment rather than per-role (ADR 0005). See `RBAC.md` §23
for the conformance audit.

**Where it fell short was the experience around it** — what each role sees
after approval. Found and fixed in this pass:

| Gap | Fix |
|---|---|
| Nothing explained a role before its application form | `RoleDetailsModal` on /onboarding: what the role does, what the form asks for (`features/onboarding/roleCatalog.ts`) |
| Investor's "My Dashboard" link went to `/user`, though `requireHost()` admits them to `/creator-dashboard` | `investor` added to `getDashboardPath`'s supply roles |
| Investor had no dashboard content and no nav entry — `/creator-dashboard/partnerships` was orphaned | `PartnershipsOverview` card on the overview (desktop + mobile), Partnerships nav link (`partnership:propose`); owners get the link too, and the card while proposals await them |
| Event Foxers can't publish without a venue affiliation, but `/foxer/affiliations` was only reachable from one card inside the event builder | Affiliations nav link for `template:manage` / `venue:manage` |
| Mobile "Listings" tab always opened Venues — empty for Gear/Talent/Performer/Event Foxers | Opens the first listing type the person actually manages; Investors get a Partners tab instead |
| No per-role guidance after approval | `RoleGettingStarted` checklist — one tab per held role, steps tick off from real data (first listing, payouts connected, venue approval, first team, first proposal) |
| Chat gave no hint who you were talking to | Role badges (`RoleBadges`) in the chat header, group sender labels and the Messages list; the API's conversation `PARTICIPANT_SELECT` now includes `roleType` |
| The dashboard's "Apply for Roles" hint (offering every role) opened the Event Foxer form at `/creator-dashboard/apply` | Opens the `/onboarding` role picker |

**Still open:**
- `RBAC.md` §21 — no test asserts a route's 401/403/200 triad yet.
- Admin `requireRole`/`requireAdmin`/`requireHost` guard functions are still
  defined (unused) in the API's `auth.middleware.ts`.
- No public "sign up to attend" flow (see the section above) — unchanged.
