'use client';

import React from 'react';
import Link from 'next/link';

export function DashboardHeader() {
  return (
    <header className="fixed top-6 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-display font-bold text-white group-hover:text-[#ccff00] transition-colors">
                FoxPassport
              </h2>
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                Creator Studio
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-black/30 p-1.5 rounded-full border border-white/5">
            <Link
              href="/host"
              className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            >
              Overview
            </Link>
            <a
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10"
              href="#events"
            >
              Events
            </a>
            <a
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10"
              href="#venues"
            >
              Venues
            </a>
            <a
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10"
              href="#inventory"
            >
              Assets
            </a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_#db2777] animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold">Alex Chen</div>
                <div className="text-xs text-white/50">Pro Creator</div>
              </div>
              <img
                className="h-10 w-10 rounded-full border-2 border-[#ccff00] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

interface WelcomeBannerProps {
  isCreateMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggleCreateMenu: () => void;
  onNavigateToCreateEvent: () => void;
  onNavigateToCreateVenue: () => void;
  onNavigateToCreateInventory: () => void;
  onNavigateToCreateService: () => void;
}

export function WelcomeBanner({
  isCreateMenuOpen,
  menuRef,
  onToggleCreateMenu,
  onNavigateToCreateEvent,
  onNavigateToCreateVenue,
  onNavigateToCreateInventory,
  onNavigateToCreateService,
}: WelcomeBannerProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
          <span className="flex h-2 w-2 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/90">System Online</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Alex!
          </span>
        </h1>
        <p className="text-white/50">
          Managing <span className="text-white font-bold">2 Events</span>,{' '}
          <span className="text-white font-bold">2 Venues</span>, and{' '}
          <span className="text-white font-bold">4 Assets</span>.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/host/calendar"
          className="px-6 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">calendar_month</span>
          Calendar
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleCreateMenu}
            className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Create New
          </button>
          {isCreateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f111a] border border-white/10 rounded-xl shadow-xl z-50">
              <button
                onClick={onNavigateToCreateEvent}
                className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[#ccff00] text-[18px]">event</span>
                Event
              </button>
              <button
                onClick={onNavigateToCreateVenue}
                className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-pink-500 text-[18px]">apartment</span>
                Venue
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button
                onClick={onNavigateToCreateInventory}
                className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-purple-500 text-[18px]">inventory_2</span>
                Item
              </button>
              <button
                onClick={onNavigateToCreateService}
                className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-yellow-500 text-[18px]">design_services</span>
                Service
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
