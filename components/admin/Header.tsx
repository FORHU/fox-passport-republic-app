"use client";

import React from 'react';
import { Input } from '@/components/ui/input';

const Header: React.FC = () => {
  return (
    <header className="h-20 glass-panel border-b border-white/10 px-8 flex items-center justify-between z-10 shrink-0">
      <div className="flex flex-col">
        <h2 className="text-xl font-display font-bold text-white leading-tight">Welcome back, Admin</h2>
        <p className="text-sm text-text-muted font-medium">Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search bookings, users..."
            icon="search"
            iconPosition="left"
            className="w-80"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background shadow-[0_0_8px_rgba(204,255,0,0.6)]"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">Admin User</p>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/20 cursor-pointer shadow-glow">
            <img src="https://i.pravatar.cc/200?u=admin" alt="Admin Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
