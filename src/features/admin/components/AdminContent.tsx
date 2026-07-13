'use client';

import React from 'react';
import { useUIStore } from '@/shared/store/useUIStore';
import {
  AdminKPISection,
  AdminChartsSection,
  AdminSubmissionsTable,
  AdminBookingsTable,
  AdminVenuesTable,
  AdminEventsTable,
  AdminCategoriesTable,
  AdminCitizenTable,
  AdminAssetsTable,
  AdminServicesTable,
  AdminCancellationPolicies,
  AdminDisputesPanel,
} from '@/features/admin/components';
import { useAdminData } from '@/features/admin/hooks/useAdminData';
import { useAdminPendingVenues } from '@/features/admin/hooks/useAdminPendingVenues';
import { useAdminPendingAssets } from '@/features/admin/hooks/useAdminPendingAssets';
import { useAdminPendingServices } from '@/features/admin/hooks/useAdminPendingServices';

interface Props {
  stats: any;
  venues: any[];
  events: any[];
  categories: any[];
  citizens: any[];
  assets: any[];
  services: any[];
  bookings: {
    serviceBookings: any[];
    assetBookings: any[];
    eventBookings: any[];
  };
}

export const AdminContent: React.FC<Props> = ({
  stats,
  venues: initialVenues,
  events: initialEvents,
  categories: initialCategories,
  citizens: initialCitizens,
  assets: initialAssets,
  services: initialServices,
  bookings: initialBookings,
}) => {
  const activeTab = useUIStore(s => s.activeAdminTab);

  // Reactive hooks with polling
  const { data: venues, isLoading: loadingVenues } = useAdminData('venues', initialVenues);
  const { data: services, isLoading: loadingServices } = useAdminData('services', initialServices);
  const { data: assets, isLoading: loadingAssets } = useAdminData('assets', initialAssets);
  const { data: events, isLoading: loadingEvents } = useAdminData('events', initialEvents);
  const { data: citizens, isLoading: loadingCitizens } = useAdminData('citizens', initialCitizens);
  const { data: categories, isLoading: loadingCategories } = useAdminData('categories', initialCategories);
  const { data: adminStats } = useAdminData('stats', stats);
  const { data: adminBookings } = useAdminData('bookings', initialBookings);
  const { venues: pendingVenues, isLoading: loadingPendingVenues } = useAdminPendingVenues();
  const { assets: pendingAssets, isLoading: loadingPendingAssets } = useAdminPendingAssets();
  const { services: pendingServices, isLoading: loadingPendingServices } = useAdminPendingServices();
  return (
    <div className="p-8 space-y-8">
      {activeTab === 'dashboard' && (
        <>
          <AdminKPISection stats={adminStats} />
          <AdminChartsSection
            bookingsByDay={adminStats?.bookingsByDay ?? [0, 0, 0, 0, 0, 0, 0]}
            categoryStats={adminStats?.categoryStats ?? []}
          />
          <AdminSubmissionsTable />

          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-white">Pending Listings</h2>
            <AdminVenuesTable venues={pendingVenues} isLoading={loadingPendingVenues} />
            <AdminAssetsTable assets={pendingAssets} isLoading={loadingPendingAssets} />
            <AdminServicesTable services={pendingServices} isLoading={loadingPendingServices} />
          </div>
        </>
      )}

      {activeTab === 'bookings' && (
        <AdminBookingsTable
          serviceBookings={adminBookings?.serviceBookings || []}
          assetBookings={adminBookings?.assetBookings || []}
          eventBookings={adminBookings?.eventBookings || []}
        />
      )}

      {activeTab === 'citizens' && (
        <AdminCitizenTable citizens={citizens} isLoading={loadingCitizens} />
      )}

      {activeTab === 'events' && (
        <AdminEventsTable events={events} isLoading={loadingEvents} />
      )}

      {activeTab === 'categories' && (
        <AdminCategoriesTable categories={categories} isLoading={loadingCategories} />
      )}

      {activeTab === 'venues' && (
        <AdminVenuesTable venues={venues} isLoading={loadingVenues} />
      )}

      {activeTab === 'assets' && (
        <AdminAssetsTable assets={assets} isLoading={loadingAssets} />
      )}

      {activeTab === 'services' && (
        <AdminServicesTable services={services} isLoading={loadingServices} />
      )}

      {activeTab === 'disputes' && (
        <AdminDisputesPanel />
      )}

      {activeTab === 'policies' && (
        <AdminCancellationPolicies />
      )}

      {activeTab === 'settings' && (
        <div className="glass-card rounded-[2rem] p-12 border border-white/5 flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[56px] text-white/20">settings</span>
          <h2 className="text-2xl font-display font-bold text-white">Settings</h2>
          <p className="text-text-muted max-w-sm">Platform configuration and system settings will be available here.</p>
        </div>
      )}
    </div>
  );
};
