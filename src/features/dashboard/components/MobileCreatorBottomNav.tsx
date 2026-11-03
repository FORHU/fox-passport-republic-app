"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";
import { useCreatorNavLinks } from "@/features/dashboard/hooks/useCreatorNavLinks";
import { CreatorNavMoreSheet } from "./CreatorNavMoreSheet";

const BASE_TABS = [
  { icon: "dashboard", label: "Overview", href: "/creator-dashboard" },
  {
    icon: "calendar_month",
    label: "Calendar",
    href: "/creator-dashboard/calendar",
  },
  { icon: "person", label: "Profile", href: "/user/settings" },
];

export default function MobileCreatorBottomNav() {
  const pathname = usePathname();
  const access = useRoleAccess();
  const { canReceivePayouts, hasListings, canProposePartnerships } = access;
  const { allNavLinks } = useCreatorNavLinks();

  // The Listings tab opens the first listing type this person actually
  // manages — it used to always open Venues, an empty page for a Gear,
  // Talent, Performer or Event Foxer.
  const listingsHref = access.canManageVenues
    ? "/creator-dashboard/venues"
    : access.canManageEvents
      ? "/creator-dashboard/events"
      : access.canManageInventory
        ? "/creator-dashboard/assets"
        : access.canManageServices
          ? "/creator-dashboard/services"
          : "/creator-dashboard/performers";

  // An Organizer gets no platform pay (ADR 0005) — the tab used to sit here
  // regardless, pointing at a page that (now correctly) bounces them
  // straight back to this same dashboard.
  // The Listings tab is a Foxer's own inventory — nothing there for someone
  // who supplies nothing. An Investor's equivalent is their partnerships.
  const tabs = [
    BASE_TABS[0],
    hasListings && {
      icon: "grid_view",
      label: "Listings",
      href: listingsHref,
    },
    !hasListings &&
      canProposePartnerships && {
        icon: "handshake",
        label: "Partners",
        href: "/creator-dashboard/partnerships",
      },
    BASE_TABS[1],
    canReceivePayouts && {
      icon: "account_balance_wallet",
      label: "Earnings",
      href: "/creator-dashboard/earnings",
    },
  ].filter((x) => x !== false);

  // Every other section the desktop nav shows (Team, Check In, Promotions,
  // Partnerships, …) — this bar replaces the header's on the overview, and
  // used to leave them unreachable on a phone — then Profile.
  const tabHrefs = new Set(tabs.map((t) => t.href));
  const more = [
    ...allNavLinks.filter((link) => !tabHrefs.has(link.href)),
    BASE_TABS[2],
  ];

  const isActive = (href: string) =>
    href === "/creator-dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <div
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 72,
        height: "calc(58px + env(safe-area-inset-bottom, 14px))",
        zIndex: 50,
        background: "rgba(8,8,11,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid color-mix(in srgb, var(--color-white) 8%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 21,
                color: active ? "#C4E85A" : "rgba(255,255,255,0.35)",
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.04em",
                lineHeight: 1,
                color: active ? "#C4E85A" : "rgba(255,255,255,0.35)",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
      <div style={{ display: "flex" }}>
        <CreatorNavMoreSheet
          links={more}
          iconSize={21}
          labelClassName="text-[9px] font-bold tracking-[0.04em] leading-none"
        />
      </div>
    </div>
  );
}
