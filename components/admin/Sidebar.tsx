"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthActions } from '@/store/useAuthStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuthActions();

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'User Management', icon: 'group' },
    { label: 'Experiences', icon: 'map' },
    { label: 'Bookings', icon: 'calendar_month' },
    { label: 'Reports', icon: 'analytics' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full z-20">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logofoxpassport.png"
            alt="FoxPassport"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">FoxPassport</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.label
                ? 'bg-pink-50 text-pink-500'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === item.label ? 'material-symbols-fill' : ''}`}>
              {item.icon}
            </span>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setActiveTab('Settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'Settings'
              ? 'bg-pink-50 text-pink-500'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="text-sm font-semibold">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
