# Roles and spaces — the Foxer model

**Written 4 September 2026, from a design conversation.** Decisions taken in
that conversation are marked **Decided**; everything else is open and says so.
Code facts below were read from `main` on the day, not remembered — where a
claim is about the running system the file and line are named, so it can be
re-checked rather than trusted.

Companion documents: `RBAC.md` is the authorization model as built,
`RBAC-PLAN.md` the migration that produced it. This file is about the layer
above both — what the roles *are*, and what each one gets to look at.

---

## 0. The idea, in one paragraph

A Venue Foxer or an Event Foxer is not just a listing. It is the **host of a
community**: Service Foxers — gear, talent, catering, photography — apply to it,
are accepted or refused by it, and once inside work under its rules. So the
platform has two kinds of application, and only the first exists today:

1. **Apply to be a Foxer.** A person asks the platform for a `RoleType`, and an
   admin reviews it. This is `RoleRequest`, and it is built.
2. **Apply to a community.** An accepted Service Foxer asks a *specific* venue
   or a *specific* Event Foxer to work with them, and that host reviews it.
   **Nothing for this exists.**

The second one is an **organisation** — the host is the org, accepted Service
Foxers are its members. Crucially it is **only a roster**: membership grants no
permission, which is what keeps it a data model rather than an authorization
change. See §3.

---

## 1. Six roles, flat — **Decided**

Five `RoleType`s exist today. `talentFoxer` is the sixth. The enum stays flat:
six leaves, six grants, no inheritance.

| RoleType | Permission | Space it appears in |
|---|---|---|
| `venueFoxer` | `venue:manage` | Venue Foxer |
| `eventFoxer` | `template:manage`, `booking:check-in` | Event Foxer |
| `gearFoxer` | `asset:manage` | *Provider (grouping)* |
| `talentFoxer` | `talent:manage` — **new** | *Provider (grouping)* |
| `serviceFoxer` | `service:manage` | *Provider (grouping)* |
| `investor` | *none* | Fox Republic |

`payouts:onboard` is held by all four existing supply roles and should be held
by `talentFoxer` too.

### Why flat rather than nested

The question put in the conversation was: *if someone is a `gearFoxer`, are they
also a `serviceFoxer`?* The answer was **yes** — which makes "Service Foxer" a
**category label, not a role** — named **Provider**, see below. Permissions stay on the leaves.

That is the cheap answer, and it is worth being explicit about what it buys:

- **No inheritance.** Nothing in either codebase resolves a permission through a
  parent role today, and this decision means nothing has to start.
- **No migration for the grouping.** `roleType` stays `["gearFoxer"]`. Nothing
  stored says "also a Service Foxer" — the grouping is a constant in the app,
  read only when deciding which page tree to render.
- **`can()` is untouched.** Six leaves, six grants, still `Record<RoleType, …>`,
  so a seventh role still fails to compile until someone grants it something.

The expensive answer — an umbrella holding its own permissions that the leaves
inherit — was considered and rejected. It buys nothing the grouping does not,
and it introduces a resolution order that then has to be right everywhere.

### The umbrella is called **Provider** — **Decided**

"Service Foxer" was briefly both the umbrella *and* one of its three leaves. The
same name meaning two things, adjacent, inside a permission vocabulary, is how
`RBAC.md` describes drift starting — so the umbrella is **Provider**:

```
Provider
  ├─ gearFoxer     asset:manage
  ├─ talentFoxer   talent:manage
  └─ serviceFoxer  service:manage
```

Provider exists **only in the UI** — a page grouping and a constant. No enum
value moves, and `serviceFoxer` keeps its name. Renaming the leaf instead was
rejected: it is a live enum value, so it would be a data migration on existing
rows, and `ALTER TYPE … ADD VALUE` is forward-only.

---

## 2. Talent is already half-built

The strongest argument for the sixth role is that the app already promises it.

`features/event/data/eventBuilderData.ts:36-39` declares **four** supply
categories — `venue`, `talent`, `service`, `equipment`. But `resourceType` on
the same file's `ResourceItem` is typed as only **three**:
`"venue" | "asset" | "service"`. Talent has a tab, a bucket, and a `talentCost`
line in `EventBlueprint` — and no type of its own.

What fills it, in `features/event/hooks/useEventBuilder.ts:96` and `:143`: an
item lands in the talent bucket when its **category slug is `"entertainment"`**.
So talent today is an asset or a service wearing a label. There is even a
fallback at `:418` that reclassifies talent-iconed items back into assets when
`resourceType` is missing — a comment admitting the type cannot carry the
distinction.

### Promoting it is **Decided** — and it costs more than an enum value

Talent becomes its own resource type rather than staying a category of Service.
That is consistent with the six-role decision, but it is worth being honest that
it is **not** a one-line change:

- [ ] **`entertainment` leaves `ServiceCategory`.** The enum becomes `design`,
      `catering`, `service_staff`, `other`.
- [ ] **`ComponentType` gains `talent`** — it is `asset | service | venue` today.
- [ ] **`resourceType` gains `"talent"`** in `eventBuilderData.ts`, and the
      `slug === "entertainment"` routing at `useEventBuilder.ts:96` and `:143`
      goes away, along with the `:418` fallback that reclassifies talent-iconed
      items as assets.
- [ ] **Existing services categorised `entertainment` need migrating** to the new
      type. This is the part with data behind it — count the rows before
      writing the migration, and note `ALTER TYPE` is forward-only, so removing
      a value from `ServiceCategory` is a rebuild of the enum, not a drop.

The alternative — keep talent as `ServiceCategory.entertainment` and stay at
five roles — was considered and rejected. It is what the code believes today and
it is cheaper, but it leaves a supply type that has a tab, a cost line and no
role that provides it.

---

## 3. The community layer — an organisation, but only a roster — **Decided**

A Service Foxer applies to a Venue or to an Event Foxer, and that host accepts
or refuses them. The shape is an **organisation**: the venue or Event Foxer is
the org, the accepted Service Foxers are its members, and a member applies for a
named role within it — photographer, sound, catering.

**Membership grants no platform permission.** That was decided explicitly, and
it is the single most important sentence in this document, because it is what
keeps the whole feature cheap.

### What that decision buys

The word "organisation" usually drags scoped authorization behind it — org
roles, per-resource grants, tenancy. It does not here. Membership is a
**directory**, not a grant. So none of the following changes:

- **`can()` is untouched.** No resource argument, no scoped resolver, no second
  authorization question anywhere.
- **The token is untouched.** Permissions stay stamped in the JWT. There is no
  unbounded per-scope list to keep out of it, because there is nothing scoped to
  carry.
- **Ownership is untouched.** `venue.mayorId !== requesterId` at
  `api/src/services/venue.service.ts:321` and `:394` stays exactly as written. A
  roster member is not an owner and gets no edit rights, so those two lines
  never learn about membership.
- **`admin_secretary` is untouched.** Nothing about its grant table moves.

What is left is an ordinary data model: a table, a status, two review actions,
and some screens. That is a feature, not an architecture change — and it can be
built after the space split rather than before it.

### What it still needs

- [ ] **A membership table** — `(userId, orgType, orgId, status)`, where
      `orgType` is `venue` or `eventFoxer` and `status` carries the same
      `pending / approved / rejected` shape `RoleRequest` already uses.

      **No `roleLabel` column — Decided.** A `gearFoxer` can only join as gear,
      so the label is already implied by their `roleType`. Storing it would be a
      second source of truth that drifts the day someone loses the role and
      their roster row still claims it. Derive the label for display; store
      nothing. If a finer label is ever wanted, the `AssetCategory` /
      `ServiceCategory` enums already exist and are the place to take it from —
      but that is a later decision, not this table's problem.
- [ ] **Host-side review.** The venue or Event Foxer approves and rejects its
      own applicants. This is a **second review queue with a different
      audience** from the admin queues — `admin_secretary` works platform
      submissions and should not see a private roster. Do not route it through
      `queue:read` / `queue:decide` by reflex.
- [ ] **Decide what membership actually does for the member.** It grants no
      permission, so its value is discovery and standing: appearing on the
      host's roster, being easier to book, being findable. Worth stating
      outright, because a feature that grants nothing and does nothing visible
      is one nobody will use.

### Design it so it can grow, but do not grow it now

The predictable pressure is that someone will eventually want a `venue_manager`
who can genuinely edit the venue. That is a **delegation of ownership**, which
is a different mechanism from a roster, and today it has no home — `Venue` has
one `mayorId` and no delegation of any kind.

- [ ] **Never let membership be read by an authorization check.** There is no
      `roleLabel` to misuse, which helps — but the same trap exists for the
      membership row itself. The moment `can()` or an ownership check consults
      it, this stops being a roster and every guarantee above is void. If real
      delegation is wanted later it should arrive as its own explicit thing,
      not by a roster quietly acquiring meaning.

Worth knowing: **mapanytime does not model this either.** Its `Stores` have one
`sellerId` and there is no store-staff table, so its RBAC — despite being seeded
into `Roles` / `Permissions` / `RolePermissions` tables — is still global per
user. There is no prior art here to copy, in either direction.

## 4. The blocker — fix before any split

`features/auth/hooks/useRoleAccess.ts` is a **second grant table on the client**,
hand-maintained, reading role names directly. It is the thing `RBAC-PLAN.md`
Phase 5 deleted from `shared/lib/permissions.ts`, still alive in the one hook
that drives the entire creator dashboard.

Three defects, all live:

- **Gear and Service cross-grant.** `isFoxer` is true if the user holds *either*
  `gearFoxer` or `serviceFoxer`; then `canManageInventory` and
  `canManageServices` both admit `isFoxer`. So a Service Foxer gets the gear UI
  and a Gear Foxer gets the services UI. **The six roles cannot be separated in
  the UI while the hook says two of them are the same thing.**
- **Admins get everything unlocked.** `canManageVenues: isMayor || isAdmin`, and
  the same for the other three. The API deliberately withholds `venue:manage`,
  `asset:manage`, `service:manage` and `template:manage` from `admin`, so an
  administrator sees four unlocked sections in which every action 403s.
- **`sysRole === "super_admin"`** — a role no user can hold. Dead branch, and
  the same ghost `RBAC.md` records being removed from the API.

- [ ] **Replace it with `hasPermission` against the server's `permissions`
      array**, and add the file to the list in
      `src/__tests__/data/permissions.test.ts` → "the gates are expressed as
      capabilities". That test guards four files against exactly this pattern;
      this hook is not one of them, which is how it survived Phase 5.

---

## 5. The spaces

Today every supply role lands on the same `/creator-dashboard`, which renders
all four areas and wraps the ones the user lacks in `LockedSection` — blurred,
with an "Apply as X to unlock" overlay. A single-role Foxer sees one real
section and three adverts.

**The dashboard is a work surface — Decided.** It shows only what the person
holds. `LockedSection` and its blurred "Apply as X to unlock" panels go.

Discovery is not dropped, it is demoted: **one dismissible hint** listing the
roles this person could apply for, below the real content rather than on top of
it. A single-role Foxer gets their section and a line of text, not three
adverts.

- [ ] **Remove `LockedSection`** and the four blurred branches in
      `HostDashboardClient.tsx`. The component has no other call site.
- [ ] **Add the hint**, dismissible and persisted per user, linking to
      `/creator-dashboard/apply`.
- [ ] **Four spaces, not six.** Venue, Event, Service (grouping gear + talent +
      service), and Fox Republic. `investor` grants nothing today and does not
      need a page until it does.
- [ ] **Event Foxer is a different shape.** Venue, gear, talent and service all
      own inventory and get booked — the same page with a different noun. Event
      Foxer *composes* the others, and its space should not be a fourth copy of
      the inventory layout.

### Prior art: mapanytime split, and its gates are weaker

`mapanytime-market-web` has `/seller`, `/buyer`, `/admin` and `/agent` as
separate top-level trees with their own gates and layouts, so the separation
itself is validated. But `SellerAuthGate` and `AgentAuthGate` check **only that
a token exists**, not what the holder is; and `AdminAuthGate` keeps a hand-copied
role list with a comment reading "keep in sync with ADMIN_ROLES on the server" —
the duplication FoxPassport removed. Copy the route separation, not the gates.

---

## 6. Not yet placed

- [ ] **Fox Republic.** `republic` appears throughout this app's naming, but
      nothing called a **market** exists in either schema. The diagram lists
      "investors, markets" together, which mixes a role with an entity. A market
      is a model before it is a permission, and it needs defining before either.
- [ ] **`Venue.staffing String[]`.** A bare string array on the venue with no
      relation and no roles, already carried through controller, service and
      repository. It is a proto-version of the community layer in the wrong
      shape. Decide whether it becomes the real thing or is deleted — leaving
      both is two answers to one question.

---

## 6a. Decisions taken 4 Sep, in one place

| Question | Answer |
|---|---|
| Umbrella name | **Provider** — UI grouping only, no enum moves |
| Talent | **Its own resource type** — `entertainment` leaves `ServiceCategory` |
| Roster label | **Derived, not stored** — no `roleLabel` column |
| Dashboard | **Work surface** + one dismissible hint |
| Service Foxer as a role | **No** — category label, permissions stay on leaves |
| Community membership | **Roster only** — grants no permission |
| API source layout | **21 flat modules by domain** — not nested by Foxer role |
| Table renames (`@@map`) | **Deferred** — see api `docs/adr/0003` |

The last two are API-repo concerns and are recorded there; they are listed here
so the whole day's decisions can be read in one place.

---

## 7. Suggested order

1. **Fix `useRoleAccess`** (§4). Blocking, small, and correct on its own merits
   regardless of what else is decided.
2. **Add `talentFoxer` and `talent:manage`** (§1), plus a
   `TalentFoxerApplication` so it can be applied for like the other five. Both
   grant tables are `Record<RoleType, …>`, so this will not compile until each
   is updated — the safety net working.
3. **Give talent a `resourceType`** (§2), so the builder's fourth tab starts
   meaning something.
4. **Split the spaces** (§5), once step 1 gives honest per-role signals.
5. **Then the community layer** (§3) — one table, a status, two review actions
   and some screens. It needs its own plan for the *product* questions (what
   membership is worth to a member, who reviews it), not for authorization,
   because it changes none.

Steps 1–4 need no new tables. Step 5 adds one and touches no guard.
