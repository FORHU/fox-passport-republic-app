'use client';

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader, ServicesSection } from "@/features/dashboard/components";
import { STATUS_OPTIONS, type ServiceItem } from "@/features/dashboard/data/dashboardData";

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

export default function HostServicesClient({ initialServices }: HostServicesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  const filteredServices = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return services.filter((sv) => {
      const statusOk =
        status === "all" ? true : normalizeValue(sv.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(sv.name).includes(q) ||
          normalizeValue(sv.price).includes(q) ||
          normalizeValue(sv.icon).includes(q);

      return statusOk && searchOk;
    });
  }, [services, searchQuery, status]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    // ServicesSection expects "Active" (capital A) for its styling logic.
    const label = toTitleCaseStatus(nextStatus);
    setServices((prev) =>
      prev.map((sv) => (sv.id === id ? { ...sv, status: label } : sv))
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
          "radial-gradient(circle at 15% 50%, rgba(124,58,237,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(219,39,119,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(204,255,0,0.05) 0%, transparent 50%), #02040a",
      }}
    >
      <DashboardHeader />

      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="text-2xl font-display font-bold flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-yellow-400">
                  handyman
                </span>
                My Services
              </div>
              <p className="text-sm text-white/50">
                Only shows records created by your account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push('/foxer/create-service')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ccff00] text-black text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Service
              </button>
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
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
                  {STATUS_OPTIONS.service.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ServicesSection
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