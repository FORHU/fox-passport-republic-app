"use client";

import React from "react";
import { useHostDashboard } from "@/hooks/useHostDashboard";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import RequireAuth from "@/components/authentication/RequireAuth";

function HostDashboardContent() {
  const { handleLogout, openModal, stats } = useHostDashboard();
  const { user } = useAuthStore();
  const userName = user?.name || user?.username || 'Mayor';
  useScrollReveal();

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer relative">
              <div className="flex h-12 w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <Image 
                  src="/foxonlylogo.png" 
                  alt="FoxPassport Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col relative">
                <h2 className="text-xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                  FoxPassport
                </h2>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                  Mayor Studio
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link
                href="/host"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/host/venues"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Venues
              </Link>
              <Link
                href="/host/calendar"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Calendar
              </Link>
              <Link
                href="/host/earnings"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Earnings
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#db2777] animate-pulse"></span>
              </button>
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{userName}</div>
                  <div className="text-xs text-text-muted">Venue Mayor</div>
                </div>
                <img
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-accent object-cover cursor-pointer hover:scale-110 transition-transform"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                />
              </div>
              <button className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12 reveal-on-scroll">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Venue Live</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                Manage your <span className="text-gradient">Space.</span>
              </h1>
              <p className="text-text-muted">Overview of your venues and upcoming bookings.</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="px-6 py-3 rounded-full flex items-center gap-2"
              >
                <span className="material-symbols-outlined">logout</span> Logout
              </Button>
              <Button
                variant="neon"
                size="lg"
                onClick={openModal}
                className="px-8 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">add_business</span> List New Venue
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 reveal-on-scroll">
            {/* Space Rental Income */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-accent">payments</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">₱{stats.totalRevenue}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-success/20 text-success px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +18%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-accent w-[70%] shadow-[0_0_10px_#ccff00]"></div>
            </div>

            {/* Total Venues */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">business</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Total Venues</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">{stats.totalVenues}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">{stats.activeListings} active listings</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-primary w-[55%] shadow-[0_0_10px_#7c3aed]"></div>
            </div>

            {/* Active Listings */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-secondary">visibility</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Active Listings</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">{stats.activeListings}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_flat</span> 1.5%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-secondary w-[85%] shadow-[0_0_10px_#db2777]"></div>
            </div>

            {/* Average Rating */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-warning">star</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Mayor Rating</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">
                  {stats.averageRating.toFixed(1)}
                </h3>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-warning w-[98%] shadow-[0_0_10px_#eab308]"></div>
            </div>
          </div>

          {/* Empty State or Content */}
          {stats.totalVenues === 0 ? (
            <div className="glass-card rounded-3xl p-12 border border-white/5 text-center reveal-on-scroll">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border border-accent/30 mb-6 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                  <span className="material-symbols-outlined text-accent text-5xl">add_business</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">No venues yet</h3>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Start by listing your first venue. Share your space with foxers and event planners!
                </p>
                <Button
                  variant="neon"
                  size="lg"
                  onClick={openModal}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined">add_business</span>
                  List Your First Venue
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Venues */}
              <div className="lg:col-span-8 space-y-8">
                <section className="reveal-on-scroll">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent animate-spin-slow">storefront</span> My
                      Venues
                    </h2>
                    <Link
                      href="/host/venues"
                      className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-1"
                    >
                      View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {/* Sample Venue Card - Replace with actual venue data */}
                    <div className="glass-panel p-4 rounded-3xl hover:bg-white/5 transition-all group border-l-4 border-l-success relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-[40px] pointer-events-none"></div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="relative w-full sm:w-40 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0">
                          <img
                            alt="Venue"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            src="https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072&auto=format&fit=crop"
                          />
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase border border-white/10">
                            Featured
                          </div>
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                                  Your Venue Name
                                </h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>{" "}
                                    Location
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">groups</span> Capacity
                                  </span>
                                </div>
                              </div>
                              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Active
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Bookings</div>
                              <div className="text-sm font-bold text-white">
                                -- <span className="text-text-muted font-normal">this week</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Revenue</div>
                              <div className="text-sm font-bold text-white">₱--</div>
                            </div>
                            <div className="flex justify-end items-end gap-2">
                              <button
                                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition-all"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                className="h-8 w-8 rounded-full bg-white/5 hover:bg-accent hover:text-black flex items-center justify-center transition-all"
                                title="Analytics"
                              >
                                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                {/* Mayor Profile */}
                <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden reveal-on-scroll">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent"></div>
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-white">Mayor Profile</h3>
                    <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-1 rounded">
                      Elite Mayor
                    </span>
                  </div>
                  <div className="relative z-10 space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit_square</span>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        Edit Profile
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                        <span className="material-symbols-outlined text-[16px]">credit_card</span>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        Payout Settings
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                        <span className="material-symbols-outlined text-[16px]">help</span>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        Mayor Support
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Calendar */}
                <div className="bg-surface rounded-[2rem] p-6 border border-white/5 reveal-on-scroll">
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[20px]">event</span>
                    Quick Calendar
                  </h3>
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm">Calendar view coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <RequireAuth>
      <HostDashboardContent />
    </RequireAuth>
  );
}
