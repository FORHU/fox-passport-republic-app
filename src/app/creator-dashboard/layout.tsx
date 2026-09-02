import { requireAuth } from "@/shared/lib/server/auth";
import CreatorDashboardShell from "@/features/dashboard/components/CreatorDashboardShell";

/**
 * Host layout - wraps every creator dashboard page.
 *
 * The guard used to be `RequireAuth` alone, client-side against the auth store,
 * with a comment claiming `middleware.ts` handled auth and roles. It did once;
 * it now checks only that a session cookie exists, so that this app need not
 * hold the API's signing key. `requireAuth` here resolves the session against a
 * live `/profile` call before anything renders.
 *
 * Deliberately `requireAuth` and not `requireHost`: `/creator-dashboard/apply`
 * is how someone becomes a host. The five pages that need the stronger check
 * call `requireHost()` themselves, and the API enforces it regardless.
 */
export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <CreatorDashboardShell>{children}</CreatorDashboardShell>;
}
