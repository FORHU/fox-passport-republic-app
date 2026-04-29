import { getDashboardStats, getVenues, getAdminEventTemplates, getCategories, getUsers, getAllAssets, getAllServices } from '@/lib/server/data';
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
  AdminAssetsTable,
  AdminServicesTable,
  AdminAuthGuard
} from '@/components/admin';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  const [stats, venues, events, categories, citizens, assets, services] = await Promise.all([
    getDashboardStats(),
    getVenues(),
    getAdminEventTemplates(),
    getCategories(),
    getUsers(),
    getAllAssets(),
    getAllServices(),
  ]);

  return (
    <AdminAuthGuard>
      <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex selection:bg-accent selection:text-black font-body">
        <AdminSidebar />

        <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
          <AdminHeader />

          <div className="p-8 space-y-8">
            <AdminKPISection stats={stats} />
            <AdminChartsSection />
            <AdminSubmissionsTable />
            <AdminVenuesTable venues={venues} isLoading={false} />
            <AdminEventsTable events={events} isLoading={false} />
            <AdminAssetsTable assets={assets} isLoading={false} />
            <AdminServicesTable services={services} isLoading={false} />
            <AdminCategoriesTable categories={categories} isLoading={false} />
            <AdminCitizenTable citizens={citizens} isLoading={false} />
          </div>

          <footer className="mt-auto border-t border-white/5 py-8 px-8 text-center text-xs text-gray-600">
            <p>&copy; 2024 FoxPassport Admin Dashboard. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
