"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { hasPermission, canAccessAdmin } from "@/shared/lib/permissions";

export interface RoleAccess {
  canManageVenues: boolean; // venue:manage
  canManageEvents: boolean; // template:manage
  canManageInventory: boolean; // asset:manage
  canManageServices: boolean; // service:manage
  isAdmin: boolean;
  isMayor: boolean;
  isHost: boolean;
  isFoxer: boolean;
}

/**
 * What the signed-in person may manage on the creator dashboard — derived
 * from the server-issued `permissions` list, never from role names.
 *
 * This used to read `roleType` and `systemRole` directly, which got three
 * things wrong (roles-and-spaces.md §4): a Gear Foxer and a Service Foxer
 * were cross-granted each other's UI through a shared `isFoxer` flag, an
 * admin saw every provider section unlocked even though the API withholds
 * `venue:manage` / `asset:manage` / `service:manage` / `template:manage` from
 * `admin`, and a dead `super_admin` branch checked a role nobody can hold.
 * Each field below now maps to exactly one permission, so it cannot diverge
 * from what the API will actually allow.
 */
export function useRoleAccess(): RoleAccess {
  const user = useAuthStore((s) => s.user);

  const canManageVenues = hasPermission(user, "venue:manage");
  const canManageEvents = hasPermission(user, "template:manage");
  const canManageInventory = hasPermission(user, "asset:manage");
  const canManageServices = hasPermission(user, "service:manage");
  const isHost = hasPermission(user, "booking:check-in");

  return {
    canManageVenues,
    canManageEvents,
    canManageInventory,
    canManageServices,
    isAdmin: canAccessAdmin(user),
    isMayor: canManageVenues,
    isHost,
    isFoxer: canManageInventory || canManageServices,
  };
}
