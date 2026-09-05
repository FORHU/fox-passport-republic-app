import { requireAuth } from "@/shared/lib/server/auth";
import HostShell from "./_components/HostShell";

/**
 * Signed-in only: this tree is assets, events, services, venues (plus their
 * edit routes) and Stripe onboarding/dashboard — the full supply-side surface
 * under a different path than /creator-dashboard.
 *
 * This guard used to be `RequireAuth` alone, client-side against the auth
 * store, with a comment claiming "auth & role checks are handled by proxy.ts".
 * `middleware.ts` (the file that comment meant) checks only that a session
 * cookie exists — it never covered `/host` at all, so this tree rendered for
 * anyone, session or none, until the redirect fired client-side a moment
 * later. `requireAuth` here resolves the session against a live `/profile`
 * call before anything renders, the same fix already applied to
 * creator-dashboard, mayor and foxer.
 *
 * A layout rather than a page, so the whole tree is covered by one guard
 * instead of by each page remembering. The create-venue modal state moved to
 * `HostShell` so this file can stay a server component.
 */
export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <HostShell>{children}</HostShell>;
}
