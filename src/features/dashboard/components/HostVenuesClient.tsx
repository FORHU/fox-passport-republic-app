"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/shared/auth/RequireAuth";
import {
  DashboardHeader,
  VenuesSection,
} from "@/features/dashboard/components";
import { STATUS_OPTIONS } from "@/features/dashboard/data/dashboardData";
import { DashboardListToolbar } from "./DashboardListToolbar";

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

interface HostVenuesClientProps {
  initialVenues: any[];
  /** Shown above the list, inside the page's own clearance for the fixed nav. */
  guide?: React.ReactNode;
}

export default function HostVenuesClient({
  initialVenues,
  guide,
}: HostVenuesClientProps) {
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
        status === "all"
          ? true
          : normalizeValue(vn.status) === normalizeValue(status);

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
      prev.map((vn) => (vn.id === id ? { ...vn, status: nextStatus } : vn)),
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/creator-dashboard/venues/${id}/edit`);
  };

  const handleView = (id: number | string) => {
    router.push(`/venues/${id}`);
  };

  return (
    <RequireAuth>
      <div
        className="bg-canvas text-white min-h-screen font-body antialiased"
        style={{
          background:
            "radial-gradient(circle at 15% 50%, rgba(92,98,214,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(92,98,214,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(196,232,90,0.05) 0%, transparent 50%), var(--canvas)",
          backgroundAttachment: "fixed",
        }}
      >
        <DashboardHeader />

        <main className="pt-32 pb-28 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {guide}
            <div className="mb-5">
              <div className="text-2xl font-display font-bold flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-pink-500">
                  apartment
                </span>
                My Venues
              </div>
              <p className="text-sm text-white/50">
                Only shows records created by your account.
              </p>
            </div>

            <DashboardListToolbar
              search={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: "Search venues...",
              }}
              status={{
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: "All Status" },
                  ...STATUS_OPTIONS.venue.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ],
              }}
              action={{
                label: "Draw & Add Venue",
                icon: "polyline",
                href: "/venue-foxer/create-venue",
              }}
            />

            <VenuesSection
              venues={filteredVenues}
              onStatusChange={handleStatusChange}
              showViewAllLink={false}
              showHeading={false}
              onEdit={handleEdit}
              onView={handleView}
            />
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
