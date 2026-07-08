"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/auth/components/RequireAuth";
import { DashboardHeader, VenuesSection } from "@/features/dashboard/components";
import { STATUS_OPTIONS } from "@/features/dashboard/data/dashboardData";

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

interface HostVenuesClientProps {
  initialVenues: any[];
}

export default function HostVenuesClient({ initialVenues }: HostVenuesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");
  const [venues, setVenues] = useState(initialVenues);

  useEffect(() => {
    setVenues(initialVenues);
  }, [initialVenues]);

  const filteredVenues = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return venues.filter((vn) => {
      const statusOk =
        status === "all" ? true : normalizeValue(vn.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(vn.title).includes(q) ||
          normalizeValue(vn.loc).includes(q) ||
          normalizeValue(vn.type).includes(q);

      return statusOk && searchOk;
    });
  }, [venues, searchQuery, status]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    setVenues((prev) =>
      prev.map((vn) => (vn.id === id ? { ...vn, status: nextStatus } : vn))
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/creator-dashboard/venues/${id}/edit`);
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
                  <span className="material-symbols-outlined text-pink-500">apartment</span>
                  My Venues
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
                    placeholder="Search venues..."
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
                    {STATUS_OPTIONS.venue.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <VenuesSection
              venues={filteredVenues}
              onStatusChange={handleStatusChange}
              showViewAllLink={false}
              showHeading={false}
              onEdit={handleEdit}
            />
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}