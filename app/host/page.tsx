"use client";

import React from "react";
import HostHeader from "@/components/host/HostHeader";
import StatCards from "@/components/host/StatCards";
import VenueList from "@/components/host/VenueList";
import OccupancyChart from "@/components/host/OccupancyChart";
import HostProfile from "@/components/host/HostProfile";
import HostRequests from "@/components/host/HostRequests";
import { UserQuickLinks } from "@/components/citizen/UserQuickLinks";

import { useHostDashboard } from "@/hooks/dashboards/useHostDashboard";

const HostDashboard: React.FC = () => {
  const { isLoading } = useHostDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <HostHeader />

      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                  Venue Live
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                Manage your <span className="text-gradient">Space.</span>
              </h1>
              <p className="text-white/60">
                Overview of your venues and upcoming bookings.
              </p>
            </div>
            <div className="flex gap-4 items-end">
              <UserQuickLinks />
              <button className="btn-neon px-8 py-3 rounded-full bg-accent text-black font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">add_business</span>{" "}
                List New Venue
              </button>
            </div>
          </div>

          <StatCards />

          {/* Row 1: Active Venues & Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <VenueList className="flex-1" />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <HostProfile className="flex-1" />
            </div>
          </div>

          {/* Row 2: Charts & Requests/Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
             <div className="lg:col-span-8 flex flex-col">
                <OccupancyChart />
             </div>
             <div className="lg:col-span-4 flex flex-col">
                <HostRequests />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;
