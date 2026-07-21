export const dynamic = 'force-dynamic';

import React from 'react';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import QRScannerClient from '@/features/dashboard/components/QRScannerClient';

export default function CheckInPage() {
  return (
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
          <div className="mb-8">
            <div className="text-2xl font-display font-bold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#ccff00]">qr_code_scanner</span>
              Event Check-In
            </div>
            <p className="text-sm text-white/50">
              Scan the QR code on a citizen&apos;s booking page to verify their entry.
            </p>
          </div>

          <QRScannerClient />
        </div>
      </main>
    </div>
  );
}
