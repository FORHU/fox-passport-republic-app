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

  const mainMenuItems = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Bookings', icon: 'calendar_month' },
    { label: 'Citizens', icon: 'group' },
  ];

  const manageMenuItems = [
    { label: 'Experiences', icon: 'map' },
    { label: 'Categories', icon: 'category' },
    { label: 'Venues', icon: 'location_on' },
  ];

  const systemMenuItems = [
    { label: 'Reports', icon: 'analytics' },
    { label: 'Settings', icon: 'settings' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="w-64 glass-panel border-r border-white/10 flex flex-col h-full z-20">
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
            <h1 className="text-lg font-display font-bold tracking-tight text-white">FoxPassport</h1>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-widest leading-none">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {/* Main Section */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Main</p>
          {mainMenuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.label
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === item.label ? 'material-symbols-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Manage Section */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Manage</p>
          {manageMenuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.label
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === item.label ? 'material-symbols-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        {/* System Section */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">System</p>
          {systemMenuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.label
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === item.label ? 'material-symbols-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="glass-card rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/100?u=admin"
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-accent/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-text-muted truncate">admin@foxpassport.com</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
