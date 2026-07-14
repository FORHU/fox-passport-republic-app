'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function BookingHeader() {
  const router = useRouter();
  const { user } = useAuthStore();

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
      case "super_admin":
        return "/admin";
      case "host":
      case "mayor":
      case "foxer":
        return "/creator-dashboard";
      default:
        return "/user";
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
            <Link href="/" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">Explore</Link>
            <Link href="/booking" className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5">Bookings</Link>
            <Link href="/passport" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">Community</Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-text-muted">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Online</span>
            </div>
            <div
              className="h-10 w-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-accent transition-colors"
              onClick={() => router.push(dashboardPath)}
            >
              {user?.imgId ? (
                <img alt="User" className="h-full w-full object-cover" src={user.imgId} />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#ccff00] text-black font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
