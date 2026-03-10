"use client";

import React from 'react';
import { useAdminDashboard } from '@/hooks/dashboards/useAdminDashboard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminKPISection } from '@/components/admin/AdminKPISection';
import { AdminChartsSection } from '@/components/admin/AdminChartsSection';
import { AdminSubmissionsTable } from '@/components/admin/AdminSubmissionsTable';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

const AdminDashboard: React.FC = () => {
  const { loading } = useAdminDashboard();

  if (loading) {
    return <div className="text-white">Loading...</div>; // Or a proper spinner
  }

  return (
    <AdminAuthGuard>
      <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex selection:bg-accent selection:text-black font-body">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
          <AdminHeader />

          <div className="p-8 space-y-8">
            <AdminKPISection />
            <AdminChartsSection />
            <AdminSubmissionsTable />
          </div>

          <footer className="mt-auto border-t border-white/5 py-8 px-8 text-center text-xs text-gray-600">
            <p>&copy; 2024 FoxPassport Admin Dashboard. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;
