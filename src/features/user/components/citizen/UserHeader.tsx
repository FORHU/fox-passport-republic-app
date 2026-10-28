"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import UserMenuButton from "@/features/user/components/UserMenuButton";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import NotificationBell from "@/shared/components/layout/NotificationBell";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { LOGO_SRC } from "@/shared/lib/assets";

interface UserHeaderProps {
  isAuthenticated: boolean;
  userName?: string;
}

const NAV_LINKS = [
  { label: "Dashboard", href: "/user" },
  { label: "My Bookings", href: "/booking" },
  { label: "Passport", href: "/user/passport" },
  { label: "Explore", href: "/" },
];

function getRoleLabel(systemRole: string, roleTypes: string[]): string {
  const role = systemRole.toLowerCase();
  if (role === "admin" || role === "super_admin") return "Admin";
  if (roleTypes.includes("venueFoxer")) return "Venue Foxer";

  const active: string[] = [];
  if (roleTypes.includes("eventFoxer")) active.push("Event Foxer");
  if (roleTypes.includes("gearFoxer")) active.push("Gear Foxer");
  if (roleTypes.includes("serviceFoxer")) active.push("Talent Foxer");

  return active.length > 0 ? active.join(" · ") : "Citizen";
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  isAuthenticated,
  userName,
}) => {
  const storeUser = useAuthStore((state) => state.user);

  const roleLabel = storeUser
    ? getRoleLabel(storeUser.systemRole ?? "", storeUser.roleType ?? [])
    : "Citizen";

  const displayName = storeUser?.name || userName || "User";

  return (
    <>
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full pl-4 pr-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 shadow-2xl">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden">
                <Image
                  src={LOGO_SRC}
                  alt="FoxPassport Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                FoxPassport
              </span>
            </Link>

            {/* Below lg the shared bottom nav takes over. */}
            <nav
              aria-label="Main"
              className="hidden lg:flex items-center gap-1 bg-black/20 p-1.5 rounded-full border border-white/5"
            >
              {NAV_LINKS.map((link) => {
                const current = link.href === "/user";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={
                      current
                        ? "px-5 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent-hover transition-colors"
                        : "px-5 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              {isAuthenticated && <NotificationBell />}

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-bold text-white leading-tight">
                      {displayName}
                    </p>
                    <p className="text-xs text-white/50">{roleLabel}</p>
                  </div>
                  <UserMenuButton />
                </div>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black hover:bg-accent-hover transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
};
