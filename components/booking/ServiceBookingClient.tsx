'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchServiceById } from '@/lib/api/services';
import { bookService, fetchServiceAvailability } from '@/lib/api/bookings';
import { useItemBookingStore } from '@/store/useItemBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { BackendService } from '@/lib/api/types';
import AvailabilityCalendar from './AvailabilityCalendar';

const SERVICE_FEE = 150;

export default function ServiceBookingClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setBookingDetails, setBookingId } = useItemBookingStore();

  const [service, setService] = useState<BackendService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ dates?: string; location?: string }>({});

  // Form state
  const [bookingDates, setBookingDates] = useState<string[]>([]);
  const [callTime, setCallTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(3);
  const [guestCount, setGuestCount] = useState(50);
  const [eventLocation, setEventLocation] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  useEffect(() => {
    fetchServiceById(serviceId)
      .then(setService)
      .catch(() => toast.error('Could not load service details.'))
      .finally(() => setIsLoading(false));
    fetchServiceAvailability(serviceId)
      .then(d => setBookedDates(d.bookedDates))
      .catch(() => {});
  }, [serviceId]);

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin': case 'super_admin': return '/admin';
      case 'host': case 'mayor': case 'foxer': return '/creator-dashboard';
      default: return '/user';
    }
  };

  const unitPrice = Number(service?.price ?? 0);
  const isPerSession = service?.billingRate === 'per_session' || service?.billingRate === 'per_event';
  const sessionCount = Math.max(1, bookingDates.length);
  const subtotal = (isPerSession ? unitPrice : unitPrice * durationHours) * sessionCount;
  const total = subtotal + SERVICE_FEE;

  const rateLabel = isPerSession
    ? `₱${unitPrice.toLocaleString()} / session`
    : `₱${unitPrice.toLocaleString()} / hr`;

  const durationLabel = isPerSession ? 'Sessions' : 'Hours';

  const imageUrl = service?.images?.[0]?.url ?? service?.images?.[0]?.imageUrl ?? null;

  const handleProceed = async () => {
    const newErrors: typeof errors = {};
    if (bookingDates.length === 0) newErrors.dates = 'Please select at least one date.';
    if (!eventLocation.trim()) newErrors.location = 'Please enter the event location.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    if (!service) return;

    setIsSubmitting(true);
    try {
      const firstDate = bookingDates[0];
      const lastDate = bookingDates[bookingDates.length - 1];
      const scheduledDate = new Date(`${firstDate}T${callTime}:00`).toISOString();
      const endDate = isPerSession
        ? new Date(`${lastDate}T${callTime}:00`).toISOString()
        : new Date(new Date(`${lastDate}T${callTime}:00`).getTime() + durationHours * 3600000).toISOString();

      let bookingId: string | null = null;
      try {
        const result = await bookService({
          serviceId: service.id,
          scheduledDate,
          endDate,
          guestCount,
          location: eventLocation.trim(),
          notes: projectNotes.trim() || undefined,
          totalAmount: total,
        });
        bookingId = result?.id ?? null;
      } catch {
        // API may not have this endpoint yet — continue to checkout without booking ID
      }

      const allDatesNote = bookingDates.length > 1
        ? `Dates: ${bookingDates.join(', ')}${projectNotes.trim() ? '\n' + projectNotes.trim() : ''}`
        : projectNotes.trim() || undefined;

      setBookingDetails({
        itemType: 'service',
        itemId: String(service.id),
        itemName: service.name,
        itemImage: imageUrl,
        providerName: service.ownerId ? `Provider #${service.ownerId}` : 'Provider',
        billingRate: service.billingRate ?? 'per_hour',
        pricePerUnit: unitPrice,
        totalAmount: total,
        scheduledDate,
        location: eventLocation.trim(),
      });
      void allDatesNote;

      if (bookingId) setBookingId(bookingId);

      router.push('/booking/item-checkout');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          <p className="text-text-muted text-sm">Loading service details…</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Service Not Found</h2>
          <Link href="/categories" className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">

      {/* Header */}
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

      <main className="grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb + heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/categories" className="hover:text-white transition-colors">Browse</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-white/60">Services</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-semibold">{service.name}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-400/20 border border-orange-400/30 rounded-full text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                    Service Hire
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Book This Service</h1>
              </div>
              <div className="flex items-center gap-4 bg-surface-highlight/30 px-6 py-3 rounded-full border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-black text-xs font-bold">1</span>
                  <span className="text-sm font-bold text-white">Configure</span>
                </div>
                <div className="w-8 h-px bg-white/10"></div>
                <div className="flex items-center gap-2 opacity-40">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white text-xs font-bold">2</span>
                  <span className="text-sm font-medium text-text-muted">Pay</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

            {/* Left: Form */}
            <div className="lg:col-span-8 space-y-8">

              {/* Date & Time */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">event</span>
                  <h3 className="text-xl font-display font-bold text-white">Schedule</h3>
                </div>

                {/* Availability Calendar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold">Event Date(s)</label>
                    {bookingDates.length > 0 && (
                      <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {bookingDates.length === 1
                          ? new Date(bookingDates[0] + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          : `${bookingDates.length} dates selected`}
                      </span>
                    )}
                  </div>
                  <AvailabilityCalendar
                    mode="multi"
                    values={bookingDates}
                    onChange={(dates) => { setBookingDates(dates); if (dates.length > 0) setErrors(e => ({ ...e, dates: undefined })); }}
                    bookedDates={bookedDates}
                    accent="orange"
                  />
                  {errors.dates && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.dates}
                    </p>
                  )}
                  {bookingDates.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {bookingDates.map(d => (
                        <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-orange-400/10 border border-orange-400/20 rounded-full text-[10px] font-bold text-orange-400">
                          {new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                          <button onClick={() => setBookingDates(prev => prev.filter(x => x !== d))} className="text-orange-400/60 hover:text-orange-400">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {bookedDates.length > 0 && (
                    <p className="text-[10px] text-white/30 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-red-400">info</span>
                      {bookedDates.length} date{bookedDates.length !== 1 ? 's' : ''} already booked — shown in red
                    </p>
                  )}
                </div>

                {/* Call Time */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">
                    Call Time
                    <span className="ml-2 text-[10px] text-text-muted normal-case font-normal">(arrival & setup readiness)</span>
                  </label>
                  <input
                    type="time"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all scheme:dark"
                  />
                </div>
              </div>

              {/* Duration & Guests */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">tune</span>
                  <h3 className="text-xl font-display font-bold text-white">Scope</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {!isPerSession && (
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">{durationLabel} Needed</label>
                      <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/5">
                        <button
                          onClick={() => setDurationHours(Math.max(1, durationHours - 1))}
                          className="h-11 w-11 rounded-xl bg-surface-highlight text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <div className="text-center">
                          <span className="text-2xl font-bold font-display text-white">{durationHours}</span>
                          <span className="text-text-muted text-xs block">{durationLabel.toLowerCase()}</span>
                        </div>
                        <button
                          onClick={() => setDurationHours(durationHours + 1)}
                          className="h-11 w-11 rounded-xl bg-white text-black hover:bg-accent flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Expected Guests</label>
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/5">
                      <button
                        onClick={() => setGuestCount(Math.max(1, guestCount - 10))}
                        className="h-11 w-11 rounded-xl bg-surface-highlight text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <div className="text-center">
                        <span className="text-2xl font-bold font-display text-white">{guestCount}</span>
                        <span className="text-text-muted text-xs block">guests</span>
                      </div>
                      <button
                        onClick={() => setGuestCount(guestCount + 10)}
                        className="h-11 w-11 rounded-xl bg-white text-black hover:bg-accent flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Project Brief */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-accent text-2xl">location_on</span>
                  <h3 className="text-xl font-display font-bold text-white">Details</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Event Location / Venue</label>
                  <input
                    type="text"
                    placeholder="Street, Barangay, City or Venue Name"
                    value={eventLocation}
                    onChange={(e) => { setEventLocation(e.target.value); if (e.target.value.trim()) setErrors(er => ({ ...er, location: undefined })); }}
                    className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${errors.location ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/30' : 'border-white/10 focus:border-accent focus:ring-accent'}`}
                  />
                  {errors.location && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.location}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Project Brief / Special Requests</label>
                  <textarea
                    placeholder="Set style, song requests, vibe direction, dietary restrictions, specific requirements…"
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none h-32 outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-glow">
                  <div className="relative h-48">
                    {imageUrl ? (
                      <img alt={service.name} className="w-full h-full object-cover" src={imageUrl} />
                    ) : (
                      <div className="w-full h-full bg-surface-highlight/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-[64px]">build</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-400 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {service.category ?? 'Service'}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white leading-tight">{service.name}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Rate</span>
                      <span className="text-white font-medium">{rateLabel}</span>
                    </div>
                    {!isPerSession && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Duration</span>
                        <span className="text-white font-medium">{durationHours} {durationLabel.toLowerCase()}</span>
                      </div>
                    )}
                    {sessionCount > 1 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Sessions</span>
                        <span className="text-orange-400 font-bold">× {sessionCount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Guests</span>
                      <span className="text-white font-medium">{guestCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Service Fee</span>
                      <span className="text-white font-medium">₱{SERVICE_FEE.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">Total</span>
                      <span className="text-2xl font-display font-bold text-accent">₱{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      disabled={isSubmitting}
                      onClick={handleProceed}
                      className="w-full rounded-xl bg-accent py-4 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><span className="h-5 w-5 rounded-full border-2 border-black/20 border-t-black animate-spin" /> Creating booking…</>
                      ) : (
                        <>Proceed to Payment <span className="material-symbols-outlined">arrow_forward</span></>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-text-muted mt-3">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-1">lock</span>
                      Secure encrypted checkout · Funds held in escrow
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-orange-400/20 bg-linear-to-b from-orange-400/5 to-black/20 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-orange-400/10">
                    <span className="material-symbols-outlined text-orange-400 text-2xl">verified_user</span>
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">What Happens Next</h4>
                  </div>
                  <div className="p-6 space-y-0">
                    {[
                      { icon: 'assignment_turned_in', title: 'Provider Reviews', desc: 'They confirm your project brief and lock in your date.' },
                      { icon: 'lock', title: 'Payment Held in Escrow', desc: 'Funds are secured — the provider cannot access them yet.' },
                      { icon: 'where_to_vote', title: 'Confirm Their Arrival', desc: 'On event day, tap Confirm Arrival to release payment.' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-orange-400 text-black' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                          </div>
                          {i < 2 && <div className="w-px flex-1 bg-white/10 my-1.5" />}
                        </div>
                        <div className={`pb-5 ${i < 2 ? '' : ''}`}>
                          <p className={`text-sm font-bold mb-0.5 ${i === 0 ? 'text-orange-400' : 'text-white/70'}`}>{step.title}</p>
                          <p className="text-xs text-white/35 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
