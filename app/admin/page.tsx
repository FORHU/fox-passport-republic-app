import React from 'react';
import { getDashboardStats, getVenues, getEvents, getCategories, getUsers } from '@/lib/server/data';
import { requireAdmin } from '@/lib/server/auth';
import {
  AdminSidebar,
  AdminHeader,
  AdminKPISection,
  AdminChartsSection,
  AdminSubmissionsTable,
  AdminVenuesTable,
  AdminEventsTable,
  AdminCategoriesTable,
  AdminCitizenTable,
  AdminAuthGuard
} from '@/components/admin';

export default async function AdminDashboard() {
  // Check auth server-side
  await requireAdmin();

  // Fetch data server-side
  const stats = await getDashboardStats();
  const venues = await getVenues();
  const events = await getEvents();
  const categories = await getCategories();
  const citizens = await getUsers();

  return (
    <AdminAuthGuard>
      <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex selection:bg-accent selection:text-black font-body">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
          <AdminHeader />

          <div className="p-8 space-y-8">
            <AdminKPISection stats={stats} />
            <AdminChartsSection />
            <AdminSubmissionsTable />
            <AdminVenuesTable venues={venues} isLoading={false} refetch={() => {}} />
            <AdminEventsTable events={events} isLoading={false} refetch={() => {}} />
            <AdminCategoriesTable categories={categories} isLoading={false} refetch={() => {}} />
            <AdminCitizenTable citizens={citizens} isLoading={false} refetch={() => {}} />
          </div>

          <footer className="mt-auto border-t border-white/5 py-8 px-8 text-center text-xs text-gray-600">
            <p>&copy; 2024 FoxPassport Admin Dashboard. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
