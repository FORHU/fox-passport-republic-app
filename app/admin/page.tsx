"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex selection:bg-accent selection:text-black font-body">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-surface/40 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <Image 
                src="/foxonlylogo.png" 
                alt="FoxPassport Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
          </Link>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto hide-scrollbar">
          <div className="px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Main</div>
          <a href="#" className="nav-item active flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-white/10 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">dashboard</span>
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">confirmation_number</span>
            <span className="font-medium">Bookings</span>
            <span className="ml-auto bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full">12</span>
          </a>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">group</span>
            <span className="font-medium">Citizens</span>
          </a>
          <div className="px-4 pt-6 pb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Manage</div>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">event</span>
            <span className="font-medium">Events</span>
          </a>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">category</span>
            <span className="font-medium">Categories</span>
          </a>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">storefront</span>
            <span className="font-medium">Venues</span>
          </a>
          <div className="px-4 pt-6 pb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-display">System</div>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">bar_chart</span>
            <span className="font-medium">Reports</span>
          </a>
          <a href="#" className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined group-hover:animate-wiggle">settings</span>
            <span className="font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="bg-surface-highlight/50 rounded-2xl p-4 flex items-center gap-3 border border-white/5 cursor-pointer hover:border-accent/50 transition-colors group">
            <img alt="Admin" className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-accent transition-colors" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop" />
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-white truncate">Admin User</div>
              <div className="text-xs text-text-muted truncate">admin@foxpassport.ph</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        <header className="h-24 flex items-center justify-between px-8 z-40 sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-4">
            <button className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

        <div className="p-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-primary">group</span>
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-glow mb-4 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <p className="text-text-muted font-medium text-sm">Total Citizens</p>
                <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">24.5k</h3>
                <div className="flex items-center gap-1 mt-2 text-accent text-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+12%</span>
                  <span className="text-gray-500 font-normal ml-1">this week</span>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-secondary/50 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-secondary">confirmation_number</span>
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-4 shadow-[0_0_15px_rgba(219,39,119,0.3)]">
                  <span className="material-symbols-outlined">local_activity</span>
                </div>
                <p className="text-text-muted font-medium text-sm">Active Events</p>
                <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">1,204</h3>
                <div className="flex items-center gap-1 mt-2 text-accent text-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+8.5%</span>
                  <span className="text-gray-500 font-normal ml-1">vs last month</span>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-accent/50 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-accent">payments</span>
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-4 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <p className="text-text-muted font-medium text-sm">Total Revenue</p>
                <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">₱3.2M</h3>
                <div className="flex items-center gap-1 mt-2 text-accent text-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+24%</span>
                  <span className="text-gray-500 font-normal ml-1">record high</span>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-blue-500">pending</span>
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <span className="material-symbols-outlined">hourglass_top</span>
                </div>
                <p className="text-text-muted font-medium text-sm">Pending Approval</p>
                <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">45</h3>
                <div className="flex items-center gap-1 mt-2 text-red-400 text-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                  <span>Action Needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts & Categories */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Revenue Trends</h3>
                  <p className="text-sm text-text-muted">Daily transaction volume</p>
                </div>
                <select className="bg-surface-highlight border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-accent focus:border-accent">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-4 px-2">
                {[
                  { day: 'Mon', h: '40%' },
                  { day: 'Tue', h: '65%' },
                  { day: 'Wed', h: '35%' },
                  { day: 'Thu', h: '85%', active: true },
                  { day: 'Fri', h: '60%' },
                  { day: 'Sat', h: '75%' },
                  { day: 'Sun', h: '50%' },
                ].map((bar, i) => (
                  <div key={i} className="w-full flex flex-col justify-end group gap-2 h-full">
                    <div 
                      className={`w-full bg-surface-highlight rounded-t-lg relative overflow-hidden chart-bar transition-all duration-500 ease-out`}
                      style={{ height: bar.h }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-t ${bar.active ? 'from-accent/50 to-accent/80 opacity-80' : 'from-primary/50 to-primary/80 opacity-60'} group-hover:opacity-100 transition-opacity ${bar.active ? 'shadow-[0_0_20px_rgba(204,255,0,0.2)]' : ''}`}></div>
                    </div>
                    <span className={`text-xs text-center ${bar.active ? 'text-white font-bold' : 'text-gray-500 font-medium'}`}>{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col h-full">
              <h3 className="text-xl font-display font-bold text-white mb-6">Popular Categories</h3>
              <div className="space-y-6 flex-1">
                {[
                  { name: 'Parties & Socials', val: '45%', color: 'bg-secondary', shadow: 'rgba(219,39,119,0.8)' },
                  { name: 'Tours & Excursions', val: '32%', color: 'bg-accent', shadow: 'rgba(204,255,0,0.8)' },
                  { name: 'Festivals & Fairs', val: '15%', color: 'bg-primary', shadow: 'rgba(124,58,237,0.8)' },
                  { name: 'Classes & Workshops', val: '8%', color: 'bg-blue-400', shadow: 'rgba(96,165,250,0.8)' },
                ].map((cat, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-medium text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cat.color}`} style={{ boxShadow: `0 0 8px ${cat.shadow}` }}></span>
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat.val}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.val, boxShadow: `0 0 10px ${cat.shadow.replace('0.8', '0.5')}` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-all">
                View Detailed Report
              </button>
            </div>
          </div>

          {/* Recent Submissions Table */}
          <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-display font-bold text-white">Recent Event Submissions</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full bg-white/5 text-xs font-bold text-white hover:bg-white hover:text-black transition-colors">All</button>
                <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-text-muted hover:text-white transition-colors">Pending</button>
                <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-text-muted hover:text-white transition-colors">Approved</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
                    <th className="p-6 font-medium">Event Name</th>
                    <th className="p-6 font-medium">Category</th>
                    <th className="p-6 font-medium">Date</th>
                    <th className="p-6 font-medium">Organizer</th>
                    <th className="p-6 font-medium">Status</th>
                    <th className="p-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img alt="Event" className="h-10 w-10 rounded-lg object-cover" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop" />
                        <span className="font-bold text-white group-hover:text-accent transition-colors">Neon Nights: Retro Wave</span>
                      </div>
                    </td>
                    <td className="p-6 text-gray-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Parties & Socials
                      </span>
                    </td>
                    <td className="p-6 text-gray-300">Aug 30, 2024</td>
                    <td className="p-6 text-gray-300">Vibe Check Inc.</td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Approved
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img alt="Event" className="h-10 w-10 rounded-lg object-cover" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop" />
                        <span className="font-bold text-white group-hover:text-accent transition-colors">Coffee Tasting Workshop</span>
                      </div>
                    </td>
                    <td className="p-6 text-gray-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Classes & Workshops
                      </span>
                    </td>
                    <td className="p-6 text-gray-300">Sep 05, 2024</td>
                    <td className="p-6 text-gray-300">Bean & Leaf Co.</td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                        <span className="material-symbols-outlined text-[14px]">hourglass_top</span> Pending
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img alt="Event" className="h-10 w-10 rounded-lg object-cover" src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=100&auto=format&fit=crop" />
                        <span className="font-bold text-white group-hover:text-accent transition-colors">Stargazing Camp</span>
                      </div>
                    </td>
                    <td className="p-6 text-gray-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Tours & Excursions
                      </span>
                    </td>
                    <td className="p-6 text-gray-300">Sep 10, 2024</td>
                    <td className="p-6 text-gray-300">Outdoor Adventures Ph</td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Approved
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-center">
              <button className="text-sm text-text-muted hover:text-accent font-medium transition-colors flex items-center gap-1">
                View All Submissions <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-auto border-t border-white/5 py-8 px-8 text-center text-xs text-gray-600">
          <p>&copy; 2024 FoxPassport Admin Dashboard. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
