'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/dashboards/useDashboard';
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
} from '@/components/host/dashboard';
import { useRoleAccess } from '@/hooks/auth/useRoleAccess';
import { useAuthStore } from '@/store/useAuthStore';
import { ProgressDashboard } from '@/components/users/ProgressDashboard';
import { mapBackendAssetToInventoryItem, mapBackendServiceToServiceItem } from '@/lib/mappers/listings';
import type { EventItem } from '@/data/dashboardData';

interface HostDashboardClientProps {
  initialData: {
    events: any[];
    venues: any[];
    inventory: any[];
    services: any[];
  };
}

const FALLBACK_IMG = '/herobackground.jpg';

function pickImage(images: any[]): string {
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_IMG;
  const primary = images.find((i) => i?.isPrimary || i?.isThumbnail) ?? images[0];
  if (!primary) return FALLBACK_IMG;
  const url = typeof primary === 'string' ? primary : primary?.url || primary?.imageUrl;
  return url || FALLBACK_IMG;
}

function mapEvent(e: any): EventItem {
  return {
    id: e.id,
    title: e.title || e.name || 'Untitled Event',
    date: e.startDate || e.date || '—',
    loc: e.location || [e.city, e.country].filter(Boolean).join(', ') || 'Location TBD',
    type: e.type || e.eventType || 'Event',
    status: e.status || 'draft',
    booked: e.bookedCount ?? e.booked ?? null,
    capacity: e.capacity ?? null,
    revenue: e.revenue ? `₱${Number(e.revenue).toLocaleString()}` : null,
    img: pickImage(e.images ?? e.gallery ?? []),
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
  const user = useAuthStore((s) => s.user);

  const events = (initialData.events ?? []).map(mapEvent);
  const venues = initialData.venues ?? [];
  const inventory = (initialData.inventory ?? []).map(mapBackendAssetToInventoryItem);
  const services = (initialData.services ?? []).map(mapBackendServiceToServiceItem);

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