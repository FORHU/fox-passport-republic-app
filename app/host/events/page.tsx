"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader, EventsSection } from "@/components/host/dashboard";
import RequireAuth from "@/components/authentication/RequireAuth";
import { STATUS_OPTIONS } from "@/data/dashboardData";
import { useHostEventsViewAll } from "@/hooks/dashboards/useHostEventsViewAll";
import { Loader2, AlertTriangle } from "lucide-react";

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

export default function HostEventsViewAllPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");

  const { events: fetchedEvents, isLoading, error } = useHostEventsViewAll();
  const [events, setEvents] = useState(fetchedEvents);

  useEffect(() => {
    setEvents(fetchedEvents);
  }, [fetchedEvents]);

  const filteredEvents = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return events.filter((ev) => {
      const statusOk = status === "all" ? true : normalizeValue(ev.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(ev.title).includes(q) ||
          normalizeValue(ev.loc).includes(q) ||
          normalizeValue(ev.type).includes(q);

      return statusOk && searchOk;
    });
  }, [events, searchQuery, status]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status: nextStatus } : ev))
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/host/events/${id}/edit`);
  };

  return (
    <RequireAuth>
      <div
        className="bg-[#02040a] text-white min-h-screen font-body antialiased"
        style={{
          background:
            "radial-gradient(circle at 15% 50%, rgba(124,58,237,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(219,39,119,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(204,255,0,0.05) 0%, transparent 50%), #02040a",
        }}
      >
        <DashboardHeader />

        <main className="pt-32 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="text-2xl font-display font-bold flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#ccff00]">hub</span>
                  My Events
                </div>
                <p className="text-sm text-white/50">
                  Only shows records created by your account.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-11 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div className="w-full sm:w-56">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.event.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="glass-panel rounded-[2rem] p-12 border border-white/5">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-[#ccff00] animate-spin" />
                  <div className="text-sm text-white/50">Loading events...</div>
                </div>
              </div>
            ) : error ? (
              <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <div className="text-sm font-bold">Failed to load events</div>
                  <div className="text-xs text-white/50">{error}</div>
                </div>
              </div>
            ) : (
              <EventsSection
                events={filteredEvents}
                onStatusChange={handleStatusChange}
                showViewAllLink={false}
                onEdit={handleEdit}
              />
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

