"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar 
} from 'lucide-react';

import LogoutButton from './LogoutButton'; 

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-gray-200">
        
      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logofoxpassport.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="h-10 w-auto object-contain" 
            />
            <span className="text-lg font-bold tracking-tight text-gray-800">
              Fox<span className="text-pink-600">Admin</span>
            </span>
          </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem href="/foxerDashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <SidebarItem href="#" icon={<Calendar size={20} />} label="Bookings" />
          <SidebarItem href="#" icon={<Settings size={20} />} label="Settings" />
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="p-4 border-t border-gray-100">
          <LogoutButton />
      </div>
    </aside>
  );
}

// Helper Component for Sidebar Links (Internal to this file)
function SidebarItem({ href, icon, label, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? "bg-pink-50 text-pink-700" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}