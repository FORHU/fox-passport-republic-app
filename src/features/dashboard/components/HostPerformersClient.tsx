"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardHeader,
  PerformersSection,
} from "@/features/dashboard/components";
import {
  STATUS_OPTIONS,
  type ServiceItem,
} from "@/features/dashboard/data/dashboardData";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";

interface HostPerformersClientProps {
  initialServices: ServiceItem[];
}

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function toTitleCaseStatus(status: string): string {
  const normalized = normalizeValue(status);
  if (!normalized) return status;
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function HostPerformersClient({
  initialServices,
}: HostPerformersClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  const filteredServices = useMemo(() => {
    const q = normalizeValue(searchQuery);
    return services.filter((sv) => {
      const statusOk =
        status === "all"
          ? true
          : normalizeValue(sv.status) === normalizeValue(status);
      const searchOk =
        !q ||
        normalizeValue(sv.name).includes(q) ||
        normalizeValue(sv.price).includes(q) ||
        normalizeValue(sv.category).includes(q) ||
        (sv.tags || []).some((t) => normalizeValue(t).includes(q));
      return statusOk && searchOk;
    });
  }, [services, searchQuery, status]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    const label = toTitleCaseStatus(nextStatus);
    setServices((prev) =>
      prev.map((sv) => (sv.id === id ? { ...sv, status: label } : sv)),
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/creator-dashboard/services/${id}/edit`);
  };

  return (
    <div
      className="bg-[#02040a] text-white min-h-screen font-body antialiased"
      style={{
        background:
          "radial-gradient(circle at 15% 50%, rgba(245,158,11,0.08) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(124,58,237,0.08) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(245,158,11,0.04) 0%, transparent 50%), #02040a",
      }}
    >
      <DashboardHeader />

      <main className="pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Performer Studio
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-1.5">
                My Gigs &{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Performances
                </span>
              </h1>
              <p className="text-sm text-white/50">
                DJ sets, live music, photography, videography, and stage MC packages.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() =>
                  router.push("/foxer/create-listing?type=service")
                }
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black text-sm font-bold hover:bg-amber-300 transition-colors shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                Add Gig / Package
              </button>

              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gigs, genres, tags..."
                  className="w-full bg-white/5 border border-amber-500/20 rounded-full px-4 py-2 pl-11 text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="w-full sm:w-48">
                <StyledSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "all", label: "All Status" },
                    ...STATUS_OPTIONS.service.map((s) => ({
                      value: s,
                      label: s,
                    })),
                  ]}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              {
                label: "Total Gigs",
                value: services.length,
                icon: "theater_comedy",
                color: "text-amber-400",
              },
              {
                label: "Available",
                value: services.filter(
                  (s) => normalizeValue(s.status) === "available",
                ).length,
                icon: "check_circle",
                color: "text-emerald-400",
              },
              {
                label: "Pending",
                value: services.filter(
                  (s) => normalizeValue(s.status) === "pending",
                ).length,
                icon: "pending",
                color: "text-yellow-400",
              },
              {
                label: "Paused",
                value: services.filter(
                  (s) =>
                    normalizeValue(s.status) === "paused" ||
                    normalizeValue(s.status) === "unavailable",
                ).length,
                icon: "pause_circle",
                color: "text-white/40",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-3"
              >
                <span
                  className={`material-symbols-outlined ${stat.color} text-2xl`}
                >
                  {stat.icon}
                </span>
                <div>
                  <div className="text-xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Gigs grid */}
          <PerformersSection
            services={filteredServices}
            onStatusChange={handleStatusChange}
            showViewAllLink={false}
            onEdit={handleEdit}
          />
        </div>
      </main>
    </div>
  );
}
