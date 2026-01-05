"use client";

import React, { useState } from 'react';
import {
  Sidebar,
  Header,
  Dashboard,
  AdminAuthGuard,
  EventsManagement,
} from '@/components/admin';

const AdminDashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-light">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'Dashboard' && <Dashboard />}
            {activeTab === 'Experiences' && <EventsManagement />}
            {activeTab !== 'Dashboard' && activeTab !== 'Experiences' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4">construction</span>
                <h2 className="text-2xl font-bold">{activeTab} screen is coming soon</h2>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <AdminAuthGuard>
      <AdminDashboardContent />
    </AdminAuthGuard>
  );
};

export default AdminDashboard;
