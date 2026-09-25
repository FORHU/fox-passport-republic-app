"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { hasPermission, canAccessAdmin } from "@/shared/lib/permissions";

export interface RoleAccess {
  canManageVenues: boolean; // venue:manage
  canManageEvents: boolean; // template:manage
  canManageInventory: boolean; // asset:manage
  canManageServices: boolean; // service:manage
  canManagePerformers: boolean; // performer:manage
  canManagePromotions: boolean; // promotions:manage-own
  isAdmin: boolean;
  isMayor: boolean;
  isHost: boolean;
  isFoxer: boolean;
  /** Holds at least one listing-producing role — a venue, event, asset,
   * service or performer offering of their own. What the dashboard's
   * supply-side widgets (KPIs, match requests) actually measure; an
   * Organizer or Investor holds neither this nor a listing, since neither
   * supplies anything themselves (ADR 0005; CONTEXT.md: Organizer). */
  hasListings: boolean;
  /** May receive a platform payout (`payouts:onboard`) — every Foxer and
   * Investor, never an Organizer: ADR 0005 is explicit that Organizers get
   * no platform pay, so Stripe onboarding has nothing for them to do. */
  canReceivePayouts: boolean;
}

/**
 * What the signed-in person may manage on the creator dashboard — derived
 * from the server-issued `permissions` list, never from role names.
 *
 * This used to read `roleType` and `systemRole` directly, which got three
 * things wrong (roles-and-spaces.md §4): a Equipment Foxer and a Talent Foxer
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
  const canManagePerformers = hasPermission(user, "performer:manage");
  const canManagePromotions = hasPermission(user, "promotions:manage-own");
  const isHost = hasPermission(user, "booking:check-in");

  return {
    canManageVenues,
    canManageEvents,
    canManageInventory,
    canManageServices,
    canManagePerformers,
    canManagePromotions,
    isAdmin: canAccessAdmin(user),
    isMayor: canManageVenues,
    isHost,
    // isFoxer covers all three provider roles so a pure performerFoxer
    // is not invisible on the dashboard
    isFoxer: canManageInventory || canManageServices || canManagePerformers,
    hasListings:
      canManageVenues ||
      canManageEvents ||
      canManageInventory ||
      canManageServices ||
      canManagePerformers,
    canReceivePayouts: hasPermission(user, "payouts:onboard"),
  };
}
