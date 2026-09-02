# Pure RBAC — implementation plan

**Written 2 September 2026.** The target is `docs/RBAC.md`; the measured gap is
its §23. This is how to close it.

Everything below was counted, not remembered: a parser walked every
`router.<verb>(...)` block in `api/src/routes/*.ts`, including the multi-line
ones a grep misses.

## Status

| Phase | State |
|---|---|
| 0 — decide `RoleType` | **Settled.** It authorises today, so it moves into the table. |
| 1 — SystemRole side | **Done.** 5 permissions added, 37 routes converted, the app's grant table deleted. api 156 tests, app 92, both clean. |
| 2 — RoleType side | not started — 25 routes still on `requireRole`/`requireHost` |
| 3 — delete the old guards | not started |
| 4 — tests | not started |
| 5 — app side | not started |
| 6 — role assignment | not started — the only phase that changes what anyone can do in production, so it needs an explicit decision of its own |

**What Phase 1 actually changed**

- `PERMISSIONS` gains `users:manage`, `policies:manage`, `payments:read:all`,
  `disputes:resolve`, `refunds:manage` — granted to `admin`, none to
  `admin_secretary`, so no role's surface moved.
- All 37 `requireAdmin` routes across 11 files now call `requirePermission`.
  `requireAdmin` has zero references left under `src/routes/`.
- The API serves the derived list everywhere it hands over a user: login,
  refresh, the Google exchange, and `/profile`. Refresh previously returned a
  thinner user than login; it no longer does.
- **The app's grant table is gone.** `shared/lib/permissions.ts` holds the
  vocabulary and `hasPermission(user, p) → user.permissions?.includes(p)`.
  It cannot compute a permission any more, only be told one.
- `UserDashboardClient` was calling `hasPermission({ systemRole }, …)` with a
  synthesised subject, which would have answered `false` to everything the
  moment the fallback went. It passes the real user now.

API first, then the app — deleting the app's table before `/profile` served
permissions would have closed the admin console for admins.

## What is actually in the way

**62 routes across 13 files authorize by role name.** Not 39 — that was a count
of grep lines, and it undercounted the multi-line registrations.

| Guard | Routes | Authorizes on | Files |
|---|---|---|---|
| `requireAdmin` | 37 | `SystemRole` | admin (13), users (4), category (3), cancellation-policy (3), event-request (3), venue (2), asset (2), service (2), event-template (2), role-request (2), payment (1) |
| `requireRole([...RoleType])` | 23 | `RoleType[]` | event-template (13), venue (3), asset (3), service (3), stripe-connect (1) |
| `requireHost` | 2 | both | booking (2) |

`requirePermission` appears in exactly one file, `admin.routes.ts`, on 21
registrations. So the model is right and the reach is 25%.

## Phase 0 — the decision, and it is smaller than it looked

§12 of the spec asks whether `RoleType` is authorization or domain data. The
code has already answered: **23 routes authorize on it today.** A `venueFoxer`
may create a venue and a `gearFoxer` may not, and `requireRole` is what enforces
that. It is not a question of whether to make it an authorization axis — it is
one — only whether to model it in the grant table or leave a second mechanism
standing.

The plan below assumes it moves into the table. If you decide otherwise, stop
after Phase 1 and the spec's §12 has to be rewritten to say that FoxPassport
runs two authorization models on purpose.

**Behaviour to preserve, and it is easy to get wrong:** `requireRole(["eventFoxer"])`
does **not** include admin. An admin cannot create an event template today. The
supply-side permissions must therefore *not* be granted to `admin`, or Phase 2
quietly widens what admins can do.

## Phase 1 — finish the SystemRole side

Nothing here touches `RoleType`. All 37 `requireAdmin` routes become
`requirePermission`.

### 1a. Add five permissions

`api/src/types/permissions.ts` — extend `PERMISSIONS`, then grant all five to
`admin` and none to `admin_secretary`, which preserves today's behaviour exactly.

| New permission | Covers | Routes |
|---|---|---|
| `disputes:resolve` | the disputes queue and its three resolve endpoints | 6 |
| `refunds:manage` | refunds list, manual refund, failures, retry, resolve-manual | 6 |
| `users:manage` | create / update / delete a user (`users:read` already covers GET) | 3 |
| `policies:manage` | cancellation policies | 3 |
| `payments:read:all` | the global payments listing | 1 |

Existing permissions cover the rest: `bookings:read:all` (admin bookings list),
`queue:decide` (approve/reject on venue, asset, service, template,
event-request), `categories:manage`, `roles:manage`.

### 1b. Convert the 37 routes

| Permission | Routes | Where |
|---|---|---|
| `disputes:resolve` | 6 | admin.routes |
| `refunds:manage` | 6 | admin.routes |
| `bookings:read:all` | 1 | admin.routes |
| `users:read` / `users:manage` | 1 / 3 | users.routes |
| `queue:decide` | 11 | venue (2), asset (2), service (2), event-template (2), event-request (3) |
| `categories:manage` | 3 | category.routes |
| `policies:manage` | 3 | cancellation-policy.routes |
| `roles:manage` | 2 | role-request.routes |
| `payments:read:all` | 1 | payment.routes |
| **Total** | **37** | matches the 37 `requireAdmin` registrations exactly |

`queue:decide` said 9 in the first draft and the table summed to 35 against a
measured 37. Re-run against the parser: the eleven are `approve`/`reject` on
venue, asset, service and event-template, plus `approve`/`reject`/`complete` on
event-request. The lesson is the one this file keeps repeating — a number nobody
re-derives is a number that drifts, including in the document telling you not to
let numbers drift.

Mechanical once 1a lands. `admin_secretary` gains nothing, which is the point:
the secretary's surface must not change in Phase 1.

### 1c. The app stops keeping its own grants

**Decision: roles and permissions come from the backend. The app holds no grant
table.** Today `app/src/shared/lib/permissions.ts` carries a second copy of
`GRANTS`, and `hasPermission()` uses it whenever the user object has no
`permissions` array. Two hand-maintained copies of one truth is the shape that
drifts — mapanytime's client copy has already drifted so far that none of its
role names or permission codes exist in its own API.

So the app's copy goes, and the API becomes the only place a grant is written.

**This has a hard prerequisite, and getting the order wrong closes the admin
console.** `hasPermission` falls back to the local table precisely because
`/profile` does not return permissions: `ProfileSvc.getProfile` returns the
`User` row, and `permissions` is not a column. Every `/profile`-sourced check —
`requireAdmin()` in `server/auth.ts`, `AdminAuthGuard` — currently answers from
the app's own table. Delete it before the API serves permissions and those
checks return `false` for everyone, including admins.

Order, across two repos that deploy separately:

1. **API first.** `ProfileSvc.getProfile` returns
   `permissions: permissionsForUser(user)` alongside the row — derived on read,
   never stored, so it cannot go stale against the grant table. `/auth/login`,
   `/auth/refresh-token` and the Google exchange already stamp the same list
   into the token claim; this closes the one path that does not.
2. **App second.** Delete `GRANTS` and `permissionsFor` from
   `shared/lib/permissions.ts`. `hasPermission(user, p)` becomes
   `user.permissions?.includes(p) ?? false` — one source, no fallback, no
   inference from a role name.

Once that lands, the app cannot compute a permission at all. It can only be
told one, which is the point.

## Phase 2 — bring RoleType into the model

### 2a. A second grant table, not a second mechanism

```ts
// api/src/types/permissions.ts
const ROLE_TYPE_GRANTS: Record<RoleType, readonly Permission[]> = {
  venueFoxer:   ["venue:manage"],
  gearFoxer:    ["asset:manage"],
  serviceFoxer: ["service:manage"],
  eventFoxer:   ["template:manage", "booking:check-in"],
  investor:     [],
};
```

With `payouts:onboard` folded into each foxer type — that is what
`stripe-connect/onboard` guards today with a four-role array:

```ts
const ROLE_TYPE_GRANTS: Record<RoleType, readonly Permission[]> = {
  venueFoxer:   ["venue:manage",    "payouts:onboard"],
  gearFoxer:    ["asset:manage",    "payouts:onboard"],
  serviceFoxer: ["service:manage",  "payouts:onboard"],
  eventFoxer:   ["template:manage", "booking:check-in", "payouts:onboard"],
  investor:     [],
};
```

`investor` holds nothing: it applies and is approved, but has nothing to manage.
`admin` holds none of these either — except `booking:check-in`, because
`requireHost` was `["eventFoxer", "admin"]`. Everything else on the supply side
was closed to admins before this change and stays closed.

Typed `Record<RoleType, …>` for the same reason as `GRANTS`: a sixth `RoleType`
fails to compile until someone decides what it may do.

### 2b. `can()` takes a subject, not just a role

**Revised.** The first sketch called for a new `can(user, permission)` plus a
deprecated `can(role, permission)` overload and a migration of ~30 call sites.
One function over a union is better, and avoids the migration entirely:

```ts
export interface AuthorizationSubject {
  systemRole?: string | null;
  roleType?: readonly string[] | null;
}

export type PermissionSubject =
  | string
  | null
  | undefined
  | AuthorizationSubject;

export function can(subject: PermissionSubject, permission: Permission): boolean;
```

The object form is named rather than inlined: it is the authorization contract,
and it gets reused by `permissionsForUser`, `requirePermission` and the socket
gateway.

A bare role string answers from `GRANTS` alone; a user answers from both tables.
That means **no call-site migration and no deprecation window** — the 19 existing
`can(user.systemRole, …)` sites keep working and keep meaning exactly what they
say, while `requirePermission` passes the whole `req.user` and picks up the
supply axis for free. It also drops Phase 2's risk from medium to low: there is
no signature change to fan out.

A bare string can therefore never satisfy a supply-side permission. That is
correct rather than a limitation: a `SystemRole` alone does not grant one.

`permissionsFor(role)` is unchanged and still `SystemRole`-only.
`permissionsForUser({ systemRole, roleType })` merges and de-duplicates both,
and is what stamps the token claim.

**Token note:** tokens issued before this ship carry the old, shorter
`permissions` array. Enforcement is unaffected — the API re-derives from the
role on every request — so the only symptom is a UI that hides a control until
the next refresh. Worth knowing, not worth blocking on.

### 2c. Convert the remaining 25

23 `requireRole` plus the 2 `requireHost` check-in routes, using the mapping in
2a. `requireHost` today is `requireRole(["eventFoxer", "admin"])`, so
`booking:check-in` must be granted to **both** `eventFoxer` and `admin` — the
one place where a supply permission does reach admin, and it is deliberate.

## Invariants — what must stay true afterwards

### I0. One authorization model, two grant inputs

The phrase "one grant table" stops being true the moment `RoleType` joins, and
saying it anyway would contradict the code. The accurate claim, and the one the
architecture doc should carry:

```text
SystemRole ──┐
             ├──> permissionsForUser() ──> Permission[] ──> can() ──> requirePermission()
RoleType[] ──┘
```

**One permission vocabulary, one authorization API, one server-side authority —
with `SystemRole` and `RoleType` as two inputs resolving into the same set.**
`permissionsForUser()` is the canonical resolver; `permissionsFor(role)` stays
as the lower-level `SystemRole` helper its existing callers use.

Each of these is a test in Phase 4, not a paragraph anyone has to remember.

### I1. One mechanism

`SystemRole` and `RoleType` stay two grant *inputs* feeding one authorization
API: `permissionsForUser(subject)` → `can(subject, permission)` →
`requirePermission(permission)`. After Phase 3 there is no `requireRole`,
`requireAdmin` or `requireHost` to fall back into.

### I2. The JWT `permissions` claim is never an authorization source

`toAuthenticatedUser` drops the claim on the way in, and `can()` re-derives from
the role claims through the grant table. A token whose `permissions` array was
tampered with grants nothing.

**But be precise about what that does and does not buy**, because the obvious
stronger statement is not true and should not be written down as if it were.
The invariant is *not* "authorization always reflects the user's current role".
`req.user.systemRole` and `req.user.roleType` come from the **verified token**,
not from a database read. So:

```text
JWT roleType: ["eventFoxer"]      DB roleType: []
→ template:manage is ALLOWED until that access token expires
```

That staleness is not new and is not introduced by this plan — `systemRole` has
always come from the token, so a demoted admin keeps admin until their token
turns over. Making it genuinely current means a DB read on every authorized
request, which is exactly the cost declined in "Prior art".

Three honest options, in preference order:

1. **Revoke sessions when a role changes.** Password change and reset already
   revoke all sessions; role assignment is the same class of event and should do
   the same. That bounds staleness by an explicit action rather than by a
   timer, and it costs one call in the Phase 6 endpoint.
2. Accept the access-token TTL as the staleness window, and write it down.
3. A DB read per check — only if 1 and 2 ever prove insufficient.

The plan takes 1 and 2. Whoever builds Phase 6 must wire the revocation, or the
freshly-demoted keep their old powers for a token lifetime.

### I3. Fail closed on anything unrecognised

```ts
can("unknownRole", "users:manage") === false
can({ systemRole: "user", roleType: ["notARealRole"] }, "template:manage") === false
```

The `Record<SystemRole, …>` and `Record<RoleType, …>` types give exhaustiveness
for values the schema knows; these cover the values it does not, which is what
arrives from a claim.

### I4. A bare string means `SystemRole`, and only that

```ts
can("admin", "template:manage") === false                       // no RoleType in a string
can({ systemRole: "admin", roleType: ["eventFoxer"] }, "template:manage") === true
```

This is the mechanism that keeps `admin` out of the supply side. If a bare
string ever consults `ROLE_TYPE_GRANTS`, every admin silently gains every foxer
capability — the exact privilege-widening this conversion exists to avoid.

### I5. The admin exception matrix

The one supply permission an admin holds, and the four it does not:

| Subject | Permission | Expected |
|---|---|---|
| `eventFoxer` | `booking:check-in` | allow — it was `requireHost` |
| `admin` | `booking:check-in` | allow — `requireHost` was `["eventFoxer", "admin"]` |
| `admin` | `template:manage` | **deny** |
| `admin` | `venue:manage` | **deny** |
| `admin` | `asset:manage` | **deny** |
| `admin` | `service:manage` | **deny** |
| `admin` | `payouts:onboard` | **deny** — the guard listed four foxer types, not admin |

Encoded as tests so a future edit to the grant table cannot broaden
administrator capability without a red build.

### I6. The app owns no grant decision

The app holds the `Permission` type and the name catalogue. It holds no
`SystemRole → permissions` or `RoleType → permissions` map, and Phase 4 asserts
their absence.

## Phase 3 — remove the old mechanism

Only once Phases 1 and 2 leave them with zero call sites:

- delete `requireRole`, `requireAdmin`, `requireHost` from `auth.middleware.ts`
- delete `checkRole()` from `app/src/shared/lib/server/auth.ts` — already dead,
  zero call sites today
- decide `requireOwnerOrAdmin` (§3 of `TOMORROW.md`): it has no call sites
  either, and under the new model it is the *ownership* layer the spec's §11
  describes. Either implement §11 properly with it or delete it.

## Phase 4 — make the gap unable to reopen

The spec's §21, plus the two drift guards this codebase has already been bitten
by twice — inert query defaults, and a socket that was dead for weeks.

1. **The full matrix.** For every permission × every `SystemRole`, an explicit
   expected result. `permissions.spec.ts` already does this for the current
   seven; extend it as the table grows, and add the `RoleType` axis.
2. **Per-route triads.** For a representative route per permission:
   unauthenticated → 401, authenticated without it → 403, with it → 2xx. The
   `admin_secretary` cases are the ones that matter — they are the only proof
   the role is really constrained.
3. **A ban on role-name guards.** A source scan asserting that no file under
   `src/routes/` mentions `requireAdmin`, `requireHost` or `requireRole`, and
   that no file outside `permissions.ts` compares `systemRole` to a literal.
   Strip comments before matching, or the comment explaining the ban trips it.
5. **A missing-guard scan — the one that would have prevented all of this.**
   Every `router.<verb>()` registration carrying `authenticate` must also carry
   a `requirePermission`, or appear on an explicit allow-list of routes that are
   authenticated-but-not-capability-gated (a user reading their own profile, for
   instance). A protected route with no guard fails CI. The 62-route gap grew
   precisely because nothing asserted this, and the same parser that measured it
   can enforce it.
6. **The invariants above.** I3, I4 and I5 as table-driven tests — unknown roles,
   bare-string semantics, and the admin exception matrix.
4. **Name sync, and proof there is nothing else to sync.** Assert the app's
   `PERMISSIONS` array equals the API's — and assert the app source contains no
   grant table at all (no `GRANTS`, no role-to-permission map), so the
   backend-is-the-source decision in 1c cannot quietly reverse.

## Phase 5 — the app side

- `requireAdmin()` in `app/src/shared/lib/server/auth.ts` becomes
  `requirePermission("admin:access")`, so §8 of the spec describes something
  that exists. Same live `/profile` fetch underneath, now carrying the
  permissions the API derived.
- `requireHost()` becomes a permission check once 2a names the supply
  capabilities.

### What the app is still allowed to keep: the names

Deleting the grant table does not mean deleting the vocabulary. `AdminSidebar`
types each nav item as `permission: Permission`, and `hasPermission(user, "users:read")`
should not take a bare `string` — a typo would then be a silently-hidden menu
item rather than a compile error.

So the app keeps a **type-only** constant: the `PERMISSIONS` array of names, with
no grants attached. It is a mirror of names, not of decisions, and names change
far more rarely than grants do. Phase 4's sync test pins it against the API's
list, so a permission added on the server and used on the client cannot be
misspelled.

The alternative — fetching the catalogue from a `GET /permissions` endpoint and
typing the client as `string` — buys nothing today and loses compile-time
checking. It becomes the right answer only if a role-editing screen ever needs
to *render* the catalogue with names and descriptions, which is mapanytime's
reason for having one. Defer it until then.
- `AdminCitizenTable.tsx:324` compares `systemRole === "admin"` to render a
  badge. That is display, not authorization — leave it, and let the Phase 4 scan
  exempt `.tsx` render code explicitly rather than by accident.

## Phase 6 — how a role actually gets assigned

Open since §3c of `TOMORROW.md`: `admin_secretary` exists in the enum, in the
grant table, in the guards and in the nav — and **nobody holds it**, because
there is no way to give it to anyone. `roles:manage` covers role *applications*
(`RoleType`), not `SystemRole`. Today the only route in is a hand-written
`UPDATE` against the database.

Three options, and mapanytime has already run the experiment on the third:

| | What it is | Cost | Leaves behind |
|---|---|---|---|
| **Seeder** | a script that promotes a named email | an hour | nothing auditable; someone runs it on prod by hand |
| **Migration** | a one-off `UPDATE` in a migration | minutes | a specific person hardcoded in version control |
| **Screen** | `PATCH /admin/users/:id/system-role`, gated on a new `roles:assign`, plus a control on the citizens row | a day | the capability, reusable, logged |

**Recommended: the screen** — but only the assignment half. mapanytime's `/rbac`
module does two things: it assigns *roles to people*, and it edits *permissions
on roles* at runtime. The first is a gap we have; the second is a trade we have
already declined, because a compile-time grant table is what makes a new role a
type error instead of a support ticket. Take the half we are missing.

Scope, if it is built:

- `roles:assign` as a permission, granted to `admin` only. Not to
  `admin_secretary` — a role that can promote itself is not constrained.
- `PATCH /admin/users/:id/system-role`, validating against the `SystemRole` enum
  so the endpoint cannot write a role the grant table has never heard of.
- Refuse self-demotion, and refuse removing the last `admin`. Both are one query.
- **Revoke the target's sessions** on a successful change. This is I2's answer to
  staleness: without it, a demoted admin keeps admin until their access token
  expires, because the role comes from the token. The revocation machinery
  already exists — password change and reset use it.
- The citizens table already exists and is already gated on `users:read`; the
  control belongs on that row.

### Audit logging, and the one thing it costs

Changing someone's `SystemRole` is the most security-sensitive write in the
system, so it should leave a record: actor, target, previous role, new role,
timestamp, outcome — and, where the project's logging policy allows, request id,
IP and user agent.

**Record refusals as well as successes.** "Admin A tried to promote User B and
was denied" is the line that makes an escalation attempt visible; a log of
successes only shows you what worked.

**There is nowhere to put it today.** The schema has no `AuditLog` model — 41
models, none of them an audit trail — and `winston` is in `package.json` with
zero imports anywhere in `src`. So this needs a decision, not just a line of
code:

| Option | Cost | Worth |
|---|---|---|
| `AuditLog` model | a migration — the only schema change in this plan | queryable, survives log rotation, admissible when someone asks "who did this" |
| `console.error` with a structured prefix | nothing | gone with the container |
| Wire up the unused `winston` | small | depends entirely on whether logs are shipped anywhere |

Recommended: the `AuditLog` model, scoped to Phase 6. It is a real schema change
and it breaks this plan's "no schema change" claim — which is acceptable
precisely because Phase 6 is already the phase that needs its own approval, and
an unlogged privilege escalation is worse than a migration.

Depends on Phase 1 only. It can be built before Phase 2 or skipped entirely —
nothing else in this plan needs it.

## Order, and what each phase buys

| Phase | Buys | Risk |
|---|---|---|
| 1 | 37 of 62 routes on RBAC, no behaviour change | low — additive permissions, admin-only grants |
| 2 | the remaining 25, one model | low — `can()` widens to a union, no call site changes |
| 3 | no second mechanism to fall back into | low — deletions only |
| 4 | it cannot silently regress | low |
| 5 | the spec's §8 stops being aspirational | low |
| 6 | `admin_secretary` becomes assignable to a real person | low — one route, one permission |

Phase 1 is worth doing on its own even if Phase 0 goes the other way. Phase 4
is worth doing before Phase 3, so the deletions are covered when they land.
Phase 6 is independent of 2–5 and is the only one that changes what anyone can
do in production, because it is the only one that puts a person in a new role.

## Prior art — how mapanytime does it

Read directly from `GitHub/marketPlace/mapanytime-api` on 2 Sep. Its model is
the opposite trade to ours on almost every axis, which makes it useful.

| | mapanytime | FoxPassport |
|---|---|---|
| Grants live in | **DB rows** — `Roles`, `Permissions`, `RolePermissions`, seeded | a compile-time table |
| Cost per check | one `findUnique` with a three-level include, **per request** | a pure function, zero queries |
| Roles per user | many-to-many | one `SystemRole` (+ `RoleType[]`) |
| Editable at runtime | **yes** — `PUT /rbac/roles/:id/permissions` | no; needs a deploy |
| Token carries | role names | role + a `permissions` claim |
| Admin | **implicit full access, bypasses every check** | explicit grants, no bypass |
| Exhaustiveness | `Partial<Record<SystemRole, …>>` — a new role silently gets nothing | `Record<SystemRole, …>` — a new role fails to compile |

### Worth taking

- **A runtime RBAC surface.** `src/modules/rbac/` is four endpoints — list
  permissions, list roles, update a role's permissions, create a role — and it
  answers the question §3c of `TOMORROW.md` leaves open ("nobody has
  `admin_secretary` yet, and there is no UI to grant it: seeder, migration, or
  screen?"). Their answer is a screen, and it is small.
- **Gate the router, not the route.** `router.use(authenticate, requirePermission(PERMISSIONS.USERS_ROLES))`
  with a comment saying why: *"a new endpoint added below cannot accidentally
  ship unauthenticated."* That is a structural fix for the drift our own §7 flag
  pass found in `PROTECTED_ROUTES`.
- **Permissions carry `name` and `description` as data**, not as doc comments,
  because a role-editing screen has to render them. Ours are comments; they
  would have to become data the day Phase 5 grows a UI.
- **The seeder imports the gate constants**, so seeded codes and referenced
  codes cannot drift. Our equivalent risk is the app mirror, addressed by the
  Phase 4 sync test.

### Deliberately not taking

- **The admin short-circuit.** `permission.middleware.ts` resolves
  `isAdmin || hasPermission`, so an administrator passes every gate regardless of
  grants. That makes "withhold one capability from admin" inexpressible — which
  is precisely what `admin_secretary` exists to express here. Their own constants
  file carries the warning this produces: three codes are held by non-admins, so
  swapping `requireAdmin` for `requirePermission(code)` is "a privilege
  escalation, not a refactor". Our Phase 1 has no such hazard because grants are
  explicit on both sides.
- **A database read per authorization check.** It is the price of runtime-mutable
  grants. Worth paying only if we adopt the RBAC surface above — and even then,
  cache it or keep deriving from the verified token.
- **Their client-side RBAC.** `mapanytime-market-admin/src/shared/auth/rbac.ts`
  declares roles `admin`/`editor`/`viewer` and permissions `posts:create`,
  `posts:edit` — none of which exist in their API, whose roles are
  `SUPER_ADMIN … BUYER` and whose codes are `stores.approve` and friends. It is
  scaffolding wired to nothing: `usePermissions` and `<Can>` are imported only by
  their own feature manifest. This is the drifting-mirror failure already
  happened, and it is the argument for our Phase 4 sync test.

### One idea worth stealing from the dead code

That same stub types a permission as `boolean | ((context, user) => boolean)`,
and defines `"posts:edit": (ctx, user) => ctx.resourceOwnerId === user?.id`.
Ownership expressed *inside* the permission table rather than beside it. It
enforces nothing where it sits — client-side, unused — but it is exactly the
shape §11 of the spec describes, and the natural home for the
`requireOwnerOrAdmin` decision in Phase 3.

## What this plan does not do

- **No schema change in Phases 1–5.** `SystemRole` and `RoleType` keep their
  current values, and no table is added. Phase 6 is the exception and says so:
  audit logging needs an `AuditLog` model, and that phase carries its own
  approval anyway.
- **No new role.** `admin_secretary` still holds exactly three permissions when
  this is finished.
- **No widening.** Every conversion is intended to be behaviour-preserving; the
  Phase 4 triads are how that gets proved rather than asserted.
- **No runtime-editable grants.** The backend is the single source, but the
  source is still a compile-time table, not a database. "From the backend" means
  the app is told rather than inferring; it does not mean grants become data
  someone edits in production. That is mapanytime's model and §"Prior art"
  explains why it is declined.
