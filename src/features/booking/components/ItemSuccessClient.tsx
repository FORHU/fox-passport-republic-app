'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useItemBookingStore } from '@/features/booking/store/useItemBookingStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { confirmServiceBooking, confirmAssetBooking } from '@/features/booking/api/bookings';

export default function ItemSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    itemType,
    itemName,
    itemImage,
    providerName,
    totalAmount,
    scheduledDate,
    location,
    bookingId,
    reset,
  } = useItemBookingStore();
  const { user } = useAuthStore();
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    if (paymentIntentId && redirectStatus === 'succeeded' && bookingId && totalAmount > 0) {
      confirmed.current = true;
      const confirm = itemType === 'service' ? confirmServiceBooking : confirmAssetBooking;
      confirm(bookingId, paymentIntentId, totalAmount).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin': case 'super_admin': return '/admin';
      case 'host': case 'mayor': case 'foxer': return '/creator-dashboard';
      default: return '/user';
    }
  };

  const isService = itemType === 'service';
  const typeLabel = isService ? 'Service' : 'Equipment Rental';
  const typeIcon = isService ? 'build' : 'inventory_2';
  const typeColor = isService ? 'text-orange-400' : 'text-purple-400';
  const typeBadgeBg = isService ? 'bg-orange-400' : 'bg-purple-400';

  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'To be confirmed';

  const orderRef = useMemo(() => `FX-${Math.floor(10000 + Math.random() * 90000)}`, []);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden">

      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link href="/" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">Explore</Link>
              <Link href="/booking" className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 transition-all">Bookings</Link>
            </nav>
            <div
              className="h-10 w-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-accent transition-colors"
              onClick={() => router.push(getDashboardPath())}
            >
              {user?.imgId ? (
                <img alt="User" className="h-full w-full object-cover" src={user.imgId} />
              ) : (
                <div className="h-full w-full bg-[#ccff00] flex items-center justify-center text-black font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20 relative flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow mix-blend-screen" />

        <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-accent text-black font-bold shadow-[0_0_50px_rgba(204,255,0,0.4)] mb-6">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
              {isService ? 'Service Booked!' : 'Equipment Reserved!'}
            </h1>
            <p className="text-lg text-text-muted max-w-lg mx-auto">
              Your request for <span className="text-accent font-bold">{itemName || typeLabel}</span> is confirmed.
              {isService
                ? ' The provider will review and confirm availability shortly.'
                : ' The owner will confirm availability and coordinate logistics with you.'}
            </p>
          </div>

          {/* Booking Card */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="h-40 w-40 md:h-48 md:w-48 rounded-3xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                {itemImage ? (
                  <img alt={itemName} className="h-full w-full object-cover" src={itemImage} />
                ) : (
                  <div className="h-full w-full bg-surface-highlight/50 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[64px] ${typeColor} opacity-30`}>{typeIcon}</span>
                  </div>
                )}
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <div className={`font-bold text-xs mb-2 uppercase tracking-widest flex items-center gap-2 ${typeColor}`}>
                  <span className={`h-2 w-2 rounded-full animate-pulse inline-block ${typeBadgeBg}`} />
                  Confirmed · Order #{orderRef}
                </div>
                <h3 className="font-display font-bold text-white text-3xl leading-tight mb-4">{itemName}</h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                      {isService ? 'Scheduled Date' : 'Start Date'}
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">event</span>
                      {formattedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Provider</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">person</span>
                      {providerName || 'TBD'}
                    </p>
                  </div>
                  {location && (
                    <div className="col-span-2">
                      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                        {isService ? 'Event Location' : 'Delivery / Pickup'}
                      </p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-accent">location_on</span>
                        {location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What's next */}
            <div className="border-t border-white/10 pt-6 mb-8">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">What Happens Next</h4>
              <div className="space-y-3">
                {isService ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 text-accent text-xs font-bold mt-0.5">1</div>
                      <p className="text-sm text-text-muted">The provider reviews your project brief and confirms availability.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40 text-xs font-bold mt-0.5">2</div>
                      <p className="text-sm text-text-muted">Your payment is held in escrow — the provider cannot access it yet.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40 text-xs font-bold mt-0.5">3</div>
                      <p className="text-sm text-text-muted">On the event day, confirm their arrival to release payment.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 text-accent text-xs font-bold mt-0.5">1</div>
                      <p className="text-sm text-text-muted">The owner verifies the equipment is available for your dates.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40 text-xs font-bold mt-0.5">2</div>
                      <p className="text-sm text-text-muted">Delivery or pickup coordinates are shared after confirmation.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/40 text-xs font-bold mt-0.5">3</div>
                      <p className="text-sm text-text-muted">Confirm receipt in good condition to release payment from escrow.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-dashed border-white/20 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-text-muted text-sm">Amount Paid</p>
                  <span className="text-3xl font-display font-bold text-white">₱{totalAmount.toLocaleString()}.00</span>
                </div>
                {bookingId && (
                  <button
                    onClick={() => router.push(`/booking/fulfillment/${itemType}/${bookingId}`)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-accent/30 text-accent font-bold text-sm hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    View Fulfillment Pass
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { reset(); router.push(getDashboardPath()); }}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all text-center"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => { reset(); router.push('/categories'); }}
                  className="flex-1 btn-neon rounded-xl bg-accent px-6 py-3 text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  Browse More
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
