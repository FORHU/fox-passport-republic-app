"use client";

import React from 'react';
import { useFoxerDashboard } from '@/hooks/dashboards/useFoxerDashboard';
import { FoxerHeader } from '@/components/foxer/FoxerHeader';
import { FoxerWelcome } from '@/components/foxer/FoxerWelcome';
import { FoxerKPIs } from '@/components/foxer/FoxerKPIs';
import { FoxerAnalytics } from '@/components/foxer/FoxerAnalytics';
import { FoxerBookingsTable } from '@/components/foxer/FoxerBookingsTable';
import RequireAuth from '@/components/authentication/RequireAuth';

function FoxerDashboardContent() {
  const { activeTab, setActiveTab } = useFoxerDashboard();

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <FoxerHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {activeTab === 'overview' && (
                <>
                    <FoxerWelcome />
                    <FoxerKPIs />
                    <FoxerAnalytics />
                    <FoxerBookingsTable />
                </>
            )}
            
            {activeTab === 'analytics' && (
                 <div className="text-white text-center py-20">
                    <h2 className="text-2xl font-bold">Analytics Module</h2>
                    <p className="text-text-muted">Detailed analytics coming soon...</p>
                 </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default function FoxerDashboardPage() {
  return (
    <RequireAuth>
      <FoxerDashboardContent />
    </RequireAuth>
  );
}
