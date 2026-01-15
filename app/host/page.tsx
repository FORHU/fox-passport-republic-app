'use client';

import React from 'react';
import RequireAuth from '@/components/authentication/RequireAuth';
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
} from '@/components/host/dashboard';

export default function Dashboard() {
  const {
    // State
    events,
    venues,
    inventory,
    services,
    isCreateMenuOpen,
    menuRef,
    
    // Actions
    updateEventStatus,
    updateVenueStatus,
    updateInventoryStatus,
    updateServiceStatus,
    
    // Handlers
    handleToggleCreateMenu,
    handleNavigateToCreateEvent,
    handleNavigateToCreateVenue,
    handleNavigateToCreateInventory,
    handleNavigateToCreateService,
  } = useDashboard();

  return (
    <RequireAuth>
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
            />

            <KPICards />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
              <OccupancyChart />
              <PendingRequests />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-10">
                <EventsSection events={events} onStatusChange={updateEventStatus} />
                <VenuesSection venues={venues} onStatusChange={updateVenueStatus} />
                <InventorySection inventory={inventory} onStatusChange={updateInventoryStatus} />
                <ServicesSection services={services} onStatusChange={updateServiceStatus} />
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
    </RequireAuth>
  );
}
