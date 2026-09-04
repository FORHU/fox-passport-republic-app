/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useUIStore } from "@/shared/store/useUIStore";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { BrandLogo } from "@/shared/components/layout/BrandLogo";
import { hasPermission, type Permission } from "@/shared/lib/permissions";

/**
 * Each item names the capability it needs. `admin_secretary` holds only the
 * queue permissions, so Citizens, Bookings, Categories, Disputes, Policies and
 * Settings simply do not render for them — and the API refuses those routes
 * anyway, so hiding them is courtesy rather than the control.
 */
const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", id: "dashboard", permission: "admin:access" },
  { label: "Bookings", icon: "confirmation_number", id: "bookings", permission: "bookings:read:all" },
  { label: "Citizens", icon: "group", id: "citizens", permission: "users:read" },
  { label: "Events", icon: "event", id: "events", section: "Manage", permission: "queue:read" },
  { label: "Categories", icon: "category", id: "categories", permission: "categories:manage" },
  { label: "Venues", icon: "storefront", id: "venues", permission: "queue:read" },
  { label: "Map", icon: "map", id: "map", permission: "queue:read" },
  { label: "Assets", icon: "inventory_2", id: "assets", section: "Listings", permission: "queue:read" },
  { label: "Services", icon: "build", id: "services", permission: "queue:read" },
  { label: "Disputes", icon: "gavel", id: "disputes", section: "System", permission: "bookings:read:all" },
  { label: "Policies", icon: "policy", id: "policies", permission: "bookings:read:all" },
  { label: "Settings", icon: "settings", id: "settings", permission: "categories:manage" },
] as const satisfies readonly {
  label: string;
  icon: string;
  id: string;
  section?: string;
  permission: Permission;
}[];

export const AdminSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, activeAdminTab, setActiveAdminTab } =
    useUIStore();
  const user = useAuthStore((s) => s.user);

  const navItems = NAV_ITEMS.filter((item) =>
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
              {"section" in item && item.section && (
                <div className="px-4 pt-5 pb-1.5 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => {
                  setActiveAdminTab(item.id);
                  // Harmless on desktop, where the drawer is always docked.
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${
                  activeAdminTab === item.id
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${activeAdminTab === item.id ? "text-accent" : ""}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </React.Fragment>
          ))}
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
              Admin
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
