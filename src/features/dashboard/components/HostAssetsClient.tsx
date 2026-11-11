"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RequireAuth from "@/shared/auth/RequireAuth";
import {
  DashboardHeader,
  InventorySection,
} from "@/features/dashboard/components";
import {
  FILTER_STATUS_OPTIONS,
  type InventoryItem,
} from "@/features/dashboard/data/dashboardData";
import { DashboardListToolbar } from "./DashboardListToolbar";

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function normalizeCategoryValue(item: InventoryItem): string {
  if (!item.category) return "";
  return typeof item.category === "string"
    ? item.category
    : (item.category?.name ?? "");
}

interface HostAssetsClientProps {
  initialInventory: any[];
}

export default function HostAssetsClient({
  initialInventory,
}: HostAssetsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  // The Studio's "My Drafts" links here with ?status=draft.
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"all" | string>(
    () => searchParams.get("status") ?? "all",
  );
  const [inventory, setInventory] = useState(initialInventory);

  useEffect(() => {
    setInventory(initialInventory);
  }, [initialInventory]);

  const filteredInventory = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return inventory.filter((it) => {
      const statusOk =
        status === "all"
          ? true
          : normalizeValue(it.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(it.name).includes(q) ||
          normalizeValue(normalizeCategoryValue(it)).includes(q);

      return statusOk && searchOk;
    });
  }, [inventory, searchQuery, status]);

  const handleStatusChange = (id: number | string, nextStatus: string) => {
    setInventory((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: nextStatus } : it)),
    );
  };

  const handleEdit = (id: number | string) => {
    router.push(`/creator-dashboard/assets/${id}/edit`);
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
            <div className="mb-5">
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

            <DashboardListToolbar
              search={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: "Search assets...",
              }}
              status={{
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: "All Status" },
                  ...FILTER_STATUS_OPTIONS.inventory.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ],
              }}
              action={{
                label: "Add Gear",
                onClick: () => router.push("/foxer/create-listing"),
              }}
            />

            <InventorySection
              inventory={filteredInventory}
              onStatusChange={handleStatusChange}
              showViewAllLink={false}
              onEdit={handleEdit}
            />
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
