"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRoleAccess, RoleAccess } from "@/shared/auth/useRoleAccess";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";
import NotificationBell from "@/shared/components/layout/NotificationBell";
import { LOGO_SRC } from "@/shared/lib/assets";
import {
  useCreatorNavLinks,
  isCreatorLinkActive,
} from "@/features/dashboard/hooks/useCreatorNavLinks";
import { CreatorNavMoreSheet } from "./CreatorNavMoreSheet";

/** Tabs the mobile bar holds; past that, the last slot is "More". */
const MOBILE_TAB_SLOTS = 5;

interface DashboardHeaderProps {
  /** The caller already renders its own mobile bottom nav (e.g.
   * MobileCreatorHome's MobileCreatorBottomNav, which has a different tab
   * set) — skip this one's so mobile doesn't end up with two. */
  hideMobileBottomNav?: boolean;
}

export function DashboardHeader({
  hideMobileBottomNav = false,
}: DashboardHeaderProps = {}) {
  const user = useAuthStore((s) => s.user);
  const access = useRoleAccess();
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreMenuOpen]);

  const roleType = user?.roleType ?? [];
  const roleLabels: string[] = [];
  if (access.isMayor) roleLabels.push("Venue Foxer");
  // From the event permission: isHost (booking:check-in) is held by admins too.
  if (access.canManageEvents) roleLabels.push("Event Foxer");
  if (access.canManageInventory) roleLabels.push("Gear Foxer");
  if (access.canManageServices) roleLabels.push("Talent Foxer");
  if (access.canManagePerformers) roleLabels.push("Performer Foxer");
  if (roleType.includes("investor")) roleLabels.push("Partner Foxer");
  if (roleType.includes("organizer")) roleLabels.push("Organizer");

  // Compact role label display when user holds multiple roles
  const primaryRoleLabel =
    roleLabels.length === 0
      ? "Creator"
      : roleLabels.length === 1
        ? roleLabels[0]
        : `${roleLabels[0]} +${roleLabels.length - 1}`;
  const fullRoleTooltip = roleLabels.join(" · ") || "Creator";

  const { primaryLinks, secondaryLinks, allNavLinks } = useCreatorNavLinks();
  const useDropdown = allNavLinks.length > 5;
  // Every section stays reachable on a phone: past the slots, "More".
  const mobileOverflow = allNavLinks.length > MOBILE_TAB_SLOTS;
  const mobileTabs = mobileOverflow
    ? allNavLinks.slice(0, MOBILE_TAB_SLOTS - 1)
    : allNavLinks;
  const mobileMore = mobileOverflow
    ? allNavLinks.slice(MOBILE_TAB_SLOTS - 1)
    : [];

  return (
    <>
      <header className="fixed top-2 sm:top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-3.5 sm:px-5 h-14 sm:h-18 flex items-center justify-between shadow-2xl gap-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink-0"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={LOGO_SRC}
                  alt="FoxPassport Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm sm:text-base font-display font-bold text-white group-hover:text-accent transition-colors truncate">
                  FoxPassport
                </h2>
                <span className="hidden xl:block text-[9px] text-white/50 uppercase tracking-widest font-bold">
                  Creator Studio
                </span>
              </div>
            </Link>

            {/* Navigation — Compact pills with clean responsive density */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-black/40 p-1 rounded-full border border-white/5">
              {(useDropdown ? primaryLinks : allNavLinks).map((link) => {
                const isActive = isCreatorLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={
                      isActive
                        ? "px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold text-black bg-accent transition-all whitespace-nowrap"
                        : "px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Tools & More dropdown when nav items exceed 5 */}
              {useDropdown && (
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen((v) => !v)}
                    className={`px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
                      secondaryLinks.some((l) => pathname.startsWith(l.href))
                        ? "text-accent bg-white/10 font-bold"
                        : "text-white/65 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>More</span>
                    <span
                      className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                        moreMenuOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {moreMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-surface/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {secondaryLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        const icon = link.icon;
                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                              isActive
                                ? "bg-accent text-black shadow-md"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {icon}
                            </span>
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right Side — Real user profile & notifications */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {user && <NotificationBell />}
              <div className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2.5 border-l border-white/10">
                <div
                  className="text-right hidden sm:block max-w-[130px] lg:max-w-[160px]"
                  title={fullRoleTooltip}
                >
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    {user?.name || user?.email || "Creator"}
                  </div>
                  <div className="text-[11px] text-accent/80 font-semibold truncate">
                    {primaryRoleLabel}
                  </div>
                </div>
                {/* The app's shared pages too: this header has no app nav. */}
                <UserMenuButton showAppNav />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile floating capsule bottom tab bar */}
      {!hideMobileBottomNav && (
        <nav
          className="md:hidden fixed bottom-4 left-3 right-3 z-50 flex items-center justify-around px-2"
          style={{
            height: 60,
            background: "rgba(20,22,27,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid color-mix(in srgb, var(--color-white) 12%, transparent)",
            borderRadius: 999,
            boxShadow: "0 10px 40px rgba(0,0,0,0.65)",
          }}
        >
          {mobileTabs.map((link) => {
            const isActive = isCreatorLinkActive(pathname, link.href);
            const icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    color: isActive ? "#C4E85A" : "rgba(255,255,255,0.45)",
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {icon}
                </span>
                <span
                  className="text-[9px] font-bold truncate max-w-full px-1"
                  style={{
                    color: isActive ? "#C4E85A" : "rgba(255,255,255,0.45)",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
          {mobileOverflow && <CreatorNavMoreSheet links={mobileMore} />}
        </nav>
      )}
    </>
  );
}

interface WelcomeBannerProps {
  isCreateMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggleCreateMenu: () => void;
  onNavigateToCreateEvent: () => void;
  onNavigateToCreateVenue: () => void;
  onNavigateToCreateInventory: () => void;
  onNavigateToCreateService: () => void;
  onNavigateToCreatePerformerService?: () => void;
  access: RoleAccess;
}

interface CreateItem {
  label: string;
  icon: string;
  iconColor: string;
  allowed: boolean;
  requiredRole: string;
  applyHref: string;
  onClick: () => void;
}

export function WelcomeBanner({
  isCreateMenuOpen,
  menuRef,
  onToggleCreateMenu,
  onNavigateToCreateEvent,
  onNavigateToCreateVenue,
  onNavigateToCreateInventory,
  onNavigateToCreateService,
  onNavigateToCreatePerformerService,
  access,
}: WelcomeBannerProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const createItems: CreateItem[] = [
    {
      label: "Event",
      icon: "event",
      iconColor: "text-accent",
      allowed: access.canManageEvents,
      requiredRole: "Event Foxer",
      applyHref: "/creator-dashboard/apply",
      onClick: onNavigateToCreateEvent,
    },
    {
      label: "Venue",
      icon: "apartment",
      iconColor: "text-pink-500",
      allowed: access.canManageVenues,
      requiredRole: "Venue Foxer",
      applyHref: "/venue-foxer/apply",
      onClick: onNavigateToCreateVenue,
    },
    {
      label: "Item",
      icon: "inventory_2",
      iconColor: "text-purple-400",
      allowed: access.canManageInventory,
      requiredRole: "Gear Foxer",
      // The role's own application, as the Studios link (roleCatalog).
      applyHref: "/foxer/apply?type=asset",
      onClick: onNavigateToCreateInventory,
    },
    {
      label: "Service",
      icon: "design_services",
      iconColor: "text-yellow-400",
      allowed: access.canManageServices,
      requiredRole: "Talent Foxer",
      applyHref: "/foxer/apply?type=service",
      onClick: onNavigateToCreateService,
    },
    {
      label: "Performer Service",
      icon: "theater_comedy",
      iconColor: "text-amber-500",
      allowed: access.canManagePerformers,
      requiredRole: "Performer Foxer",
      applyHref: "/foxer/apply?type=performer",
      onClick: onNavigateToCreatePerformerService || onNavigateToCreateService,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 mb-3">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/90">
            Creator Studio
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold mb-1.5 leading-tight">
          Welcome back,{" "}
          <span className="text-white">
            {user?.name?.split(" ")[0] || "Creator"}!
          </span>
        </h1>
        {/* Organizers, Investors and admins create no listings: no empty
            "You have access to" and no menu of locked items. */}
        {access.hasListings && (
        <p className="text-sm text-white/50">
          You have access to{" "}
          {[
            access.canManageVenues && (
              <span key="v" className="text-white font-bold">
                Venues
              </span>
            ),
            access.canManageEvents && (
              <span key="e" className="text-white font-bold">
                Events
              </span>
            ),
            access.canManageInventory && (
              <span key="i" className="text-white font-bold">
                Inventory
              </span>
            ),
            access.canManageServices && (
              <span key="s" className="text-white font-bold">
                Services
              </span>
            ),
            access.canManagePerformers && (
              <span key="p" className="text-white font-bold">
                Performers
              </span>
            ),
          ]
            .filter(Boolean)
            .reduce<React.ReactNode[]>(
              (acc, el, i) => (i === 0 ? [el] : [...acc, ", ", el]),
              [],
            )}
        </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
        <Link
          href="/creator-dashboard/calendar"
          className="px-5 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 flex items-center justify-center gap-2 text-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            calendar_month
          </span>
          Calendar
        </Link>
        {access.hasListings && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleCreateMenu}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-accent text-black font-bold flex items-center justify-center gap-2 text-sm hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Create New
          </button>

          {isCreateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {createItems.map((item, i) => (
                <React.Fragment key={item.label}>
                  {i === 2 && <div className="h-px bg-white/5" />}
                  {item.allowed ? (
                    <button
                      onClick={item.onClick}
                      className="w-full text-left px-4 py-3.5 hover:bg-white/10 text-sm flex items-center gap-3 transition-colors"
                    >
                      <span
                        className={`material-symbols-outlined ${item.iconColor} text-[18px]`}
                      >
                        {item.icon}
                      </span>
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(item.applyHref)}
                      className="w-full text-left px-4 py-3.5 hover:bg-white/5 text-sm flex items-center gap-3 opacity-40 hover:opacity-60 transition-opacity group"
                      title={`Apply as ${item.requiredRole} to unlock`}
                    >
                      <span
                        className={`material-symbols-outlined ${item.iconColor} text-[18px]`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 text-white/60">{item.label}</span>
                      <span className="material-symbols-outlined text-[14px] text-white/30 group-hover:text-accent/60 transition-colors">
                        lock
                      </span>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
