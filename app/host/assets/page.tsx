"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import RequireAuth from "@/components/authentication/RequireAuth";
import { DashboardHeader, InventorySection } from "@/components/host/dashboard";
import { STATUS_OPTIONS, type InventoryItem } from "@/data/dashboardData";
import { useHostAssetsViewAll } from "@/hooks/dashboards/useHostAssetsViewAll";

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function normalizeCategoryValue(item: InventoryItem): string {
  if (!item.category) return "";
  return typeof item.category === "string" ? item.category : item.category?.name ?? "";
}

export default function HostAssetsViewAllPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");

  const { inventory: fetchedInventory, isLoading, error } =
    useHostAssetsViewAll();
  const [inventory, setInventory] = useState(fetchedInventory);

  useEffect(() => {
    setInventory(fetchedInventory);
  }, [fetchedInventory]);

  const filteredInventory = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return inventory.filter((it) => {
      const statusOk =
        status === "all" ? true : normalizeValue(it.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(it.name).includes(q) ||
          normalizeValue(normalizeCategoryValue(it)).includes(q);

      return statusOk && searchOk;
    });
  }, [inventory, searchQuery, status]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    setInventory((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: nextStatus } : it))
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/host/assets/${id}/edit`);
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
                  <span className="material-symbols-outlined text-purple-500">
                    inventory_2
                  </span>
                  My Assets
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
                    placeholder="Search assets..."
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
                    {STATUS_OPTIONS.inventory.map((s) => (
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
                  <div className="text-sm text-white/50">Loading assets...</div>
                </div>
              </div>
            ) : error ? (
              <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <div className="text-sm font-bold">Failed to load assets</div>
                  <div className="text-xs text-white/50">{error}</div>
                </div>
              </div>
            ) : (
              <InventorySection
                inventory={filteredInventory}
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

