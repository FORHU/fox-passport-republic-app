'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { createPaymentIntent, confirmBookingPayment } from '@/features/booking/api/bookings';
import { ProgressIndicator } from '@/shared/components/ui/ProgressIndicator';
import StripePaymentForm from './StripePaymentForm';
import api from '@/shared/lib/axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function VenueCheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const totalParam = searchParams.get('total');
  const totalAmount = totalParam ? Number(totalParam) : 0;
  const { user } = useAuthStore();
  const confirmed = useRef(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const formRef = useRef<{ submit: () => Promise<void> }>(null);

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin': case 'super_admin': return '/admin';
      case 'host': case 'mayor': case 'foxer': return '/creator-dashboard';
      default: return '/user';
    }
  };

  const dashboardPath = getDashboardPath();
  const orderNumber = useMemo(() => Math.floor(10000 + Math.random() * 90000), []);

  const onPaymentSuccess = async (piId: string) => {
    setPaymentIntentId(piId);
    setPaymentSuccess(true);
    toast.success('Payment successful! Your venue is booked.');

    try {
      if (bookingId && totalAmount > 0) {
        await confirmBookingPayment(bookingId, piId, totalAmount);
      }
    } catch {
      // Booking was already confirmed via webhook — safe to ignore
    }

    // Save contact info to user's profile
    try {
      await api.put('/profile', { phone: mobileNumber || undefined });
    } catch {
      // Non-critical — profile update failure shouldn't block success
    }
  };

  // Handle return from 3D Secure redirect
  useEffect(() => {
    if (confirmed.current) return;
    const pi = searchParams.get('payment_intent');
    const status = searchParams.get('redirect_status');
    if (pi && status === 'succeeded' && bookingId && totalAmount > 0) {
      confirmed.current = true;
      setPaymentIntentId(pi);
      setPaymentSuccess(true);
      toast.success('Payment successful! Your venue is booked.');
      confirmBookingPayment(bookingId, pi, totalAmount).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!bookingId || clientSecret) return;

    setLoadingIntent(true);
    setIntentError(null);

    createPaymentIntent({
      amount: totalAmount,
      currency: 'php',
      bookingId,
      description: 'Venue Direct Booking',
    })
      .then(({ clientSecret: secret }) => setClientSecret(secret))
      .catch((err) => setIntentError(err?.response?.data?.message || 'Could not initialize payment. Please try again.'))
      .finally(() => setLoadingIntent(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const returnUrl = bookingId
    ? `${window.location.origin}/booking/venue/checkout?bookingId=${bookingId}&total=${totalAmount}`
    : `${window.location.origin}/checkout/success`;

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'night' as const,
          variables: {
            colorPrimary: '#ccff00',
            colorBackground: '#0d0f1a',
            colorText: '#ffffff',
          },
        },
      }
    : null;

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Missing Booking</h2>
          <p className="text-text-muted mb-6">No booking information found. Please start from the venue page.</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors">
            Browse Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden grow">

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
                  <div className="h-full w-full bg-[#ccff00] flex items-center justify-center">
                    <span className="text-black text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-20 relative">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-10 reveal-on-scroll">
            <div className="flex items-center gap-2 text-text-muted text-sm mb-4 font-display">
              <Link href="/" className="hover:text-white cursor-pointer transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <Link href="/booking" className="hover:text-white cursor-pointer transition-colors">Bookings</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-bold">Checkout</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Confirm & Pay</h1>
                <p className="text-text-muted mt-2">Complete your secure payment to confirm the venue booking.</p>
              </div>
              <ProgressIndicator
                steps={[
                  { number: 1, label: 'Config', isCheck: true },
                  { number: 2, label: 'Pay', isCheck: paymentSuccess },
                ]}
                currentStep={2}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8 reveal-on-scroll">
              {clientSecret && elementsOptions ? (
                <Elements stripe={stripePromise} options={elementsOptions}>
                  {/* Payment Panel */}
                  <div className="glass-panel rounded-[2rem] p-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span>
                      Payment
                    </h2>

                    {paymentSuccess ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-accent text-black font-bold shadow-[0_0_40px_rgba(204,255,0,0.3)] mb-6">
                          <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Payment Confirmed!</h3>
                        <p className="text-text-muted text-sm">Your venue booking is all set. We&apos;ve sent the receipt to your email.</p>
                      </div>
                    ) : loadingIntent ? (
                      <div className="flex items-center gap-3 py-8 justify-center text-white/50">
                        <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                        Initializing secure payment…
                      </div>
                    ) : (
                      <StripePaymentForm
                        ref={formRef}
                        totalAmount={totalAmount}
                        returnUrl={returnUrl}
                        onSuccess={onPaymentSuccess}
                        hideButton
                      />
                    )}

                    {intentError && (
                      <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4">
                        <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 shrink-0">error</span>
                        <div>
                          <p className="text-red-400 text-sm font-medium">{intentError}</p>
                          <button
                            onClick={() => {
                              setIntentError(null);
                              setLoadingIntent(true);
                              createPaymentIntent({
                                amount: totalAmount,
                                currency: 'php',
                                bookingId: bookingId!,
                                description: 'Venue Direct Booking',
                              })
                                .then(({ clientSecret: secret }) => setClientSecret(secret))
                                .catch(err => setIntentError(err?.response?.data?.message || 'Could not initialize payment.'))
                                .finally(() => setLoadingIntent(false));
                            }}
                            className="mt-2 text-xs text-white/60 hover:text-white underline"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Info Panel */}
                  <div className="glass-panel rounded-[2rem] p-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white text-sm">2</span>
                      Contact Info
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Email</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10"
                          placeholder="hello@foxer.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Mobile Number</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all hover:bg-white/10"
                          placeholder="+63 900 000 0000"
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Confirm & Pay Button */}
                  {!paymentSuccess && email && mobileNumber && !loadingIntent && !intentError && (
                    <button
                      type="button"
                      onClick={() => formRef.current?.submit()}
                      className="w-full rounded-2xl bg-[#ccff00] py-4 px-6 text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Confirm & Pay ₱{totalAmount.toLocaleString()}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                    <span className="material-symbols-outlined text-[14px] text-green-500">lock</span>
                    Encrypted & Secure · Powered by Stripe
                  </div>

                  {paymentSuccess && (
                    <div className="flex gap-3 justify-center pt-4">
                      <Link href="/booking" className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all">
                        View Bookings
                      </Link>
                      <Link href="/" className="px-8 py-4 rounded-xl bg-accent text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center gap-2">
                        Return Home
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  )}
                </Elements>
              ) : (
                <>
                  {/* Loading / no clientSecret yet — render panels without Elements */}
                  <div className="glass-panel rounded-[2rem] p-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span>
                      Payment
                    </h2>
                    {loadingIntent ? (
                      <div className="flex items-center gap-3 py-8 justify-center text-white/50">
                        <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                        Initializing secure payment…
                      </div>
                    ) : (
                      <div className="py-8 text-center text-white/40">
                        <p>No payment information available.</p>
                        <Link href={`/booking/venue/${bookingId || ''}`} className="mt-2 inline-block text-sm text-accent hover:underline">
                          Go back to configure your booking
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="glass-panel rounded-[2rem] p-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white text-sm">2</span>
                      Contact Info
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Email</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" placeholder="hello@foxer.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Mobile Number</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-display text-lg text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" placeholder="+63 900 000 0000" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="sticky top-32 space-y-6">
                <div className="glass-card rounded-[2.5rem] p-6 border border-accent/20 shadow-glow-accent relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-[50px] pointer-events-none"></div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                      <div className="h-full w-full bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/30 text-3xl">apartment</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-accent font-bold text-xs mb-1 uppercase tracking-wider">
                        Venue Booking
                      </div>
                      <h3 className="font-display font-bold text-white text-lg leading-tight mb-1">
                        Direct Venue Booking
                      </h3>
                      <p className="text-text-muted text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">receipt</span>
                        Booking ID: {bookingId.slice(0, 8)}…
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Booking Reference</span>
                      <span className="text-white font-medium">#{bookingId.slice(0, 12)}</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-white/20 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-white font-bold font-display">Total</span>
                      <span className="text-3xl font-display font-bold text-accent text-shadow-glow">
                        {totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : 'Processing…'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-highlight/30 rounded-3xl p-6 border border-white/5 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-primary-glow">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display text-sm mb-1">FoxPassport Guarantee</h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Your booking is protected. If the vibe isn&apos;t as described, we&apos;ve got your back with a full refund within 24 hours of the event.
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
