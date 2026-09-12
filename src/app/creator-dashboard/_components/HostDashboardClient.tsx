/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { updateAsset } from "@/features/asset/api/assets";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import {
  DashboardHeader,
  WelcomeBanner,
  KPICards,
  EventsSection,
  VenuesSection,
  InventorySection,
  ServicesSection,
  CalendarWidget,
  CreatorProfile,
  RecentActivity,
} from "@/features/dashboard/components";
import { OccupancyChart, PendingRequests } from "./OccupancySection";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  mapBackendAssetToInventoryItem,
  mapBackendServiceToServiceItem,
} from "@/features/dashboard/mappers/listings";
import { useHostData } from "@/features/dashboard/hooks/useHostData";
import { useFoxerDashboard } from "@/features/dashboard/hooks/useFoxerDashboard";
import type { EventItem } from "@/features/dashboard/data/dashboardData";
import StripeConnectSection from "@/features/dashboard/components/StripeConnectSection";

interface HostDashboardClientProps {
  initialData: {
    events: unknown[];
    venues: unknown[];
    inventory: unknown[];
    services: unknown[];
  };
}

const FALLBACK_IMG = "/herobackground.jpg";

function pickImage(images: unknown[]): string {
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_IMG;
  const primary =
    (
      images as {
        isPrimary?: boolean;
        isThumbnail?: boolean;
        url?: string;
        imageUrl?: string;
      }[]
    ).find((i) => i?.isPrimary || i?.isThumbnail) ?? images[0];
  if (!primary) return FALLBACK_IMG;
  const url =
    typeof primary === "string"
      ? primary
      : (primary as { url?: string; imageUrl?: string })?.url ||
        (primary as { imageUrl?: string })?.imageUrl;
  return url || FALLBACK_IMG;
}

function mapEvent(e: unknown): EventItem {
  const ev = e as any;
  return {
    id: ev?.id,
    title: (ev?.title as string) || (ev?.name as string) || "Untitled Event",
    date: (ev?.startDate as string) || (ev?.date as string) || "—",
    loc:
      (ev?.location as string) ||
      [ev?.city, ev?.country].filter(Boolean).join(", ") ||
      "Location TBD",
    type: (ev?.type as string) || (ev?.eventType as string) || "Event",
    status: (ev?.status as string) || "draft",
    booked: (ev?.bookedCount ?? ev?.booked) as number | null,
    capacity: (ev?.capacity as number | null) ?? null,
    revenue: ev?.revenue ? `₱${Number(ev.revenue).toLocaleString()}` : null,
    img: pickImage((ev?.images ?? ev?.gallery ?? []) as unknown[]),
  };
}

export default function HostDashboardClient({
  initialData,
}: HostDashboardClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    isCreateMenuOpen,
    menuRef,
    handleToggleCreateMenu,
    handleNavigateToCreateEvent,
    handleNavigateToCreateVenue,
    handleNavigateToCreateInventory,
    handleNavigateToCreateService,
  } = useDashboard();

  const access = useRoleAccess();
  const authUser = useAuthStore((s) => s.user);

  const discoveryHintKey = authUser?.id
    ? `foxpassport:discovery-hint-dismissed:${authUser.id}`
    : null;
  const [discoveryHintDismissed, setDiscoveryHintDismissed] = useState(false);

  React.useEffect(() => {
    if (!discoveryHintKey) return;
    try {
      setDiscoveryHintDismissed(
        localStorage.getItem(discoveryHintKey) === "1",
      );
    } catch {
      // localStorage unavailable (private browsing, etc.) — hint just won't persist
    }
  }, [discoveryHintKey]);

  const dismissDiscoveryHint = () => {
    setDiscoveryHintDismissed(true);
    if (!discoveryHintKey) return;
    try {
      localStorage.setItem(discoveryHintKey, "1");
    } catch {
      // ignore write failures — dismissal still applies for this session
    }
  };

  const { stats: foxerStats, isLoading: statsLoading } = useFoxerDashboard();

  const PER_PAGE = 5;
  const [eventsPage, setEventsPage] = useState(1);
  const [venuesPage, setVenuesPage] = useState(1);
  const [assetsPage, setAssetsPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1);
  const [deletedEventIds, setDeletedEventIds] = useState<Set<string>>(
    new Set(),
  );

  const handleDeleteEvent = async (id: number | string) => {
    const sid = String(id);
    setDeletedEventIds((prev) => new Set([...prev, sid]));
    try {
      await api.delete(`/event-templates/${sid}`);
      toast.success("Draft deleted");
    } catch (err: any) {
      console.error(
        "[handleDeleteEvent]",
        err?.response?.status,
        err?.response?.data,
      );
      toast.error(err?.response?.data?.message ?? "Failed to delete draft");
      setDeletedEventIds((prev) => {
        const next = new Set(prev);
        next.delete(sid);
        return next;
      });
    }
  };

  // "unavailable" is a UI-only concept; the API's AssetStatus enum has no
  // such value, so map it to the closest backend equivalent.
  const assetStatusMap: Record<string, string> = { unavailable: "archived" };

  const handleInventoryStatusChange = async (
    id: number | string,
    status: string,
  ) => {
    try {
      await updateAsset(id, { status: assetStatusMap[status] ?? status });
      queryClient.invalidateQueries({ queryKey: ["host-data", "assets"] });
      toast.success("Status updated");
    } catch (err: any) {
      console.error(
        "[handleInventoryStatusChange]",
        err?.response?.status,
        err?.response?.data,
      );
      toast.error(err?.response?.data?.message ?? "Failed to update status");
    }
  };

  // Reactive data with polling
  // Each of these is gated on the same role check that decides whether the
  // section renders at all. Without the gate a Foxer with one role still polled
  // all four resources every 10 seconds to fill three locked sections.
  const { data: rawServices, total: totalServices } = useHostData(
    "services",
    initialData.services,
    {
      page: servicesPage,
      limit: PER_PAGE,
      enabled: access.canManageServices,
    },
  );
  const { data: rawAssets, total: totalAssets } = useHostData(
    "assets",
    initialData.inventory,
    { page: assetsPage, limit: PER_PAGE, enabled: access.canManageInventory },
  );
  const { data: rawEvents, total: totalEvents } = useHostData(
    "events",
    initialData.events,
    { page: eventsPage, limit: PER_PAGE, enabled: access.canManageEvents },
  );
  const { data: rawVenues, total: totalVenues } = useHostData(
    "venues",
    initialData.venues,
    { page: venuesPage, limit: PER_PAGE, enabled: access.canManageVenues },
  );

  const events = (rawEvents ?? [])
    .map(mapEvent)
    .filter((ev) => !deletedEventIds.has(String(ev.id)));
  const venues = rawVenues ?? [];
  const inventory = (rawAssets ?? []).map(mapBackendAssetToInventoryItem);
  const services = (rawServices ?? []).map(mapBackendServiceToServiceItem);
  const totalEventPages = Math.max(1, Math.ceil(totalEvents / PER_PAGE));
  const totalVenuePages = Math.max(1, Math.ceil(totalVenues / PER_PAGE));
  const totalAssetPages = Math.max(1, Math.ceil(totalAssets / PER_PAGE));
  const totalServicePages = Math.max(1, Math.ceil(totalServices / PER_PAGE));

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
          <WelcomeBanner
            isCreateMenuOpen={isCreateMenuOpen}
            menuRef={menuRef}
            onToggleCreateMenu={handleToggleCreateMenu}
            onNavigateToCreateEvent={handleNavigateToCreateEvent}
            onNavigateToCreateVenue={handleNavigateToCreateVenue}
            onNavigateToCreateInventory={handleNavigateToCreateInventory}
            onNavigateToCreateService={handleNavigateToCreateService}
            access={access}
          />

          <KPICards stats={foxerStats} isLoading={statsLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            <OccupancyChart />
            <PendingRequests />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-10">
              {access.canManageEvents && (
                <EventsSection
                  events={events}
                  onStatusChange={() => {}}
                  onDelete={handleDeleteEvent}
                  onEdit={(id) =>
                    router.push(`/creator-dashboard/events/${id}/edit`)
                  }
                  page={eventsPage}
                  totalPages={totalEventPages}
                  onPageChange={setEventsPage}
                />
              )}

              {access.canManageVenues && (
                <VenuesSection
                  venues={venues}
                  onStatusChange={() => {}}
                  onEdit={(id) =>
                    router.push(`/creator-dashboard/venues/${id}/edit`)
                  }
                  page={venuesPage}
                  totalPages={totalVenuePages}
                  onPageChange={setVenuesPage}
                />
              )}

              {access.canManageInventory && (
                <InventorySection
                  inventory={inventory}
                  onStatusChange={handleInventoryStatusChange}
                  page={assetsPage}
                  totalPages={totalAssetPages}
                  onPageChange={setAssetsPage}
                />
              )}

              {access.canManageServices && (
                <ServicesSection
                  services={services}
                  onStatusChange={() => {}}
                  page={servicesPage}
                  totalPages={totalServicePages}
                  onPageChange={setServicesPage}
                />
              )}

              {/* Dismissible Discovery Hint for unheld roles */}
              {!discoveryHintDismissed &&
                (!access.canManageEvents ||
                  !access.canManageVenues ||
                  !access.canManageInventory ||
                  !access.canManageServices) && (
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-4 sm:p-5 flex items-center justify-between gap-4 text-xs text-white/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-[#ccff00] text-lg shrink-0">
                        auto_awesome
                      </span>
                      <p className="truncate">
                        Unlock more provider capabilities (Venues, Events, Assets, Services) by expanding your creator profile.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => router.push("/creator-dashboard/apply")}
                        className="px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold hover:bg-[#ccff00]/20 transition-colors whitespace-nowrap"
                      >
                        Apply for Roles
                      </button>
                      <button
                        onClick={dismissDiscoveryHint}
                        aria-label="Dismiss"
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <StripeConnectSection />
                <CalendarWidget />
                <CreatorProfile />
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
