"use client";

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-10 shrink-0">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 leading-tight">Welcome back, Admin</h2>
        <p className="text-sm text-slate-400 font-medium">Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search bookings, users..."
            className="w-80 h-11 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-200 text-sm font-medium transition-all outline-none"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Admin User</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 cursor-pointer shadow-sm">
            <img src="https://i.pravatar.cc/200?u=admin" alt="Admin Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
