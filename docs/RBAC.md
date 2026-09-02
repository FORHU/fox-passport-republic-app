# FoxPassport — Architecture & Pure RBAC

**Target state, written 2 September 2026.** Sections 1–4, 6, 7, 9, 10, 13–19 are
as built. Sections 5, 8, 11, 12, 20 and 21 describe where the system is going,
not where it is — see **Conformance** at the end for the measured gap. Do not
circulate this as a description of the running system without that section.

## 1. System Architecture

FoxPassport is composed of two repositories that operate as one system:

|                    | `fox-passport-republic-api`                                         | `fox-passport-republic-app`                                   |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| Stack              | Express 4 + TypeScript + Prisma 7 + PostgreSQL                      | Next.js 16 + React 19 + TypeScript                            |
| Port               | 6002                                                                | 6001                                                          |
| Responsibility     | Data, authentication, authorization, business logic, payments, mail | Rendering, session cookies, UI, client state, realtime client |
| Security Authority | **Yes — sole authorization authority**                              | No                                                            |

The API is the single security boundary. The application never holds the JWT signing secret and cannot mint or authorize tokens.

---

# 2. Runtime Architecture

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
                Next.js       API Proxy        Socket.IO
                Server         Handler             │
                    │               │              │
                    │ Bearer        │ Bearer       │ Ticket
                    └───────────────┼──────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │     Express API     │
                         │                     │
                         │ Authentication      │
                         │        ↓            │
                         │ RBAC Authorization  │
                         │        ↓            │
                         │ Routes / Services   │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
               PostgreSQL         Redis        External APIs
                                               Stripe / S3 / Email
```

---

# 3. Authentication

Authentication and authorization are separate concerns.

```text
Authentication
      ↓
Who is the user?
      ↓
Authenticated identity
      ↓
Access / Refresh Token
```

Cookies:

| Cookie              | httpOnly | Purpose                  |
| ------------------- | -------: | ------------------------ |
| `fox_token`         |      Yes | Access JWT               |
| `fox_refresh_token` |      Yes | Rotating refresh token   |
| `fox_user`          |       No | Display information only |

`fox_user` is never trusted for authentication or authorization.

The Next.js application does **not** contain `ACCESS_TOKEN_SECRET`.

The API is responsible for token verification and user identity.

---

# 4. Pure RBAC Authorization

Authorization uses a single centralized RBAC model.

```text
User
  ↓
SystemRole
  ↓
Role Grant Table
  ↓
Permissions
  ↓
Authorization Decision
```

The RBAC implementation lives in:

```text
api/src/types/permissions.ts
```

The grant table is the single source of truth:

```ts
export const PERMISSIONS = [
  "admin:access",
  "queue:read",
  "queue:decide",
  "users:read",
  "roles:manage",
  "categories:manage",
  "bookings:read:all",
] as const;

const GRANTS: Record<SystemRole, readonly Permission[]> = {
  user: [],

  admin_secretary: [
    "admin:access",
    "queue:read",
    "queue:decide",
  ],

  admin: [
    "admin:access",
    "queue:read",
    "queue:decide",
    "users:read",
    "roles:manage",
    "categories:manage",
    "bookings:read:all",
  ],
};
```

Authorization helpers:

```ts
can(role, permission)
permissionsFor(role)
```

`can()` accepts a plain string because roles originate from JWT claims and returns `false` for unknown roles.

The typed `Record<SystemRole, ...>` ensures that adding a new Prisma `SystemRole` requires an explicit authorization decision.

---

# 5. Authorization Rules

The application uses **permissions instead of hard-coded role checks**.

Preferred:

```ts
requirePermission("queue:read")
requirePermission("users:read")
requirePermission("roles:manage")
```

Avoid:

```ts
requireAdmin()
```

and:

```ts
systemRole === "admin"
```

for authorization decisions.

If an operation is only available to `admin`, create a permission and grant it only to `admin`.

Example:

```text
refunds:manage
```

```text
admin             → allowed
admin_secretary   → denied
user              → denied
```

This keeps authorization consistently RBAC-based.

---

# 6. API Authorization

The API is the actual security boundary.

Request pipeline:

```text
Request
  ↓
Authentication
  ↓
req.user
  ↓
requirePermission(...)
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

Example:

```ts
router.get(
  "/admin/users",
  authenticate,
  requirePermission("users:read"),
  controller.listUsers
);
```

Responses:

```text
No authenticated user
        ↓
       401

Authenticated but missing permission
        ↓
       403

Permission granted
        ↓
      200
```

---

# 7. Server-Side Authorization Is Authoritative

JWT access tokens may contain a `permissions` claim for client-side convenience.

Example:

```json
{
  "userId": "...",
  "systemRole": "admin_secretary",
  "permissions": [
    "admin:access",
    "queue:read",
    "queue:decide"
  ]
}
```

However, the API does **not** trust the permissions claim for authorization.

The API:

```text
Verified JWT
    ↓
systemRole
    ↓
can(systemRole, permission)
    ↓
Authorization decision
```

`toAuthenticatedUser()` keeps only the trusted identity fields required by the API.

Unknown roles receive no permissions.

Therefore:

```text
Client permission data
        ↓
UX only

Server role
        ↓
Actual authorization
```

A compromised or incorrect client can never grant itself permissions.

---

# 8. Page Authorization

Next.js performs server-side authorization before rendering protected pages.

```text
Page
 ↓
requireAuth()
 ↓
Live /profile
 ↓
Current systemRole
 ↓
Permission check
 ↓
Render / Redirect
```

Page authorization must not depend solely on a stale JWT or client-side state.

If a user's role changes after login, the next server-side authorization check uses the current profile.

Example:

```ts
requirePermission("admin:access")
```

---

# 9. UI Authorization

The UI mirrors the RBAC permission model.

Each navigation item declares its required permission.

```ts
{
  label: "Users",
  permission: "users:read"
}
```

The UI uses:

```ts
hasPermission("users:read")
```

to determine visibility.

UI authorization is **not a security boundary**.

```text
UI hides button
       ↓
UX only

API permission check
       ↓
Security boundary
```

A user may theoretically see an unauthorized action due to stale client state, but the API must always reject it with `403`.

---

# 10. Socket Authorization

Socket authorization uses the same RBAC permission table.

```text
Socket Connection
       ↓
Socket Authentication
       ↓
systemRole
       ↓
can(systemRole, "queue:read")
       ↓
Join role:admin room
```

Users without:

```text
queue:read
```

must not join the administrative approval room.

This ensures Socket.IO does not introduce a separate authorization model.

---

# 11. Resource-Level Authorization

RBAC determines **what a role is allowed to do**.

Resource authorization determines **which specific resource they can act on**.

These are separate concerns.

```text
RBAC Permission
      +
Resource Ownership
      +
Business Rules
```

Example:

```ts
requirePermission("venues:manage");
```

Then the service may verify:

```ts
venue.ownerId === user.id
```

Therefore:

```text
RBAC
"What can this role do?"

Resource authorization
"Can this user do it to this resource?"

Business rules
"Is this operation valid right now?"
```

This should not be replaced by additional hard-coded role checks.

---

# 12. RoleType

`RoleType[]` is separate from `SystemRole`.

Current values:

```text
venueFoxer
eventFoxer
gearFoxer
serviceFoxer
investor
```

If `RoleType` is only business/domain information, it remains separate from RBAC.

If a `RoleType` determines what a user is authorized to do, it should eventually be represented through the RBAC permission system rather than becoming a second authorization mechanism.

The system should avoid having multiple competing authorization models.

---

# 13. Realtime Architecture

Socket.IO is used as an invalidation and notification mechanism, not as the authoritative data source.

```text
API Mutation
     ↓
Database Update
     ↓
Socket Invalidation
     ↓
Client receives topic
     ↓
React Query invalidates
     ↓
API refetch
     ↓
Fresh server data
```

Events:

```text
new_notification
data:invalidate
```

Topics are mapped to React Query keys.

Example:

```text
admin:pending
    ↓
admin-data

venues
    ↓
host-venues
host-venue-stats
host-data

bookings
    ↓
host-data
user-upcoming-events
admin-data
user-bookings
```

Socket failures must not cause a successful database operation to fail.

---

# 14. Realtime Fallback

Redis is used for socket tickets.

```text
Redis available
    ↓
Socket.IO realtime

Redis unavailable
    ↓
No socket ticket
    ↓
60-second polling fallback
```

Realtime is therefore an optimization rather than a hard dependency for core data correctness.

---

# 15. API Internal Architecture

```text
routes/
    ↓
controllers/
    ↓
services/
    ↓
repositories/
    ↓
Prisma
    ↓
PostgreSQL
```

### Routes

Responsible for:

* HTTP paths
* Middleware
* Authentication
* Authorization
* Validation

### Controllers

Responsible for:

* HTTP request/response handling
* Request shape
* Response shape

### Services

Responsible for:

* Business rules
* Transactions
* Money calculations
* Notifications
* Payments
* Payouts
* Domain workflows

### Repositories

Responsible for:

* Database access
* Prisma queries

---

# 16. Frontend Architecture

```text
src/
├── app/
│   ├── admin/
│   ├── booking/
│   ├── checkout/
│   ├── creator-dashboard/
│   ├── foxer/
│   ├── mayor/
│   ├── reviews/
│   └── api/proxy/
│
├── features/
│   ├── ...
│
└── shared/
    ├── lib/
    │   ├── axios
    │   ├── socket
    │   ├── realtime
    │   ├── permissions
    │   └── server/
    │       ├── auth
    │       ├── data
    │       └── auth-actions
    │
    └── providers/
        ├── Query
        ├── AuthStore
        └── Socket
```

React Query owns server state.

Zustand owns client-side state such as authentication and notifications.

---

# 17. API Proxy

Client requests use:

```text
Browser
   ↓
/api/proxy/[...path]
   ↓
Next.js Route Handler
   ↓
httpOnly fox_token
   ↓
Bearer header
   ↓
Express API
```

The access token never needs to be exposed to client-side JavaScript.

The proxy also handles:

```text
401
 ↓
Refresh token
 ↓
Retry original request
```

Concurrent refresh requests are deduplicated because refresh tokens are single-use.

---

# 18. Payments

Payment amounts are always calculated server-side.

```text
Client Items
    ↓
Server Pricing
    ↓
Discounts
    ↓
Fees
    ↓
Final Total
    ↓
Stripe
```

The client must never be trusted for:

* Final price
* Payment amount
* Fees
* Discounts
* Payout amount

Stripe webhooks are verified using the raw request body before JSON parsing.

---

# 19. Data Architecture

PostgreSQL is the source of truth for application data.

Core domains:

```text
People
├── User
├── RoleRequest
├── Applications
├── Passport
├── Badge
└── PassportStamp

Supply
├── Venue
├── Asset
├── Service
└── EventTemplate

Demand
├── Event
├── Booking
├── BookingAttendee
├── AssetBooking
├── ServiceBooking
└── Waitlist

Money
├── Payment
├── Payout
├── Refund
└── StripeEvent

Social
├── Review
├── ReviewReply
├── Favorite
└── Notification
```

---

# 20. Security Principles

FoxPassport follows these principles:

1. **API is the security boundary.**
2. **Authentication and authorization are separate.**
3. **RBAC is the single authorization model.**
4. **Permissions are centralized in one grant table.**
5. **No hard-coded role checks outside the RBAC implementation.**
6. **The client cannot grant itself permissions.**
7. **JWT permissions are informational for the client; the API re-derives permissions.**
8. **UI restrictions are convenience, not security.**
9. **Resource ownership is separate from RBAC.**
10. **Business rules are enforced server-side.**
11. **Money is calculated server-side.**
12. **Realtime is not the source of truth.**
13. **Database writes must not depend on successful socket announcements.**
14. **Unknown roles receive no permissions.**
15. **Every protected API operation requires explicit authorization.**

---

# 21. RBAC Testing Requirements

The RBAC system should test the complete permission matrix.

For every permission:

```text
user
admin_secretary
admin
```

must have an explicit expected result.

Every protected route should verify:

```text
Unauthenticated
    → 401

Authenticated + missing permission
    → 403

Authenticated + correct permission
    → Success
```

Tests should also enforce:

```text
No systemRole === "admin"
authorization checks outside RBAC
```

and:

```text
Every protected navigation item declares a permission.
```

---

# 22. Final Authorization Architecture

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ SystemRole   │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Grant Table  │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Permissions  │
                         └──────┬───────┘
                                │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
          REST API            Pages              Socket
             │                  │                  │
             ▼                  ▼                  ▼
        Authorization      Authorization      Authorization
             │                  │                  │
             └──────────────────┼──────────────────┘
                                ▼
                         Server-side truth
```

## Target State

The final model should be:

```text
Authentication
      ↓
Identity
      ↓
RBAC Permission
      ↓
Resource Ownership
      ↓
Business Rules
      ↓
Operation
```

There should be **one RBAC implementation, one permission vocabulary, one grant table, and one server-side authorization authority**.

The Next.js application, UI, and Socket.IO layer may consume the same permission model for user experience, but none of them can bypass the API's authorization boundary.

---

# 23. Conformance — measured 2 September 2026

Added to the spec above, not part of it. Every number here came from a grep, not
from memory.

| § | Claim | State | Evidence |
|---|---|---|---|
| 1–4 | Two repos, API sole authority, app holds no secret, grant table is the source of truth | **Holds** | `ACCESS_TOKEN_SECRET` absent from the app and pinned absent by `middlewareSecrets.test.ts` |
| 5 | Permissions instead of hard-coded role checks | **Partial** | No `systemRole === "admin"` remains in the API. But **62 routes across 13 files** — 37 `requireAdmin`, 23 `requireRole`, 2 `requireHost` — still authorize by role name. `requirePermission` is used in exactly one file, on 21 registrations. Counted by parsing every `router.<verb>()` block; an earlier grep said 39 because it missed the multi-line ones. |
| 6 | 401 / 403 / 200 pipeline | **Holds** where `requirePermission` is used | `auth.middleware.ts` |
| 7 | Server re-derives; claim is UX only | **Holds** | `toAuthenticatedUser` drops the `permissions` claim |
| 8 | Page authorization off a live profile | **Holds**, but by role helper | `requireAdmin()` → `canAccessAdmin()` on a live `/profile`. There is no app-side `requirePermission(...)`; §8's example does not exist yet. |
| 9 | Nav declares permissions | **Holds** | `AdminSidebar.NAV_ITEMS`, typed with `satisfies` |
| 10 | Socket uses the same table | **Holds** | gateway joins `role:admin` only on `can(role, "queue:read")` |
| 11 | RBAC + ownership as separate layers | **Partial** | Ownership checks exist inside services (`booking.userId !== requesterId`). They are not paired with a permission, and `venues:manage` from the example does not exist. |
| 12 | One authorization model | **Not yet** | `RoleType[]` is a second model: `requireHost` and `requireRole` authorize on it directly, with no grant table. |
| 13–19 | Realtime, layering, proxy, payments, data | **Holds** | |
| 20.5 | No hard-coded role checks outside RBAC | **Not yet** | the 62 above |
| 20.15 | Every protected operation requires explicit authorization | **Holds** | every non-public route carries `authenticate` plus a guard |
| 21 | Full permission matrix, per-route 401/403/200 | **Not yet** | `permissions.spec.ts` tests `can()` exhaustively; no test asserts a route's 401/403/200 triad |

## Closing the gap

Worked out in full in `RBAC-PLAN.md`; the outline is below.

In dependency order. Nothing here needs a schema change.

1. **Name the missing permissions.** The 14 `requireAdmin` routes in
   `admin.routes.ts` are bookings, disputes and refunds — they need
   `bookings:read:all` (exists) and something like `refunds:manage` and
   `disputes:resolve` (do not). One edit to `PERMISSIONS` and `GRANTS`.
2. **Convert those 14.** Mechanical once the names exist.
3. **Decide what `RoleType` is** (§12). If it authorizes, it needs its own
   capabilities — `listing:create`, `booking:read:own` and so on — and
   `requireHost` becomes `requirePermission`. That is the largest item, and it
   is a design decision about what the supply side may *do*, not a port.
4. **Retire `requireRole` / `requireAdmin` / `requireHost`** once 2 and 3 land,
   and delete the app's dead `checkRole()` (`server/auth.ts:47`, zero call
   sites).
5. **Add the §21 matrix test** and a lint-style test forbidding role-name guards
   outside `permissions.ts`, so the gap cannot reopen.
