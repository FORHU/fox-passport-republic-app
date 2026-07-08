'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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

  // Reactive data with polling
  const { data: rawServices } = useHostData('services', initialData.services);
  const { data: rawAssets } = useHostData('assets', initialData.inventory);
  const { data: rawEvents } = useHostData('events', initialData.events);
  const { data: venues } = useHostData('venues', initialData.venues);

  const events = (rawEvents ?? []).map(mapEvent);
  const inventory = (rawAssets ?? []).map(mapBackendAssetToInventoryItem);
  const services = (rawServices ?? []).map(mapBackendServiceToServiceItem);

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

          <KPICards />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            <OccupancyChart />
            <PendingRequests />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-10">

              {access.canManageEvents ? (
                <EventsSection events={events} onStatusChange={() => {}} />
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
                <InventorySection inventory={inventory} onStatusChange={() => {}} />
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
                <ServicesSection services={services} onStatusChange={() => {}} />
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