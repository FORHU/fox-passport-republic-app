"use client";

import React from 'react';
import { useAdminDashboard } from '@/hooks/dashboards/useAdminDashboard';
import { useAdminData } from '@/hooks/dashboards/useAdminData';
import { useUIStore } from '@/store/useUIStore';
import { 
  AdminSidebar, 
  AdminHeader, 
  AdminKPISection, 
  AdminChartsSection, 
  AdminSubmissionsTable,
  AdminVenuesTable,
  AdminEventsTable,
  AdminCategoriesTable,
  AdminCitizenTable,
  AdminAuthGuard 
} from '@/components/admin';

const AdminDashboard: React.FC = () => {
  const { loading: statsLoading } = useAdminDashboard();
  const { activeAdminTab } = useUIStore();
  
  // Fetch data for the active tab (if it's not the dashboard)
  const { data: listData, isLoading: listLoading, refetch: refetchListData } = useAdminData(activeAdminTab);

  if (statsLoading && activeAdminTab === "dashboard") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeAdminTab) {
      case "dashboard":
        return (
          <>
            <AdminKPISection />
            <AdminChartsSection />
            <AdminSubmissionsTable />
          </>
        );
      case "venues":
        return <AdminVenuesTable venues={listData} isLoading={listLoading} refetch={refetchListData} />;
      case "events":
        return <AdminEventsTable events={listData} isLoading={listLoading} refetch={refetchListData} />;
      case "categories":
        return <AdminCategoriesTable categories={listData} isLoading={listLoading} refetch={refetchListData} />;
      case "citizens":
        return <AdminCitizenTable citizens={listData} isLoading={listLoading} refetch={refetchListData} />;
      default:
        return (
          <div className="glass-panel p-12 text-center rounded-[2rem]">
            <span className="material-symbols-outlined text-[64px] text-white/10 mb-4">construction</span>
            <h3 className="text-xl font-bold text-white/50">Section "{activeAdminTab}" is under development</h3>
          </div>
        );
    }
  };

  return (
    <AdminAuthGuard>
      <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex selection:bg-accent selection:text-black font-body">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
          <AdminHeader />

          <div className="p-8 space-y-8">
            {renderContent()}
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
