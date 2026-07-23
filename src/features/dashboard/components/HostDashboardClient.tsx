'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/shared/lib/axios';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import {
  DashboardHeader,
  WelcomeBanner,
  KPICards,
  OccupancyChart,
  PendingRequests,
  EventsSection,
  VenuesSection,
  InventorySection,
  ServicesSection,
  CalendarWidget,
  CreatorProfile,
  RecentActivity,
  LockedSection,
} from '@/features/dashboard/components';
import { useRoleAccess } from '@/features/auth/hooks/useRoleAccess';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { mapBackendAssetToInventoryItem, mapBackendServiceToServiceItem } from '@/features/dashboard/mappers/listings';
import { useHostData } from "@/features/dashboard/hooks/useHostData";
import { useFoxerDashboard } from "@/features/dashboard/hooks/useFoxerDashboard";
import type { EventItem } from '@/features/dashboard/data/dashboardData';
import StripeConnectSection from '@/features/dashboard/components/StripeConnectSection';

interface HostDashboardClientProps {
  initialData: {
    events: unknown[];
    venues: unknown[];
    inventory: unknown[];
    services: unknown[];
  };
}

const FALLBACK_IMG = '/herobackground.jpg';

function pickImage(images: unknown[]): string {
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_IMG;
  const primary = (images as { isPrimary?: boolean; isThumbnail?: boolean; url?: string; imageUrl?: string }[]).find((i) => i?.isPrimary || i?.isThumbnail) ?? images[0];
  if (!primary) return FALLBACK_IMG;
  const url = typeof primary === 'string' ? primary : (primary as { url?: string; imageUrl?: string })?.url || (primary as { imageUrl?: string })?.imageUrl;
  return url || FALLBACK_IMG;
}

function mapEvent(e: unknown): EventItem {
  const ev = e as any;
  return {
    id: ev?.id,
    title: (ev?.title as string) || (ev?.name as string) || 'Untitled Event',
    date: (ev?.startDate as string) || (ev?.date as string) || '—',
    loc: (ev?.location as string) || [ev?.city, ev?.country].filter(Boolean).join(', ') || 'Location TBD',
    type: (ev?.type as string) || (ev?.eventType as string) || 'Event',
    status: (ev?.status as string) || 'draft',
    booked: (ev?.bookedCount ?? ev?.booked) as number | null,
    capacity: (ev?.capacity as number | null) ?? null,
    revenue: ev?.revenue ? `₱${Number(ev.revenue).toLocaleString()}` : null,
    img: pickImage((ev?.images ?? ev?.gallery ?? []) as unknown[]),
  };
}

export default function HostDashboardClient({ initialData }: HostDashboardClientProps) {
  const router = useRouter();

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

  const { stats: foxerStats, isLoading: statsLoading } = useFoxerDashboard();

  const PER_PAGE = 5;
  const [eventsPage, setEventsPage] = useState(1);
  const [venuesPage, setVenuesPage] = useState(1);
  const [assetsPage, setAssetsPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1);
  const [deletedEventIds, setDeletedEventIds] = useState<Set<string>>(new Set());

  const handleDeleteEvent = async (id: number | string) => {
    const sid = String(id);
    setDeletedEventIds((prev) => new Set([...prev, sid]));
    try {
      await api.delete(`/event-templates/${sid}`);
      toast.success("Draft deleted");
    } catch (err: any) {
      console.error('[handleDeleteEvent]', err?.response?.status, err?.response?.data);
      toast.error(err?.response?.data?.message ?? "Failed to delete draft");
      setDeletedEventIds((prev) => { const next = new Set(prev); next.delete(sid); return next; });
    }
  };

  // Reactive data with polling
  const { data: rawServices, total: totalServices } = useHostData('services', initialData.services, { page: servicesPage, limit: PER_PAGE });
  const { data: rawAssets, total: totalAssets } = useHostData('assets', initialData.inventory, { page: assetsPage, limit: PER_PAGE });
  const { data: rawEvents, total: totalEvents } = useHostData('events', initialData.events, { page: eventsPage, limit: PER_PAGE });
  const { data: rawVenues, total: totalVenues } = useHostData('venues', initialData.venues, { page: venuesPage, limit: PER_PAGE });

  const events = (rawEvents ?? []).map(mapEvent).filter((ev) => !deletedEventIds.has(String(ev.id)));
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
          'radial-gradient(circle at 15% 50%, rgba(124,58,237,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(219,39,119,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(204,255,0,0.05) 0%, transparent 50%), #02040a',
      }}
    >
      <DashboardHeader />

      <main className="pt-32 pb-20">
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

              {access.canManageEvents ? (
                <EventsSection
                  events={events}
                  onStatusChange={() => {}}
                  onDelete={handleDeleteEvent}
                  onEdit={(id) => router.push(`/creator-dashboard/events/${id}/edit`)}
                  page={eventsPage}
                  totalPages={totalEventPages}
                  onPageChange={setEventsPage}
                />
              ) : (
                <LockedSection
                  title="My Active Events"
                  icon="hub"
                  iconColor="text-[#ccff00]"
                  requiredRole="Host"
                  applyHref="/creator-dashboard/apply"
                >
                  <EventsSection events={[]} onStatusChange={() => {}} />
                </LockedSection>
              )}

              {access.canManageVenues ? (
                <VenuesSection
                  venues={venues}
                  onStatusChange={() => {}}
                  onEdit={(id) => router.push(`/creator-dashboard/venues/${id}/edit`)}
                  page={venuesPage}
                  totalPages={totalVenuePages}
                  onPageChange={setVenuesPage}
                />
              ) : (
                <LockedSection
                  title="My Venues"
                  icon="apartment"
                  iconColor="text-pink-500"
                  requiredRole="Mayor"
                  applyHref="/mayor/apply"
                >
                  <VenuesSection venues={[]} onStatusChange={() => {}} />
                </LockedSection>
              )}

              {access.canManageInventory ? (
                <InventorySection
                  inventory={inventory}
                  onStatusChange={() => {}}
                  page={assetsPage}
                  totalPages={totalAssetPages}
                  onPageChange={setAssetsPage}
                />
              ) : (
                <LockedSection
                  title="Inventories"
                  icon="inventory_2"
                  iconColor="text-purple-400"
                  requiredRole="Foxer (Asset)"
                  applyHref="/onboarding"
                >
                  <InventorySection inventory={[]} onStatusChange={() => {}} />
                </LockedSection>
              )}

              {access.canManageServices ? (
                <ServicesSection
                  services={services}
                  onStatusChange={() => {}}
                  page={servicesPage}
                  totalPages={totalServicePages}
                  onPageChange={setServicesPage}
                />
              ) : (
                <LockedSection
                  title="Services"
                  icon="design_services"
                  iconColor="text-yellow-400"
                  requiredRole="Foxer (Service)"
                  applyHref="/onboarding"
                >
                  <ServicesSection services={[]} onStatusChange={() => {}} />
                </LockedSection>
              )}

            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <StripeConnectSection/>
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