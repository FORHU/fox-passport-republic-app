import React from 'react';
import { useUIStore } from '@/store/useUIStore';

export const AdminHeader: React.FC = () => {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-24 flex items-center justify-between px-8 z-40 sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <button className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden sm:block">
          <h1 className="text-2xl font-display font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-text-muted">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-accent focus:border-accent transition-all w-64 placeholder-gray-500" placeholder="Search data..." type="text" />
        </div>
        <button className="relative h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all group">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};
