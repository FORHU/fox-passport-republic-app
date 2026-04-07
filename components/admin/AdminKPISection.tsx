import React from 'react';

interface AdminKPISectionProps {
  stats: {
    totalUsers: number;
    activeEvents: number;
  };
}

export const AdminKPISection: React.FC<AdminKPISectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[100px] text-primary">group</span>
        </div>
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-glow mb-4 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <p className="text-text-muted font-medium text-sm">Total Citizens</p>
          <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">{stats.totalUsers}</h3>
          <div className="flex items-center gap-1 mt-2 text-accent text-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+12%</span>
            <span className="text-gray-500 font-normal ml-1">this week</span>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-secondary/50 transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[100px] text-secondary">confirmation_number</span>
        </div>
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-4 shadow-[0_0_15px_rgba(219,39,119,0.3)]">
            <span className="material-symbols-outlined">local_activity</span>
          </div>
          <p className="text-text-muted font-medium text-sm">Active Events</p>
          <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">{stats.activeEvents}</h3>
          <div className="flex items-center gap-1 mt-2 text-accent text-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+8.5%</span>
            <span className="text-gray-500 font-normal ml-1">vs last month</span>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-accent/50 transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[100px] text-accent">payments</span>
        </div>
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-4 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <p className="text-text-muted font-medium text-sm">Total Revenue</p>
          <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">₱3.2M</h3>
          <div className="flex items-center gap-1 mt-2 text-accent text-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+24%</span>
            <span className="text-gray-500 font-normal ml-1">record high</span>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[100px] text-blue-500">pending</span>
        </div>
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <span className="material-symbols-outlined">hourglass_top</span>
          </div>
          <p className="text-text-muted font-medium text-sm">Pending Approval</p>
          <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">45</h3>
          <div className="flex items-center gap-1 mt-2 text-red-400 text-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
            <span>Action Needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
