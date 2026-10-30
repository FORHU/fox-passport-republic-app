"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";
import { canAccessCreatorDashboard } from "@/shared/lib/dashboard-path";

export interface CreatorNavLink {
  label: string;
  href: string;
  /** Material Symbols name. */
  icon: string;
}

/**
 * The creator dashboard's sections, each shown only to the permissions that
 * can use it. One list for the desktop tabs and both mobile bars, so a phone
 * reaches every section the desktop shows (the mobile bars used to cut or
 * drop some).
 */
export function useCreatorNavLinks() {
  const user = useAuthStore((s) => s.user);
  const access = useRoleAccess();
  const roleType = user?.roleType ?? [];
  const isOrganizer = roleType.includes("organizer");

  // Primary workspace links
  const primaryLinks = [
    // A Check-in Helper can be a plain user: the check-in page is open to
    // them, the overview (requireHost) isn't.
    canAccessCreatorDashboard(user) && {
      label: "Overview",
      href: "/creator-dashboard",
      icon: "dashboard",
    },
    access.canManageEvents && {
      label: "Events",
      href: "/creator-dashboard/events",
      icon: "celebration",
    },
    access.canManageVenues && {
      label: "Venues",
      href: "/creator-dashboard/venues",
      icon: "location_city",
    },
    access.canManageInventory && {
      label: "Assets",
      href: "/creator-dashboard/assets",
      icon: "inventory_2",
    },
    access.canManageServices && {
      label: "Services",
      href: "/creator-dashboard/services",
      icon: "design_services",
    },
    access.canManagePerformers && {
      label: "Performers",
      href: "/creator-dashboard/performers",
      icon: "theater_comedy",
    },
    // An Investor's whole workspace — it had no way in from the nav.
    access.canProposePartnerships && {
      label: "Partnerships",
      href: "/creator-dashboard/partnerships",
      icon: "handshake",
    },
  ].filter(Boolean) as CreatorNavLink[];

  // Secondary tools & operations
  const secondaryLinks = [
    // Organizers & Check-in Helpers for every Venue and Event you own.
    (access.canManageEvents || access.canManageVenues) && {
      label: "Team",
      href: "/creator-dashboard/team",
      icon: "groups",
    },
    // An Event Foxer's venue approvals — they can't publish without one. The
    // page shows the Event Foxer side only; a Mayor approves from the venue.
    access.canManageEvents && {
      label: "Affiliations",
      href: "/foxer/affiliations",
      icon: "link",
    },
    // Owners receive the proposals Investors send them.
    !access.canProposePartnerships &&
      (access.canManageEvents || access.canManageVenues) && {
        label: "Partnerships",
        href: "/creator-dashboard/partnerships",
        icon: "handshake",
      },
    // Events' marketplace picks for providers to confirm; it had no link.
    (access.canManageVenues || access.isFoxer) && {
      label: "Requests",
      href: "/foxer/marketplace-requests",
      icon: "inbox",
    },
    access.canManagePromotions && {
      label: "Promotions",
      href: "/creator-dashboard/promotions",
      icon: "sell",
    },
    // Check-in is decided per event by the API: owners, their Organizers,
    // and the venue's Mayor on the day. The global booking:check-in
    // permission (which admins hold too) doesn't let anyone check in.
    (access.canManageEvents || access.canManageVenues || isOrganizer) && {
      label: "Check In",
      href: "/creator-dashboard/check-in",
      icon: "qr_code_scanner",
    },
    // An Organizer gets no platform pay (ADR 0005) — nothing to see here.
    access.canReceivePayouts && {
      label: "Earnings",
      href: "/creator-dashboard/earnings",
      icon: "account_balance_wallet",
    },
  ].filter(Boolean) as CreatorNavLink[];

  return {
    primaryLinks,
    secondaryLinks,
    allNavLinks: [...primaryLinks, ...secondaryLinks],
  };
}

/** The overview matches only itself; every other section, its subpages too. */
export function isCreatorLinkActive(pathname: string, href: string): boolean {
  return href === "/creator-dashboard"
    ? pathname === href
    : pathname.startsWith(href);
}
