import { PERMISSIONS, type Permission } from "@/shared/constants/permissions";

/**
 * What the signed-in person is allowed to do — as the **server** decided it.
 *
 * The vocabulary lives in `shared/constants/permissions.ts`; this file is only
 * the question. It used to carry a second copy of the API's grant table and
 * fall back to it whenever a user arrived without a `permissions` array, which
 * meant two hand-maintained answers to one question. The API is now the only
 * place a grant is written: `permissionsForUser()` derives the list, and every
 * path that hands this app a user carries it.
 *
 * So the app can no longer *compute* a permission. It can only be told one.
 * Getting a name wrong shows someone a control that then 403s; it cannot grant
 * them anything, because the API re-derives every guard from the role.
 */

export { PERMISSIONS };
export type { Permission };

/**
 * Anything the app might have in hand for the current person. `permissions` is
 * the only field consulted — `systemRole` is display data here, never an input
 * to an authorization answer.
 */
export interface PermissionBearer {
  systemRole?: string | null;
  permissions?: readonly string[] | null;
}

export function hasPermission(
  user: PermissionBearer | null | undefined,
  permission: Permission,
): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

/** True for any role the server says may open the admin console at all. */
export function canAccessAdmin(
  user: PermissionBearer | null | undefined,
): boolean {
  return hasPermission(user, "admin:access");
}
