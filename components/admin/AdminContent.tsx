'use client';

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
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
} from '@/components/admin';

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
  venues,
  events,
  categories,
  citizens,
  assets,
  services,
  bookings,
}) => {
  const activeTab = useUIStore(s => s.activeAdminTab);

  return (
    <div className="p-8 space-y-8">
      {activeTab === 'dashboard' && (
        <>
          <AdminKPISection stats={stats} />
          <AdminChartsSection
            bookingsByDay={stats.bookingsByDay ?? [0, 0, 0, 0, 0, 0, 0]}
            categoryStats={stats.categoryStats ?? []}
          />
          <AdminSubmissionsTable />
        </>
      )}

      {activeTab === 'bookings' && (
        <AdminBookingsTable
          serviceBookings={bookings.serviceBookings}
          assetBookings={bookings.assetBookings}
          eventBookings={bookings.eventBookings}
        />
      )}

      {activeTab === 'citizens' && (
        <AdminCitizenTable citizens={citizens} isLoading={false} />
      )}

      {activeTab === 'events' && (
        <AdminEventsTable events={events} isLoading={false} />
      )}

      {activeTab === 'categories' && (
        <AdminCategoriesTable categories={categories} isLoading={false} />
      )}

      {activeTab === 'venues' && (
        <AdminVenuesTable venues={venues} isLoading={false} />
      )}

      {activeTab === 'assets' && (
        <AdminAssetsTable assets={assets} isLoading={false} />
      )}

      {activeTab === 'services' && (
        <AdminServicesTable services={services} isLoading={false} />
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
