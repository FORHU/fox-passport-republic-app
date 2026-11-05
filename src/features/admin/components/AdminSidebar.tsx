"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/shared/store/useUIStore";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useLogout } from "@/shared/auth/useLogout";
import { BrandLogo } from "@/shared/components/layout/BrandLogo";
import { hasPermission } from "@/shared/lib/permissions";
import { ADMIN_SECTIONS, adminSectionHref } from "@/features/admin/sections";
import { useAdminSection } from "@/features/admin/hooks/useAdminSection";

export const AdminSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const activeSection = useAdminSection();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [loggingOut, setLoggingOut] = useState(false);

  // The same sign-out as the site's user menu: session cookies, the auth
  // store, cached queries and per-account client state all go with it.
  const handleLogout = async () => {
    setLoggingOut(true);
    setSidebarOpen(false);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = ADMIN_SECTIONS.filter((item) =>
    hasPermission(user, item.permission),
  );

  const displayName = user?.name ?? "Admin";
  const displayEmail = user?.email ?? "";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarSrc = user?.imgId ?? null;

  return (
    <>
      {/* Tap-anywhere-else to dismiss. Below lg the drawer floats over the page,
          so without this the only way out is a nav choice. */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-surface/40 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <BrandLogo />
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => (
            <React.Fragment key={item.id}>
              {"group" in item && item.group && (
                <div className="px-4 pt-5 pb-1.5 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                  {item.group}
                </div>
              )}
              <Link
                href={adminSectionHref(item.id)}
                aria-current={activeSection === item.id ? "page" : undefined}
                // Harmless on desktop, where the drawer is always docked.
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${
                  activeSection === item.id
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${activeSection === item.id ? "text-accent" : ""}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            </React.Fragment>
          ))}
          {/* Refunds is its own page outside the console layout; it had no
              link at all, so only someone who knew the URL could reach it. */}
          {hasPermission(user, "refunds:manage") && (
            <Link
              href="/admin/refunds"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group text-text-muted hover:text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[20px]">
                currency_exchange
              </span>
              <span className="font-medium text-sm">Refunds</span>
            </Link>
          )}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-surface-highlight/50 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
            {avatarSrc ? (
              <img
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover border-2 border-accent/30 shrink-0"
                src={avatarSrc}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-accent text-black font-bold text-sm flex items-center justify-center shrink-0">
                {avatarInitial}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-white truncate">
                {displayName}
              </div>
              <div className="text-xs text-text-muted truncate">
                {displayEmail}
              </div>
            </div>
            <span className="ml-auto text-[9px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full shrink-0">
              {user?.systemRole === "admin_secretary" ? "Secretary" : "Admin"}
            </span>
          </div>

          {/* Without these the only ways out were the logo or the address bar. */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/5 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back to site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/5 text-xs font-bold text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
