'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchVenueById } from '@/features/venue/api/venues';
import { bookVenueDraft } from '@/features/booking/api/bookings';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { StepperControl } from '@/shared/components/ui/StepperControl';
import { ProgressIndicator } from '@/shared/components/ui/ProgressIndicator';
import { FormSection } from '@/shared/components/ui/FormSection';
import { EscrowTimeline } from '@/shared/components/ui/EscrowTimeline';
import { toast } from 'sonner';

const SERVICE_FEE_RATE = 0.10;

function diffDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function CompactDatePicker({
  startValue, endValue, onStartChange, onEndChange, onDone,
}: {
  startValue: string; endValue: string;
  onStartChange: (d: string) => void; onEndChange: (d: string) => void;
  onDone: () => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const dim = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleClick = (ds: string) => {
    if (ds < todayStr) return;
    if (!startValue || (startValue && endValue)) {
      onStartChange(ds);
      onEndChange('');
      return;
    }
    if (ds < startValue) { onStartChange(ds); return; }
    onEndChange(ds);
    onDone();
  };

  const isSelected = (ds: string) => ds === startValue || ds === endValue;
  const isInRange = (ds: string) => startValue && endValue && ds > startValue && ds < endValue;

  return (
    <div className="bg-black/95 border border-white/10 rounded-2xl p-4 w-[280px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-90 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform duration-200">chevron_left</span>
        </button>
        <p className="text-xs font-bold text-accent tracking-wide select-none">{MONTHS[viewMonth]} {viewYear}</p>
        <button
          onClick={nextMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-90 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform duration-200">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[9px] text-white/60 font-bold py-1 tracking-wider">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past = ds < todayStr;
          const sel = isSelected(ds);
          const inRange = isInRange(ds);

          return (
            <button
              key={ds}
              onClick={() => handleClick(ds)}
              disabled={past}
              className={[
                'h-8 w-full text-[13px] font-semibold transition-all duration-150 flex items-center justify-center',
                inRange ? 'bg-gradient-to-r from-accent/10 via-accent/15 to-accent/10' : '',
                sel ? 'bg-accent text-black rounded-full z-10 shadow-[0_0_12px_rgba(204,255,0,0.4)] scale-105' : '',
                !sel && !past ? 'text-white/90 hover:bg-white/10 hover:rounded-full hover:scale-105 cursor-pointer active:scale-95' : '',
                past ? 'text-white/20 cursor-not-allowed' : '',
                ds === todayStr && !sel ? 'ring-1 ring-white/70 rounded-full animate-pulse' : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>

    </div>
  );
}

export default function VenueBookingClient({ venueId }: { venueId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [venue, setVenue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDisplay, setStartDisplay] = useState('');
  const [endDisplay, setEndDisplay] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<{ dates?: string }>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setStartDisplay(startDate ? startDate.replace(/-/g, '/') : ''); }, [startDate]);
  useEffect(() => { setEndDisplay(endDate ? endDate.replace(/-/g, '/') : ''); }, [endDate]);

  const parseDisplay = (val: string, setter: (d: string) => void) => {
    const cleaned = val.replace(/\//g, '-');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      setter(d.toISOString().split('T')[0]);
      setErrors({});
    }
  };

  useEffect(() => {
    fetchVenueById(venueId)
      .then(setVenue)
      .catch(() => toast.error('Could not load venue details.'))
      .finally(() => setIsLoading(false));
  }, [venueId]);

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin': case 'super_admin': return '/admin';
      case 'host': case 'mayor': case 'foxer': return '/creator-dashboard';
      default: return '/user';
    }
  };

  const baseRate = Number(venue?.price ?? 0);
  const days = useMemo(() => diffDays(startDate, endDate), [startDate, endDate]);
  const subtotal = baseRate * days * guestCount;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const imageUrl = venue?.images?.[0]?.url ?? venue?.images?.[0]?.imageUrl ?? null;

  const handleProceed = async () => {
    if (!startDate || !endDate) {
      setErrors({ dates: 'Please select both start and end dates.' });
      return;
    }
    setErrors({});
    if (!venue) return;

    setIsSubmitting(true);
    try {
      const result = await bookVenueDraft({
        venueId,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59`).toISOString(),
        guestCount,
        totalAmount: total,
        specialRequests: specialRequests.trim() || undefined,
      });

      router.push(`/booking/venue/checkout?bookingId=${result.bookingId}&total=${total}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Could not create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          <p className="text-text-muted text-sm">Loading venue details…</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Venue Not Found</h2>
          <Link href="/" className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors">
            Browse Venues
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
              <Link href="/" className="hover:text-white transition-colors">Explore</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-white/60">Venues</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-semibold">{venue.name}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    Venue Direct Booking
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Book This Venue</h1>
              </div>
              <ProgressIndicator
                steps={[
                  { number: 1, label: 'Configure' },
                  { number: 2, label: 'Pay' },
                ]}
                currentStep={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

            {/* Left: Form */}
            <div className="lg:col-span-8 space-y-8">

              {/* Date Range */}
              <FormSection icon="date_range" title="Select Dates">
                <div className="relative">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Start Date</label>
                      <div className="relative" ref={triggerRef}>
                        <input
                          type="text"
                          value={startDisplay}
                          placeholder="YYYY/MM/DD"
                          onChange={(e) => setStartDisplay(e.target.value)}
                          onBlur={(e) => parseDisplay(e.target.value, setStartDate)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-12"
                        />
                        <span
                          onClick={(e) => {
                            const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                            setPopupPos({ top: rect.bottom + 4, left: rect.right - 280 });
                            setCalendarOpen(true);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer material-symbols-outlined"
                        >
                          calendar_today
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">End Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={endDisplay}
                          placeholder="YYYY/MM/DD"
                          onChange={(e) => setEndDisplay(e.target.value)}
                          onBlur={(e) => parseDisplay(e.target.value, setEndDate)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-12"
                        />
                        <span
                          onClick={(e) => {
                            const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                            setPopupPos({ top: rect.bottom + 4, left: rect.right - 280 });
                            setCalendarOpen(true);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer material-symbols-outlined"
                        >
                          calendar_today
                        </span>
                      </div>
                    </div>
                  </div>

                  {errors.dates && (
                    <p className="text-xs text-red-400 mt-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.dates}
                    </p>
                  )}
                  {startDate && endDate && !calendarOpen && (
                    <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      {formatDate(startDate)} → {formatDate(endDate)} · {days} day{days !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </FormSection>

              {/* Guest Count */}
              <FormSection icon="group" title="Number of Guests">
                <StepperControl
                  value={guestCount}
                  onChange={setGuestCount}
                  min={1}
                  step={1}
                  label="Total Guests"
                  icon="person"
                />
              </FormSection>

              {/* Special Requests */}
              <FormSection icon="edit_note" title="Special Requests">
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none h-32 outline-none"
                  placeholder="Any special requirements, setup needs, or questions for the venue owner..."
                />
              </FormSection>

            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-glow">
                  <div className="relative h-48">
                    {imageUrl ? (
                      <img alt={venue.name} className="w-full h-full object-cover" src={imageUrl} />
                    ) : (
                      <div className="w-full h-full bg-surface-highlight/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-[64px]">apartment</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {venue.category ?? 'Venue'}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white leading-tight">{venue.name}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Rate</span>
                      <span className="text-white font-medium">₱{baseRate.toLocaleString()} / guest / day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Duration</span>
                      <span className="text-white font-medium">{days} day{days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Guests</span>
                      <span className="text-white font-medium">× {guestCount}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Subtotal</span>
                      <span className="text-white">₱{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Service Fee (10%)</span>
                      <span className="text-white">₱{serviceFee.toLocaleString()}</span>
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

                <EscrowTimeline />

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

      {calendarOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setCalendarOpen(false)}>
          <div
            className="absolute animate-in fade-in zoom-in-95 duration-150"
            style={{ top: popupPos.top, left: popupPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <CompactDatePicker
              startValue={startDate}
              endValue={endDate}
              onStartChange={(d) => { setStartDate(d); setErrors({}); }}
              onEndChange={(d) => { setEndDate(d); setErrors({}); }}
              onDone={() => setCalendarOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
