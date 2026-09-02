/**
 * The permission vocabulary — names only.
 *
 * Mirrors `PERMISSIONS` in
 * `fox-passport-republic-api/src/types/permissions.ts`. **Names, never grants.**
 * Which role holds which permission is the API's decision and lives only there;
 * this app is told the answer on every user it receives (login, refresh, the
 * Google exchange, `/profile`) and derives nothing.
 *
 * These are here rather than fetched because they are needed at *compile* time:
 * `permission: Permission` on a nav item, and `hasPermission(user, "users:read")`
 * with a typo caught by tsc rather than by a menu that silently never renders.
 * A runtime catalogue would type as `string` and lose exactly that.
 *
 * `permissions.test.ts` asserts this list equals the API's, so drift is a red
 * build rather than a discovery.
 */
export const PERMISSIONS = [
  // Console and queues
  "admin:access",
  "queue:read",
  "queue:decide",

  // Administration
  "users:read",
  "users:manage",
  "roles:manage",
  "categories:manage",
  "policies:manage",

  // Money and disputes
  "bookings:read:all",
  "payments:read:all",
  "disputes:resolve",
  "refunds:manage",

  // The supply side — held through RoleType, not SystemRole
  "venue:manage",
  "asset:manage",
  "service:manage",
  "template:manage",
  "booking:check-in",
  "payouts:onboard",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
