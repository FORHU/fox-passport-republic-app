"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import CreateListingModal from '@/components/foxer/CreateListingModal';
import Image from 'next/image';

import { useAuthStore } from '@/store/useAuthStore';

export default function FoxerDashboard() {
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const { user } = useAuthStore();

  const displayName = user?.name || user?.username || 'Foxer';
  const displayRole = user?.role === 'host' ? 'Pro Foxer' : 'Foxer Member';

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <CreateListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} />
      
      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Foxer Studio</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link href="/foxer" className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all">Dashboard</Link>
              <a className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all" href="#">Events</a>
              <a className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all" href="#">Bookings</a>
              <a className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all" href="#">Analytics</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#db2777] animate-pulse"></span>
              </button>
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{displayName}</div>
                  <div className="text-xs text-text-muted">{displayRole}</div>
                </div>
                <Image alt="User" width={40} height={40} className="h-10 w-10 rounded-full border-2 border-accent object-cover cursor-pointer hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM" />
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
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/50 shadow-[0_0_20px_rgba(204,255,0,0.4)] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_15px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">System Online</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                Welcome back, <span className="text-gradient">{displayName.split(' ')[0]}!</span>
              </h1>
              <p className="text-text-muted">Here's what's happening with your events today.</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_month</span> Calendar
              </button>
              <button 
                onClick={() => setIsListingModalOpen(true)}
                className="btn-neon px-8 py-3 rounded-full bg-accent text-black font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">add_circle</span> Create New Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-accent">payments</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Operating Income</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">₱142,500</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-[#14532d] text-[#4ade80] px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#ccff00] w-[70%] shadow-[0_0_15px_#ccff00] rounded-r-full z-20"></div>
            </div>
            {/* Rest of KPIs unchanged in logic, just re-rendered for context if needed */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">confirmation_number</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Tickets Sold</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">1,240</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-[#14532d] text-[#4ade80] px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +5.4%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#7c3aed] w-[55%] shadow-[0_0_15px_#7c3aed] rounded-r-full z-20"></div>
            </div>
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-secondary">visibility</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Profile Views</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">4.2k</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-[#831843] text-[#f472b6] px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_flat</span> 0.8%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#db2777] w-[85%] shadow-[0_0_15px_#db2777] rounded-r-full z-20"></div>
            </div>
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-warning">star</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Foxer Rating</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">4.9</h3>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star_half</span>
                  <span className="text-white/40 ml-1">(120 reviews)</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#eab308] w-[98%] shadow-[0_0_15px_#eab308] rounded-r-full z-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent animate-[spin_3s_linear_infinite]">hub</span> My Active Events
                  </h2>
                  <a className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-1" href="#">View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
                </div>
                {/* Events list can remain similar, just ensuring no "Host" text leakage */}
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-3xl hover:bg-white/5 transition-all group border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ade80] shadow-[0_0_15px_#4ade80] rounded-l-3xl"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="flex flex-col sm:flex-row gap-5 pl-2">
                      <div className="relative w-full sm:w-40 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0">
                        <Image alt="Event" fill className="object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase border border-white/10">Nightlife</div>
                      </div>
                      <div className="grow flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Neon Nights: Retro Wave Party</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Tomorrow, 9PM</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> Makati</span>
                              </div>
                            </div>
                            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14532d] text-[#4ade80] border border-[#14532d] text-xs font-bold shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span> Live
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-end gap-6 border-t border-white/5 pt-3">
                          <div className="flex-1">
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">BOOKED</span>
                            </div>
                            <div className="flex items-end gap-2">
                              <span className="text-white font-bold text-sm">85 <span className="text-white/40 font-normal">/ 100</span></span>
                              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden relative top-[-4px]">
                                <div className="h-full bg-[#ccff00] w-[85%] shadow-[0_0_10px_#ccff00]"></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">REVENUE</div>
                            <div className="text-white font-bold text-sm">₱127.5k</div>
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="glass-panel p-4 rounded-3xl hover:bg-white/5 transition-all group border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#eab308] shadow-[0_0_15px_#eab308] rounded-l-3xl"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab308]/10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="flex flex-col sm:flex-row gap-5 pl-2">
                      <div className="relative w-full sm:w-40 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0">
                        <Image alt="Event" fill className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase border border-white/10">Workshop</div>
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-warning transition-colors">Bean & Leaf Pop-up Cafe</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Oct 15, 10AM</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> QC</span>
                              </div>
                            </div>
                            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#422006] text-[#facc15] border border-[#422006] text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span> Draft
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center border-t border-white/5 pt-3">
                          <div className="flex items-center gap-2 text-[#facc15] text-xs font-medium">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            Missing venue confirmation
                          </div>
                          <div className="flex justify-end items-end gap-2">
                            <button className="px-4 py-1.5 rounded-full bg-[#422006] text-[#facc15] hover:bg-[#eab308] hover:text-black text-xs font-bold transition-all border border-[#facc15]/20">
                              Continue Editing
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <div className="glass-card rounded-[2rem] p-8 border border-white/5">
                  <div className="flex flex-wrap justify-between items-start mb-8">
                    <div>
                      <h2 className="text-xl font-display font-bold text-white mb-1">Audience Growth</h2>
                      <p className="text-sm text-text-muted">Ticket sales over the last 7 days</p>
                    </div>
                    <select className="bg-black/30 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:ring-accent focus:border-accent">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Year to Date</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-between h-48 gap-2 sm:gap-4 w-full">
                    <div className="w-full bg-white/5 rounded-t-lg relative group h-[40%] hover:bg-accent/20 transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">40</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-text-muted">Mon</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg relative group h-[65%] hover:bg-accent/20 transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">65</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-text-muted">Tue</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg relative group h-[30%] hover:bg-accent/20 transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">30</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-text-muted">Wed</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg relative group h-[85%] hover:bg-accent/20 transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">85</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-text-muted">Thu</div>
                    </div>
                    <div className="w-full bg-gradient-to-t from-accent/50 to-accent rounded-t-lg relative group h-[95%] shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-black font-bold text-xs py-1 px-2 rounded opacity-100">95</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-accent font-bold">Fri</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg relative group h-[75%] hover:bg-accent/20 transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">75</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-text-muted">Sat</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg relative group h-[50%] hover:bg-accent/20 transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">50</div>
                      <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-text-muted">Sun</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-white">Your Profile</h3>
                  <span className="text-xs font-bold bg-primary/20 text-primary-glow px-2 py-1 rounded">85% Complete</span>
                </div>
                
                <div className="relative z-10 space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                    <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                      <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">Portfolio</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                    <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                      <span className="material-symbols-outlined text-[16px]">settings</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                    <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                      <span className="material-symbols-outlined text-[16px]">support_agent</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">Foxer Support</span>
                  </button>
                </div>
              </div>
              
              <div className="glass-panel rounded-[2rem] p-6 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-bold text-white">Upcoming Bookings</h3>
                  <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Image alt="User" width={40} height={40} className="h-10 w-10 rounded-full border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU" />
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-bold text-white truncate">Sarah Jenkins</p>
                        <span className="text-[10px] text-text-muted">2m ago</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">Booked <span className="text-accent">Neon Nights</span> (2 tix)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Image alt="User" width={40} height={40} className="h-10 w-10 rounded-full border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA" />
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-bold text-white truncate">Marcus Low</p>
                        <span className="text-[10px] text-text-muted">15m ago</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">Booked <span className="text-accent">Neon Nights</span> (VIP)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">JD</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-bold text-white truncate">John Doe</p>
                        <span className="text-[10px] text-text-muted">1h ago</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">Booked <span className="text-accent">Neon Nights</span> (1 tix)</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest">
                  View All Activity
                </button>
              </div>
              <div className="bg-surface rounded-[2rem] p-6 border border-white/5">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[20px]">event</span>
                  October
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  <span className="text-text-muted">M</span>
                  <span className="text-text-muted">T</span>
                  <span className="text-text-muted">W</span>
                  <span className="text-text-muted">T</span>
                  <span className="text-text-muted">F</span>
                  <span className="text-text-muted">S</span>
                  <span className="text-text-muted">S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                  <span className="text-white/20 py-2">29</span>
                  <span className="text-white/20 py-2">30</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">1</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">2</span>
                  <span className="bg-accent text-black font-bold py-2 rounded-lg cursor-pointer shadow-[0_0_10px_#ccff00]">3</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">4</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">5</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">6</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">7</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer relative">8 <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"></span></span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">9</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">10</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">11</span>
                  <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
