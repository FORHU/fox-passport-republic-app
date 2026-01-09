"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { KPICard } from '@/components/ui/kpi-card';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useCreateListingModal } from '@/hooks/useCreateListingModal';
import RequireAuth from '@/components/authentication/RequireAuth';

function FoxerDashboardContent() {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState('overview');
  const { onOpen } = useCreateListingModal();

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
                  Foxer Studio
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'text-black bg-accent hover:shadow-[0_0_15px_rgba(204,255,0,0.5)]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Dashboard
              </button>
              <Link href="/foxer" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
                Events
              </Link>
              <Link href="/foxer/listings" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
                Listings
              </Link>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Analytics
              </button>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#db2777] animate-pulse"></span>
              </button>
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">Alex Chen</div>
                  <div className="text-xs text-text-muted">Pro Foxer</div>
                </div>
                <img
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-accent object-cover cursor-pointer hover:scale-110 transition-transform"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop"
                />
              </div>
              <button className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12 reveal-on-scroll">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                  System Online
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                Welcome back, <span className="text-gradient">Alex!</span>
              </h1>
              <p className="text-text-muted">Here's what's happening with your events today.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-full">
                <span className="material-symbols-outlined">calendar_month</span> Calendar
              </Button>
              <Button
                variant="neon"
                size="lg"
                onClick={onOpen}
                className="rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">add_circle</span> Create New Event
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 reveal-on-scroll">
            <KPICard
              title="Operating Income"
              value="₱142,500"
              icon="payments"
              iconColor="text-accent"
              trend={{ value: "+12%", direction: "up", label: "vs last month" }}
              progressColor="bg-accent"
              progressWidth="70%"
            />
            <KPICard
              title="Tickets Sold"
              value="1,240"
              icon="confirmation_number"
              iconColor="text-primary"
              trend={{ value: "+8%", direction: "up", label: "this week" }}
              progressColor="bg-primary"
              progressWidth="85%"
            />
            <KPICard
              title="Active Events"
              value="12"
              icon="event"
              iconColor="text-secondary"
              progressColor="bg-secondary"
              progressWidth="60%"
            />
            <KPICard
              title="Total Bookings"
              value="94"
              icon="local_activity"
              iconColor="text-success"
              trend={{ value: "+24%", direction: "up", label: "vs last week" }}
              progressColor="bg-success"
              progressWidth="90%"
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 reveal-on-scroll">
            {/* Revenue Chart Card */}
            <GlassCard variant="default" className="lg:col-span-2 p-6">
              <GlassCardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <GlassCardTitle>Revenue Overview</GlassCardTitle>
                  <select className="text-sm bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white cursor-pointer">
                    <option className="bg-background">Last 7 days</option>
                    <option className="bg-background">Last 30 days</option>
                    <option className="bg-background">Last 3 months</option>
                  </select>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="p-0">
                <div className="h-64 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 75, 90].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-accent to-accent/50 rounded-t-lg chart-bar"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-text-muted">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Quick Actions Card */}
            <GlassCard variant="default" className="p-6">
              <GlassCardHeader className="p-0 mb-6">
                <GlassCardTitle>Quick Actions</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="p-0">
                <div className="space-y-3">
                  {[
                    { icon: 'add_circle', label: 'Create Event', color: 'text-accent' },
                    { icon: 'group', label: 'View Attendees', color: 'text-primary' },
                    { icon: 'bar_chart', label: 'Analytics', color: 'text-secondary' },
                    { icon: 'settings', label: 'Settings', color: 'text-text-muted' },
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <span className={`material-symbols-outlined ${action.color} group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </span>
                      <span className="text-white font-medium">{action.label}</span>
                      <span className="material-symbols-outlined text-text-muted ml-auto">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Recent Bookings Table */}
          <GlassCard variant="default" className="p-6 reveal-on-scroll">
            <GlassCardHeader className="p-0 mb-6">
              <div className="flex items-center justify-between">
                <GlassCardTitle>Recent Bookings</GlassCardTitle>
                <Button variant="ghost" size="sm">
                  View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Button>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Event</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Attendees</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { event: 'Sunset Rooftop Party', date: 'Nov 15, 2024', attendees: 45, revenue: '₱22,500', status: 'confirmed' },
                      { event: 'Tech Mixer & Networking', date: 'Nov 18, 2024', attendees: 80, revenue: '₱40,000', status: 'confirmed' },
                      { event: 'Art Gallery Opening', date: 'Nov 22, 2024', attendees: 32, revenue: '₱16,000', status: 'pending' },
                    ].map((booking, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-white font-medium">{booking.event}</td>
                        <td className="py-4 px-4 text-text-muted">{booking.date}</td>
                        <td className="py-4 px-4 text-white">{booking.attendees}</td>
                        <td className="py-4 px-4 text-white font-bold">{booking.revenue}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'confirmed'
                                ? 'bg-success/20 text-success'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

export default function FoxerDashboardPage() {
  return (
    <RequireAuth>
      <FoxerDashboardContent />
    </RequireAuth>
  );
}
