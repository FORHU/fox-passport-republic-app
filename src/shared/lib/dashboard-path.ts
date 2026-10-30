import type { RoleType, User } from "@/shared/auth/types";
import { canAccessAdmin, hasPermission } from "@/shared/lib/permissions";

/** Where a signed-in user lives. "/" is the public landing page. */
export const APP_HOME = "/search";

/** RoleTypes that grant access to the supply-side (creator) dashboard. */
export const CREATOR_ROLE_TYPES: readonly RoleType[] = [
  "eventFoxer",
  "venueFoxer",
  "gearFoxer",
  "serviceFoxer",
  // Their payouts and Stripe onboarding live on the creator dashboard.
  "performerFoxer",
  // Invitations and the teams they help run live on the dashboard.
  "organizer",
  // Partnerships, investments and payouts live on the dashboard too —
  // `requireHost()` already admits them; this link just never sent them.
  "investor",
];

/**
 * Who may open the creator dashboard: any CREATOR_ROLE_TYPES holder, or an
 * admin with the all-bookings override. The one answer shared by
 * `requireHost`, the user menu and sign-in landing, so a menu entry never
 * leads to a page that bounces. The admin secretary lacks the override.
 */
export function canAccessCreatorDashboard(
  user:
    Pick<User, "roleType" | "permissions" | "systemRole"> | null | undefined,
): boolean {
  if (!user) return false;
  if (hasPermission(user, "bookings:read:all")) return true;
  return (user.roleType ?? []).some((role) =>
    CREATOR_ROLE_TYPES.includes(role),
  );
}

/**
 * Where a user's "go to my dashboard" link should point.
 *
 * This was previously copy-pasted into 13 components as a switch over
 * `user.role`, matching `super_admin`, `host`, `mayor`, and `foxer`. None of
 * those values exist any more: `systemRole` is `user`, `admin_secretary` or
 * `admin`, and the supply-side roles moved to the `roleType` array under their
 * Foxer names, so every non-admin fell through to `/user` — including
 * EventFoxers and VenueFoxers, who should land on the creator dashboard.
 */
export function getDashboardPath(
  user: Pick<User, "systemRole" | "roleType"> | null | undefined,
): string {
  if (!user) return "/user";
  if (canAccessAdmin(user)) return "/admin";

  const roleTypes = user.roleType ?? [];
  if (roleTypes.some((role) => CREATOR_ROLE_TYPES.includes(role))) {
    return "/creator-dashboard";
  }

  return "/user";
}

/**
 * Where a fresh sign-in lands when no return path is remembered. Admins and
 * supply-side roles (investors included) go to their dashboard, as
 * `getDashboardPath`; a plain citizen lands on Foxers (`APP_HOME`), the
 * default entry in the user menu, since their dashboard is Passport in the
 * top bar.
 */
export function getLandingPath(
  user: Pick<User, "systemRole" | "roleType"> | null | undefined,
): string {
  const dashboard = getDashboardPath(user);
  return dashboard === "/user" ? APP_HOME : dashboard;
}
