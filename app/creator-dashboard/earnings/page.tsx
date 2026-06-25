export const dynamic = 'force-dynamic';

import FoxerEarningsClient from '@/components/host/FoxerEarningsClient';

export default function EarningsPage() {
  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen font-body">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-1">Earnings & Payouts</h1>
          <p className="text-text-muted text-sm">Track your escrow balance, pending payouts, and full booking history.</p>
        </div>
        <FoxerEarningsClient />
      </main>
    </div>
  );
}
