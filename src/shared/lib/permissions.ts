/**
 * What the signed-in person is allowed to do.
 *
 * Mirrors the grant table in
 * `fox-passport-republic-api/src/types/permissions.ts`. The server is the only
 * thing that *enforces* these — every guarded route re-derives them from the
 * role — so this copy decides what to render, never what is permitted. Getting
 * it wrong shows someone a button that then 403s; it cannot grant them
 * anything.
 *
 * Access tokens now carry a `permissions` claim, so where a caller has the
 * user's own list it is preferred over this table; the table is the fallback
 * for a profile fetched before that claim existed.
 */

export const PERMISSIONS = [
  "admin:access",
  "queue:read",
  "queue:decide",
  "users:read",
  "roles:manage",
  "categories:manage",
  "bookings:read:all",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const GRANTS: Record<string, readonly Permission[]> = {
  user: [],
  // Works the approval queues without seeing who anyone is: no citizens list,
  // no role applications, no category management.
  admin_secretary: ["admin:access", "queue:read", "queue:decide"],
  admin: [...PERMISSIONS],
};

interface RoleBearer {
  systemRole?: string | null;
  permissions?: string[] | null;
}

export function permissionsFor(role: string | null | undefined): Permission[] {
  if (!role) return [];
  return [...(GRANTS[role] ?? [])];
}

export function hasPermission(
  user: RoleBearer | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  // The user's own list wins when the token or profile carried one.
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  return permissionsFor(user.systemRole).includes(permission);
}

/** True for any role that may open the admin console at all. */
export function canAccessAdmin(user: RoleBearer | null | undefined): boolean {
  return hasPermission(user, "admin:access");
}
