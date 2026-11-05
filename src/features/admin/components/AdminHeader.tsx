"use client";

import React from "react";
import { useUIStore } from "@/shared/store/useUIStore";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { getAdminSection } from "@/features/admin/sections";
import { useAdminSection } from "@/features/admin/hooks/useAdminSection";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const AdminHeader: React.FC = () => {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeSection = useAdminSection();
  const user = useAuthStore((s) => s.user);

  const firstName = user?.name?.split(" ")[0] ?? "Admin";

  const pageTitle = getAdminSection(activeSection)?.title ?? "Dashboard";

  return (
    <header className="h-24 flex items-center justify-between px-8 z-40 sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white"
          onClick={toggleSidebar}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden sm:block">
          <h1 className="text-2xl font-display font-bold text-white">
            {pageTitle}
          </h1>
          <p className="text-sm text-text-muted">
            {getGreeting()}, {firstName}. Here&apos;s what&apos;s happening
            today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>

        {/* My Dashboards and the app's shared pages, so an admin can switch
            without "Back to site". */}
        <UserMenuButton showAppNav />
      </div>
    </header>
  );
};
