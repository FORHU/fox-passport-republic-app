'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function BookingConfigurationClient() {
  const router = useRouter();
  const { venueName, venueImage, guestCount, checkInDate, setConfig } = useCheckoutStore();
  const { user } = useAuthStore();

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
      case "super_admin":
        return "/admin";
      case "host":
      case "mayor":
      case "foxer":
        return "/host";
      default:
        return "/user";
    }
  };

  const dashboardPath = getDashboardPath();
  
  const [selectedTime, setSelectedTime] = useState('09:00 PM');
  const [guests, setGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState(9);

  // Sync with store on mount
  React.useEffect(() => {
    if (guestCount) setGuests(guestCount);
    if (checkInDate) setSelectedDate(checkInDate);
  }, [guestCount, checkInDate]);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
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
                <img alt="User" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/" className="hover:text-white transition-colors">Explore</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="hover:text-white transition-colors">Nightlife</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-semibold">Neon Nights: Retro Wave</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">Secure Your Spot</h1>
                <p className="text-text-muted">Customize your experience and get ready for the core memory.</p>
              </div>
              <div className="flex items-center gap-4 bg-surface-highlight/30 px-6 py-3 rounded-full border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-black text-xs font-bold">1</span>
                  <span className="text-sm font-bold text-white">Config</span>
                </div>
                <div className="w-8 h-px bg-white/10"></div>
                <div className="flex items-center gap-2 opacity-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white text-xs font-bold">2</span>
                  <span className="text-sm font-medium text-text-muted">Pay</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            <div className="lg:col-span-8 space-y-8">
              {/* Calendar Section */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">calendar_month</span>
                  <h3 className="text-xl font-display font-bold text-white">Select Date & Time</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-bold">September 2024</span>
                      <div className="flex gap-1">
                        <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      <span className="text-xs text-text-muted font-medium py-2">S</span>
                      <span className="text-xs text-text-muted font-medium py-2">M</span>
                      <span className="text-xs text-text-muted font-medium py-2">T</span>
                      <span className="text-xs text-text-muted font-medium py-2">W</span>
                      <span className="text-xs text-text-muted font-medium py-2">T</span>
                      <span className="text-xs text-text-muted font-medium py-2">F</span>
                      <span className="text-xs text-text-muted font-medium py-2">S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-sm">
                      <span></span><span></span>
                      {[1, 2, 3].map(d => (
                        <button key={d} disabled className="calendar-day disabled h-10 rounded-xl flex items-center justify-center transition-all opacity-50">{d}</button>
                      ))}
                      {[4, 5, 6, 7, 8].map(d => (
                        <button key={d} onClick={() => setSelectedDate(d)} className={`calendar-day h-10 rounded-xl flex items-center justify-center transition-all ${selectedDate === d ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]' : 'hover:bg-white/10 text-white'}`}>{d}</button>
                      ))}
                      <button onClick={() => setSelectedDate(9)} className={`calendar-day h-10 rounded-xl flex items-center justify-center transition-all relative ${selectedDate === 9 ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]' : 'hover:bg-white/10 text-white'}`}>
                        9
                        <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full border border-black ${selectedDate === 9 ? 'bg-white' : 'bg-secondary'}`}></span>
                      </button>
                      {[10, 11, 12, 13, 14].map(d => (
                        <button key={d} onClick={() => setSelectedDate(d)} className={`calendar-day h-10 rounded-xl flex items-center justify-center transition-all ${selectedDate === d ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]' : 'hover:bg-white/10 text-white'}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                    <span className="text-sm text-text-muted block mb-4">Available Slots for <span className="text-white font-bold">Sep {selectedDate}</span></span>
                    <div className="grid grid-cols-2 gap-3">
                      {['07:00 PM', '09:00 PM', '11:00 PM'].map((time) => (
                        <label key={time} className="cursor-pointer group">
                          <input 
                            type="radio" 
                            name="time" 
                            className="hidden custom-radio" 
                            checked={selectedTime === time}
                            onChange={() => setSelectedTime(time)}
                          />
                          <div className={`border rounded-xl p-3 transition-all flex flex-col items-center justify-center group-hover:bg-white/5 relative ${selectedTime === time ? 'border-accent bg-accent/5' : 'border-white/10'}`}>
                            {selectedTime === time && (
                              <div className="absolute top-2 right-2 check-icon transition-all duration-300">
                                <span className="material-symbols-outlined text-accent text-[16px]">check_circle</span>
                              </div>
                            )}
                            <span className="text-white font-bold text-lg">{time}</span>
                            <span className={`text-xs ${time === '09:00 PM' ? 'text-accent' : 'text-text-muted'}`}>{time === '09:00 PM' ? 'Best Vibes' : 'Available'}</span>
                          </div>
                        </label>
                      ))}
                      <div className="border border-white/5 bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center opacity-50 cursor-not-allowed">
                        <span className="text-text-muted font-bold text-lg line-through">01:00 AM</span>
                        <span className="text-xs text-secondary">Sold Out</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guests Section */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">group</span>
                  <h3 className="text-xl font-display font-bold text-white">Who's Coming?</h3>
                </div>
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-surface-highlight flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">Total Guests</p>
                      <p className="text-sm text-text-muted">₱1,500 per person</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface rounded-full p-1 border border-white/10">
                    <button 
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="h-10 w-10 rounded-full bg-surface-highlight text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="text-xl font-bold font-display w-8 text-center text-white">{guests}</span>
                    <button 
                      onClick={() => setGuests(guests + 1)}
                      className="h-10 w-10 rounded-full bg-white text-black hover:bg-accent flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">diamond</span>
                  <h3 className="text-xl font-display font-bold text-white">Level Up Your Experience</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="relative cursor-pointer group">
                    <input className="peer sr-only" type="checkbox" />
                    <div className="p-5 rounded-2xl bg-surface-highlight/30 border border-white/5 hover:border-white/20 peer-checked:border-accent peer-checked:bg-accent/5 transition-all h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                          <span className="material-symbols-outlined">photo_camera</span>
                        </div>
                        <div className="h-6 w-6 rounded-full border border-white/20 peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-black text-[14px] opacity-0 peer-checked:opacity-100">check</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white mb-1">Professional Photos</h4>
                      <p className="text-xs text-text-muted mb-3">Get 10 edited hi-res shots of your night.</p>
                      <span className="text-accent font-bold text-sm">+ ₱500</span>
                    </div>
                  </label>
                  <label className="relative cursor-pointer group">
                    <input defaultChecked className="peer sr-only" type="checkbox" />
                    <div className="p-5 rounded-2xl bg-surface-highlight/30 border border-white/5 hover:border-white/20 peer-checked:border-accent peer-checked:bg-accent/5 transition-all h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                          <span className="material-symbols-outlined">liquor</span>
                        </div>
                        <div className="h-6 w-6 rounded-full border border-white/20 peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-black text-[14px] opacity-0 peer-checked:opacity-100">check</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white mb-1">VIP Drink Package</h4>
                      <p className="text-xs text-text-muted mb-3">Skip the line + 2 premium cocktails included.</p>
                      <span className="text-accent font-bold text-sm">+ ₱1,200</span>
                    </div>
                  </label>
                  <label className="relative cursor-pointer group">
                    <input className="peer sr-only" type="checkbox" />
                    <div className="p-5 rounded-2xl bg-surface-highlight/30 border border-white/5 hover:border-white/20 peer-checked:border-accent peer-checked:bg-accent/5 transition-all h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                          <span className="material-symbols-outlined">local_taxi</span>
                        </div>
                        <div className="h-6 w-6 rounded-full border border-white/20 peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-black text-[14px] opacity-0 peer-checked:opacity-100">check</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white mb-1">Priority Ride Home</h4>
                      <p className="text-xs text-text-muted mb-3">Pre-booked secure ride within Metro Manila.</p>
                      <span className="text-accent font-bold text-sm">+ ₱350</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Special Requests */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">edit_note</span>
                  <h3 className="text-xl font-display font-bold text-white">Special Requests</h3>
                </div>
                <textarea className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none h-32 outline-none" placeholder="Celebrating a birthday? Allergies? Let the host know..."></textarea>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-32 space-y-6">
                <div className="glass-card rounded-[2rem] overflow-hidden border border-white/10 shadow-glow">
                  <div className="relative h-48">
                    <img 
                      alt="Event" 
                      className="w-full h-full object-cover" 
                      src={venueImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Nightlife</span>
                        <div className="flex text-yellow-400 text-[10px]">
                          <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                          <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                          <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                          <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                          <span className="material-symbols-outlined text-[12px] fill-current">star_half</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white leading-tight">{venueName || 'Neon Nights: Retro Wave Party'}</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Sep {selectedDate}, 2024</p>
                        <p className="text-xs text-text-muted">Monday</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedTime}</p>
                        <p className="text-xs text-text-muted">6 hours duration</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Club Z, Makati City</p>
                        <a className="text-xs text-accent hover:underline" href="#">View Map</a>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-highlight/30 p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Tickets (x{guests})</span>
                      <span className="text-white">₱{(1500 * guests).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">VIP Drink Package</span>
                      <span className="text-white">₱1,200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Service Fee</span>
                      <span className="text-white">₱150</span>
                    </div>
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">Total</span>
                      <span className="text-2xl font-display font-bold text-accent">₱{(1500 * guests + 1200 + 150).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <button 
                      onClick={() => {
                        setConfig({
                          venueId: 'mock-venue-id',
                          venueName: venueName || 'Neon Nights: Retro Wave Party',
                          venueImage: venueImage,
                          checkInDate: selectedDate,
                          checkInTime: selectedTime,
                          nights: 1, // Mock value
                          totalAmount: 1500 * guests + 1200 + 150,
                          guestCount: guests
                        });
                        router.push('/checkout');
                      }}
                      className="w-full btn-neon group relative overflow-hidden rounded-xl bg-accent py-4 text-black font-bold text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-transform active:scale-95"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Proceed to Payment
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </span>
                    </button>
                    <p className="text-center text-[10px] text-text-muted mt-3">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-1">lock</span>
                      Secure encrypted checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-black pt-20 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">explore</span>
              <span className="text-xl font-display font-bold text-white">FoxPassport</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">© 2024 FoxPassport Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Privacy</a>
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
