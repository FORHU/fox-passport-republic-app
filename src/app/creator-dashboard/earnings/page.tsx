export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import FoxerEarningsClient from "../_components/FoxerEarningsClient";
import MobileEarningsView from "@/features/dashboard/components/MobileEarningsView";

// Nobody without `payouts:onboard` has anything here to see — an Organizer
// gets no platform pay at all (ADR 0005). The nav link is already hidden
// for them (DashboardHeader), but the route itself was still open to
// anyone signed in, landing on a page whose only content was a "Connect
// Stripe" link for money they can never receive. Found 25 Sep.
export default async function EarningsPage() {
  await requirePermission("payouts:onboard");

  return (
    <>
      <MobileEarningsView />
      <div className="hidden lg:block bg-background bg-gradient-dark text-text-main antialiased min-h-screen font-body">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-1">
              Earnings & Payouts
            </h1>
            <p className="text-text-muted text-sm">
              Track payments held for you, pending payouts, and full booking
              history.
            </p>
          </div>
          <FoxerEarningsClient />
        </main>
      </div>
    </>
  );
}
