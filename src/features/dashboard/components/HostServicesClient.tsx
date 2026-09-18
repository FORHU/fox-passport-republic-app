"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardHeader,
  ServicesSection,
  PerformersSection,
  isPerformerService,
} from "@/features/dashboard/components";
import {
  STATUS_OPTIONS,
  type ServiceItem,
} from "@/features/dashboard/data/dashboardData";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";

interface HostServicesClientProps {
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

export default function HostServicesClient({
  initialServices,
}: HostServicesClientProps) {
  const router = useRouter();
  const access = useRoleAccess();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "performers" | "services">(
    access.canManagePerformers && !access.canManageServices
      ? "performers"
      : "all",
  );
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  const hasPerformerGigs = useMemo(
    () => services.some(isPerformerService) || access.canManagePerformers,
    [services, access.canManagePerformers],
  );
  const hasOperationalServices = useMemo(
    () => services.some((s) => !isPerformerService(s)) || access.canManageServices,
    [services, access.canManageServices],
  );

  const filteredServices = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return services.filter((sv) => {
      // Tab filter
      if (activeTab === "performers" && !isPerformerService(sv)) return false;
      if (activeTab === "services" && isPerformerService(sv)) return false;

      const statusOk =
        status === "all"
          ? true
          : normalizeValue(sv.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(sv.name).includes(q) ||
          normalizeValue(sv.price).includes(q) ||
          normalizeValue(sv.category).includes(q) ||
          (sv.tags || []).some((t) => normalizeValue(t).includes(q)) ||
          normalizeValue(sv.icon).includes(q);

      return statusOk && searchOk;
    });
  }, [services, searchQuery, status, activeTab]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    const label = toTitleCaseStatus(nextStatus);
    setServices((prev) =>
      prev.map((sv) => (sv.id === id ? { ...sv, status: label } : sv)),
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/creator-dashboard/services/${id}/edit`);
  };

  const isPerformerOnlyView =
    (access.canManagePerformers && !access.canManageServices) ||
    activeTab === "performers";

  return (
    <div
      className="bg-[#02040a] text-white min-h-screen font-body antialiased"
      style={{
        background:
          "radial-gradient(circle at 15% 50%, rgba(124,58,237,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(219,39,119,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(204,255,0,0.05) 0%, transparent 50%), #02040a",
      }}
    >
      <DashboardHeader />

      <main className="pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="text-2xl font-display font-bold flex items-center gap-2 mb-2">
                <span
                  className={`material-symbols-outlined ${
                    isPerformerOnlyView ? "text-amber-400" : "text-yellow-400"
                  }`}
                >
                  {isPerformerOnlyView ? "theater_comedy" : "design_services"}
                </span>
                {isPerformerOnlyView
                  ? "My Performances & Gigs"
                  : access.canManagePerformers
                    ? "Services & Performances"
                    : "My Services"}
              </div>
              <p className="text-sm text-white/50">
                {isPerformerOnlyView
                  ? "Manage your DJ sets, live music packages, photography/video coverage, and stage MC gigs."
                  : "Only shows records created by your account."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push("/foxer/create-service")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity shrink-0 shadow-lg ${
                  isPerformerOnlyView
                    ? "bg-amber-400 text-black shadow-amber-500/20"
                    : "bg-[#ccff00] text-black shadow-[#ccff00]/20"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                {isPerformerOnlyView ? "Add Performer Gig" : "Add Service"}
              </button>
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isPerformerOnlyView
                      ? "Search gigs, genres, tags..."
                      : "Search services..."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-11 text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="w-full sm:w-56">
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

          {/* Tab filter if user has both types */}
          {hasPerformerGigs && hasOperationalServices && (
            <div className="flex gap-2 border-b border-white/10 mb-8">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`pb-3 px-3 font-semibold text-xs transition-colors border-b-2 ${
                  activeTab === "all"
                    ? "text-white border-[#ccff00]"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                All Listings ({services.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("performers")}
                className={`pb-3 px-3 font-semibold text-xs transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === "performers"
                    ? "text-amber-400 border-amber-400"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  theater_comedy
                </span>
                Performer Gigs ({services.filter(isPerformerService).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`pb-3 px-3 font-semibold text-xs transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === "services"
                    ? "text-yellow-400 border-yellow-400"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  handyman
                </span>
                Operational Services (
                {services.filter((s) => !isPerformerService(s)).length})
              </button>
            </div>
          )}

          {/* Section view: If performer tab is selected or user is purely a performer, render PerformersSection */}
          {isPerformerOnlyView ? (
            <PerformersSection
              services={filteredServices}
              onStatusChange={handleStatusChange}
              showViewAllLink={false}
              onEdit={handleEdit}
            />
          ) : (
            <ServicesSection
              services={filteredServices}
              onStatusChange={handleStatusChange}
              showViewAllLink={false}
              onEdit={handleEdit}
            />
          )}
        </div>
      </main>
    </div>
  );
}
