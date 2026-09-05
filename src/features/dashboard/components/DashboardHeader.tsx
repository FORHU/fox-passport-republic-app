"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRoleAccess, RoleAccess } from "@/shared/auth/useRoleAccess";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";
import NotificationBell from "@/shared/components/layout/NotificationBell";

const NAV_ICONS: Record<string, string> = {
  Overview: "dashboard",
  Events: "celebration",
  Venues: "location_city",
  Assets: "inventory_2",
  Services: "design_services",
  "Check In": "qr_code_scanner",
};

export function DashboardHeader() {
  const user = useAuthStore((s) => s.user);
  const access = useRoleAccess();
  const pathname = usePathname();

  const roleLabels: string[] = [];
  if (access.isMayor) roleLabels.push("Venue Foxer");
  if (access.isHost) roleLabels.push("Event Foxer");
  if (access.isFoxer) roleLabels.push("Foxer");
  const roleLabel = roleLabels.length > 0 ? roleLabels.join(" · ") : "Creator";

  const navLinks = [
    { label: "Overview", href: "/creator-dashboard" },
    access.canManageEvents && {
      label: "Events",
      href: "/creator-dashboard/events",
    },
    access.canManageVenues && {
      label: "Venues",
      href: "/creator-dashboard/venues",
    },
    access.canManageInventory && {
      label: "Assets",
      href: "/creator-dashboard/assets",
    },
    access.canManageServices && {
      label: "Services",
      href: "/creator-dashboard/services",
    },
    access.isHost && {
      label: "Check In",
      href: "/creator-dashboard/check-in",
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-display font-bold text-white group-hover:text-[#ccff00] transition-colors">
                  FoxPassport
                </h2>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                  Creator Dashboard
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-black/30 p-1.5 rounded-full border border-white/5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/creator-dashboard"
                    ? pathname === "/creator-dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={
                      isActive
                        ? "px-5 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                        : "px-5 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side — real user */}
            <div className="flex items-center gap-4">
              {user && <NotificationBell />}
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold">
                    {user?.name || user?.email || "Creator"}
                  </div>
                  <div className="text-xs text-[#ccff00]/70 font-semibold">
                    {roleLabel}
                  </div>
                </div>
                <UserMenuButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile floating capsule bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-5 left-5 right-5 z-50 flex items-center justify-around px-4"
        style={{
          height: 64,
          background: "rgba(20,20,26,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 999,
          boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
        }}
      >
        {navLinks.map((link) => {
          const isActive =
            link.href === "/creator-dashboard"
              ? pathname === "/creator-dashboard"
              : pathname.startsWith(link.href);
          const icon = NAV_ICONS[link.label] ?? "circle";
          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  color: isActive ? "#ccff00" : "rgba(255,255,255,0.4)",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
              <span
                className="text-[9px] font-bold whitespace-nowrap"
                style={{
                  color: isActive ? "#ccff00" : "rgba(255,255,255,0.4)",
                }}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
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
  access,
}: WelcomeBannerProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const createItems: CreateItem[] = [
    {
      label: "Event",
      icon: "event",
      iconColor: "text-[#ccff00]",
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
      requiredRole: "Foxer (Asset)",
      applyHref: "/onboarding",
      onClick: onNavigateToCreateInventory,
    },
    {
      label: "Service",
      icon: "design_services",
      iconColor: "text-yellow-400",
      allowed: access.canManageServices,
      requiredRole: "Foxer (Service)",
      applyHref: "/onboarding",
      onClick: onNavigateToCreateService,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-3">
          <span className="flex h-2 w-2 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/90">
            Creator Studio
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold mb-1.5 leading-tight">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            {user?.name?.split(" ")[0] || "Creator"}!
          </span>
        </h1>
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
          ]
            .filter(Boolean)
            .reduce<React.ReactNode[]>(
              (acc, el, i) => (i === 0 ? [el] : [...acc, ", ", el]),
              [],
            )}
        </p>
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleCreateMenu}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ccff00] text-black font-bold flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Create New
          </button>

          {isCreateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
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
                      <span className="material-symbols-outlined text-[14px] text-white/30 group-hover:text-[#ccff00]/60 transition-colors">
                        lock
                      </span>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
