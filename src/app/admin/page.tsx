import {
  getDashboardStats,
  getAdminPendingVenues,
  getAdminAllAssets,
  getAdminAllServices,
  getAdminEvents,
  getCategories,
  getUsers,
  getAllBookings,
} from "@/shared/lib/server/data";
import { requireAdmin } from "@/shared/lib/server/auth";
import { AdminBody } from "@/features/admin/components/AdminBody";
import {
  AdminSidebar,
  AdminHeader,
  AdminContent,
  AdminAuthGuard,
} from "@/features/admin/components";
import MobileAdminView from "@/features/admin/components/MobileAdminView";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    stats,
    venues,
    events,
    categories,
    citizens,
    assets,
    services,
    bookings,
  ] = await Promise.all([
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
        {/* Rendered at every width: it is already an off-canvas drawer below lg
            (`-translate-x-full` / `lg:translate-x-0`), and the mobile overview's
            hamburger opens it. Keeping it inside the desktop-only wrapper is
            what left that hamburger with nothing to open. */}
        <AdminSidebar />

        <AdminBody
          overview={<MobileAdminView stats={stats} />}
          content={
            <main className="flex-1 lg:pl-64 min-h-screen flex flex-col min-w-0">
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

              <footer className="mt-auto border-t border-white/5 py-8 px-4 sm:px-8 text-center text-xs text-gray-600">
                <p>
                  &copy; 2024 FoxPassport Admin Dashboard. All rights reserved.
                </p>
              </footer>
            </main>
          }
        />
      </div>
    </AdminAuthGuard>
  );
}
