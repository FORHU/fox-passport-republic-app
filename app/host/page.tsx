"use client";

import React from "react";
import { useHostDashboard } from '@/hooks/dashboards/useHostDashboard';
import { useAuthStore } from "@/store/useAuthStore";
import RequireAuth from "@/components/authentication/RequireAuth";
import { HostHeader } from "@/components/mayor/HostHeader";
import { HostWelcome } from "@/components/mayor/HostWelcome";
import { HostStats } from "@/components/mayor/HostStats";
import { HostVenuesList } from "@/components/mayor/HostVenuesList";
import { HostSidebarWidgets } from "@/components/mayor/HostSidebarWidgets";

function HostDashboardContent() {
  const { handleLogout, openModal, stats } = useHostDashboard();
  const { user } = useAuthStore();
  const userName = user?.name || user?.username || 'Mayor';

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <HostHeader userName={userName} />

      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HostWelcome handleLogout={handleLogout} openModal={openModal} />
          <HostStats stats={stats} />
          
          {stats.totalVenues === 0 ? (
            <HostVenuesList totalVenues={0} openModal={openModal} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <HostVenuesList totalVenues={stats.totalVenues} openModal={openModal} />
              <HostSidebarWidgets />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <RequireAuth>
      <HostDashboardContent />
    </RequireAuth>
  );
}
