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
import { hasPermission } from "@/shared/lib/permissions";
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
  const user = await requireAdmin();

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
    // Only fetched when the viewer may read it. `admin_secretary` holds
    // `admin:access` and `queue:read` but not `users:read`, so this call 403s
    // for them — and `serverFetch` throws on a non-ok response, which rejects
    // the whole `Promise.all` and takes the console down. The role could not
    // open the page at all: the permission model was right and the page asked
    // for something it was not entitled to anyway.
    hasPermission(user, "users:read") ? getUsers() : Promise.resolve([]),
    getAdminAllAssets(),
    getAdminAllServices(),
    // Same rule. `/bookings` scopes its results rather than refusing, so this
    // one would not have crashed — but asking for every booking without
    // `bookings:read:all` is still asking for something we may not have, and
    // the Bookings tab is hidden from anyone who cannot.
    hasPermission(user, "bookings:read:all")
      ? getAllBookings()
      : Promise.resolve({
          serviceBookings: [],
          assetBookings: [],
          eventBookings: [],
        }),
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
