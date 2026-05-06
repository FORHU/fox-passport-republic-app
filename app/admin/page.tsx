import { getDashboardStats, getAdminPendingVenues, getAdminAllAssets, getAdminAllServices, getAdminEvents, getCategories, getUsers, getAllBookings } from '@/lib/server/data';
import { requireAdmin } from '@/lib/server/auth';
import {
  AdminSidebar,
  AdminHeader,
  AdminContent,
  AdminAuthGuard,
} from '@/components/admin';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  const [stats, venues, events, categories, citizens, assets, services, bookings] = await Promise.all([
    getDashboardStats(),
    getAdminPendingVenues(),
    getAdminEvents(),
    getCategories(),
    getUsers(),
    getAdminAllAssets(),
    getAdminAllServices(),
    getAllBookings(),
  ]);

  return (
    <AdminAuthGuard>
      <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex selection:bg-accent selection:text-black font-body">
        <AdminSidebar />

        <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
          <AdminHeader />

          <AdminContent
            stats={stats}
            venues={venues}
            events={events}
            categories={categories}
            citizens={citizens}
            assets={assets}
            services={services}
            bookings={bookings}
          />

          <footer className="mt-auto border-t border-white/5 py-8 px-8 text-center text-xs text-gray-600">
            <p>&copy; 2024 FoxPassport Admin Dashboard. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
