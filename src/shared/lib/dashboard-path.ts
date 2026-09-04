import type { RoleType, User } from "@/shared/auth/types";
import { canAccessAdmin } from "@/shared/lib/permissions";

/** RoleTypes that grant access to the supply-side dashboard. */
const SUPPLY_ROLE_TYPES: RoleType[] = [
  "eventFoxer",
  "venueFoxer",
  "gearFoxer",
  "serviceFoxer",
];

/**
 * Where a user's "go to my dashboard" link should point.
 *
 * This was previously copy-pasted into 13 components as a switch over
 * `user.role`, matching `super_admin`, `host`, `mayor`, and `foxer`. None of
 * those values exist any more: `systemRole` is only `user | admin`, and the
 * supply-side roles moved to the `roleType` array under their Foxer names, so
 * every non-admin fell through to `/user` — including EventFoxers and
 * VenueFoxers, who should land on the creator dashboard.
 */
export function getDashboardPath(
  user: Pick<User, "systemRole" | "roleType"> | null | undefined,
): string {
  if (!user) return "/user";
  if (canAccessAdmin(user)) return "/admin";

  const roleTypes = user.roleType ?? [];
  if (roleTypes.some((role) => SUPPLY_ROLE_TYPES.includes(role))) {
    return "/creator-dashboard";
  }

  return "/user";
}
