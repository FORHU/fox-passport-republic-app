'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import { confirmBookingPayment } from '@/lib/api/bookings';

export default function CheckoutSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { venueName, venueImage, venueLocation, guestCount, totalAmount, checkInDate, checkInTime, draftBookingId } = useCheckoutStore();
  const { user } = useAuthStore();
  const confirmed = useRef(false);

  // Confirm payment on the backend once, using the Stripe payment_intent from the redirect URL
  useEffect(() => {
    if (confirmed.current) return;
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    if (paymentIntentId && redirectStatus === 'succeeded' && draftBookingId && totalAmount > 0) {
      confirmed.current = true;
      confirmBookingPayment(draftBookingId, paymentIntentId, totalAmount).catch(() => {});
    }
  }, []);

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
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden">
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

      <main className="grow pt-32 pb-20 relative flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
        
        <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-accent text-black font-bold shadow-[0_0_50px_rgba(204,255,0,0.4)] mb-6">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">Booking Confirmed!</h1>
            <p className="text-lg text-text-muted max-w-lg mx-auto">
              You're all set for <span className="text-accent font-bold">{venueName || 'Neon Nights'}</span>. We've sent the receipt and digital ticket to your email.
            </p>
          </div>

          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="h-40 w-40 md:h-48 md:w-48 rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                {venueImage ? (
                  <img alt="Event" className="h-full w-full object-cover" src={venueImage} />
                ) : (
                  <div className="h-full w-full bg-surface-highlight/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-[64px]">celebration</span>
                  </div>
                )}
              </div>
              <div className="grow flex flex-col justify-center">
                <div className="text-accent font-bold text-xs mb-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                  Confirmed • Order #FP-{Math.floor(10000 + Math.random() * 90000)}
                </div>
                <h3 className="font-display font-bold text-white text-3xl leading-tight mb-4">
                  {venueName || 'Neon Nights: Retro Wave Party'}
                </h3>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Date</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">event</span>
                      {checkInDate
                        ? new Date(checkInDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'TBD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Time</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">schedule</span>
                      {checkInTime || '09:00 PM'}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Guests</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">group</span>
                      {guestCount} Guests
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">location_on</span>
                      {venueLocation || 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-white/20 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-text-muted text-sm">Amount Paid</p>
                <span className="text-3xl font-display font-bold text-white">₱{totalAmount.toLocaleString()}.00</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link href="/booking" className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all text-center">
                  View Receipt
                </Link>
                <Link href="/" className="flex-1 sm:flex-none btn-neon rounded-xl bg-accent px-6 py-3 text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 text-center flex items-center justify-center gap-2">
                  Return Home
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black pt-10 pb-10 border-t border-white/10">
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
