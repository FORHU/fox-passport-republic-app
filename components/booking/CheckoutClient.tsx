'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CheckoutClient() {
  const router = useRouter();
  const { venueName, venueImage, guestCount, totalAmount, checkInDate, checkInTime } = useCheckoutStore();
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

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleConfirmPay = () => {
    router.push('/checkout/success');
  };

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden">

      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
            </div>
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

      <main className="flex-grow pt-32 pb-20 relative">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-10 reveal-on-scroll">
            <div className="flex items-center gap-2 text-text-muted text-sm mb-4 font-display">
              <Link href="/" className="hover:text-white cursor-pointer transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <Link href="/booking" className="hover:text-white cursor-pointer transition-colors">Events</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-bold">Checkout</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Confirm & Pay</h1>
              </div>
              <div className="flex items-center gap-4 bg-surface-highlight/30 px-6 py-3 rounded-full border border-white/5">
                <Link href="/booking/config" className="flex items-center gap-2 group cursor-pointer">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white text-xs font-bold group-hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                  <span className="text-sm font-medium text-text-muted group-hover:text-white transition-colors">Config</span>
                </Link>
                <div className="w-8 h-px bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-black text-xs font-bold shadow-[0_0_10px_#ccff00]">2</span>
                  <span className="text-sm font-bold text-white">Pay</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 space-y-8 reveal-on-scroll">
              <div className="glass-panel rounded-[2rem] p-8">
                <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span>
                  Payment Method
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <label className="cursor-pointer group relative">
                    <input defaultChecked className="peer sr-only" name="payment" type="radio" />
                    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/10 hover:border-white/30 peer-checked:border-accent peer-checked:bg-accent/10">
                      <span className="material-symbols-outlined text-3xl text-text-muted peer-checked:text-accent group-hover:text-white transition-colors">credit_card</span>
                      <span className="font-display font-bold text-white text-sm">Card</span>
                    </div>
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent opacity-0 peer-checked:opacity-100 shadow-[0_0_10px_#ccff00] transition-opacity"></div>
                  </label>
                  <label className="cursor-pointer group relative">
                    <input className="peer sr-only" name="payment" type="radio" />
                    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/10 hover:border-white/30 peer-checked:border-accent peer-checked:bg-accent/10">
                      <span className="material-symbols-outlined text-3xl text-text-muted peer-checked:text-accent group-hover:text-white transition-colors">account_balance_wallet</span>
                      <span className="font-display font-bold text-white text-sm">E-Wallet</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group relative">
                    <input className="peer sr-only" name="payment" type="radio" />
                    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/10 hover:border-white/30 peer-checked:border-accent peer-checked:bg-accent/10">
                      <span className="material-symbols-outlined text-3xl text-text-muted peer-checked:text-accent group-hover:text-white transition-colors">account_balance</span>
                      <span className="font-display font-bold text-white text-sm">Bank</span>
                    </div>
                  </label>
                </div>
                <form className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Card Number</label>
                    <div className="relative group">
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display tracking-widest text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10" placeholder="0000 0000 0000 0000" type="text" />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2 opacity-50 grayscale group-focus-within:grayscale-0 group-focus-within:opacity-100 transition-all">
                        <img alt="Visa" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGL5EFzgWlC9w2ddTxB-D0EpajAZG3EleZsCSA7fzX1eywseNbmPgZCj-t6e4cHeeMq9IjorJm36P9E-n6emAcfNkmmayjKP_lWUK1QRzFwx0ot-40TmCOegmy0ACJU7tIsrGpMpJp2rRpalltdux4n0hH9BGkqctdp7y872QF1DunXEpfDKx9R8cfIq8ovEaqNj0MW_eYYaKCi8i_Grbj_9cUH7CvZmroi7lJglYWXzEBvOlebht3q5HOukFRQCroFSWbqHm6IXw" />
                        <img alt="Mastercard" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV7TJTzDbTE3px4AshvzjaZ8zjJB1bw6Lqum8RbsCh_mVQrYZ7bmLSsPV2op6D1kavYhoxhWbK4AGbQrOQmwEm0b_Do20sdcPBEeVf2cvyLz_baU0bsZ3mgXBBZeJqEfqbCzwK7poK4RVOedYrBTfRreymSYc5tpzQTVSBIK-VPg1-_65w1lpnPhk6z6jGHva9kNdTKtuyk-6mm2yliUCBVTpmwaTmzH4UuHJngknzNNWcO2ahFiqU88NRSkzNkCPc9jx6aPtj5Xg" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Expiry Date</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display tracking-widest text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10" placeholder="MM / YY" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1 flex items-center gap-1">
                        CVC 
                        <span className="material-symbols-outlined text-[14px] cursor-help" title="3 digits on back of card">help</span>
                      </label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display tracking-widest text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10" placeholder="123" type="password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Cardholder Name</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10" placeholder="JUAN DELA CRUZ" type="text" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative flex items-center">
                      <input className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:bg-accent checked:border-accent transition-all" id="save-card" type="checkbox" />
                      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 material-symbols-outlined text-[16px] font-bold">check</span>
                    </div>
                    <label className="cursor-pointer select-none text-sm text-text-muted hover:text-white transition-colors" htmlFor="save-card">Save card securely for future bookings</label>
                  </div>
                </form>
              </div>
              <div className="glass-panel rounded-[2rem] p-8">
                <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white text-sm">2</span>
                  Contact Info
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Email</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10" placeholder="hello@foxer.com" type="email" defaultValue="foxxer@gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Mobile Number</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10" placeholder="+63 900 000 0000" type="tel" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="sticky top-32 space-y-6">
                <div className="glass-card rounded-[2.5rem] p-6 border border-accent/20 shadow-glow-accent relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-[50px] pointer-events-none"></div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img 
                        alt="Event" 
                        className="h-full w-full object-cover" 
                        src={venueImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"} 
                      />
                    </div>
                    <div>
                      <div className="text-accent font-bold text-xs mb-1 uppercase tracking-wider">
                        {checkInDate ? `Sep ${checkInDate}` : 'Tomorrow'} • {checkInTime || '9PM'}
                      </div>
                      <h3 className="font-display font-bold text-white text-lg leading-tight mb-1">
                        {venueName || 'Neon Nights: Retro Wave Party'}
                      </h3>
                      <p className="text-text-muted text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> Makati City
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Tickets <span className="text-white/50">x{guestCount}</span></span>
                      <span className="text-white font-medium">₱{(1500 * guestCount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Service Fee</span>
                      <span className="text-white font-medium">₱150.00</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-white/20 pt-4 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-white font-bold font-display">Total</span>
                      <span className="text-3xl font-display font-bold text-accent text-shadow-glow">₱{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleConfirmPay}
                    className="w-full btn-neon group relative rounded-2xl bg-accent py-4 px-6 text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2 group-hover:tracking-wider transition-all duration-300">
                      Confirm & Pay
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                    <span className="material-symbols-outlined text-[14px] text-green-500">lock</span>
                    Encrypted & Secure Checkout
                  </div>
                </div>
                <div className="bg-surface-highlight/30 rounded-3xl p-6 border border-white/5 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-primary-glow">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display text-sm mb-1">FoxPassport Guarantee</h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Your booking is protected. If the vibe isn't as described, we've got your back with a full refund within 24 hours of the event.
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
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
