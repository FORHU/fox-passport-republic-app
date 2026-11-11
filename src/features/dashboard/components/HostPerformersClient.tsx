"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DashboardHeader,
  PerformersSection,
} from "@/features/dashboard/components";
import {
  FILTER_STATUS_OPTIONS,
  type ServiceItem,
} from "@/features/dashboard/data/dashboardData";
import { DashboardListToolbar } from "./DashboardListToolbar";

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
  // The Studio's "My Drafts" links here with ?status=draft.
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"all" | string>(
    () => searchParams.get("status") ?? "all",
  );
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
      className="bg-canvas text-white min-h-screen font-body antialiased"
      style={{
        background:
          "radial-gradient(circle at 15% 50%, rgba(217,154,38,0.08) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(92,98,214,0.08) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(217,154,38,0.04) 0%, transparent 50%), var(--canvas)",
        backgroundAttachment: "fixed",
      }}
    >
      <DashboardHeader />

      <main className="pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Performer Studio
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-1.5">
                My Gigs &{" "}
                <span className="text-white">
                  Performances
                </span>
              </h1>
              <p className="text-sm text-white/50">
                DJ sets, live music, photography, videography, and stage MC
                packages.
              </p>
            </div>
          </div>

          <DashboardListToolbar
            tone="amber"
            search={{
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search gigs, genres, tags...",
            }}
            status={{
              value: status,
              onChange: setStatus,
              options: [
                { value: "all", label: "All Status" },
                ...FILTER_STATUS_OPTIONS.service.map((s) => ({
                  value: s,
                  label: s,
                })),
              ],
            }}
            action={{
              label: "Add Gig / Package",
              onClick: () => router.push("/foxer/create-listing?type=service"),
            }}
          />

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
