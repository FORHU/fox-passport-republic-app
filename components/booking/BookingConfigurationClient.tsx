'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import { bookFromTemplate, getPublicTemplate, fetchTemplateAvailability } from '@/lib/api/bookings';
import AvailabilityCalendar from './AvailabilityCalendar';
import { toast } from 'sonner';

export default function BookingConfigurationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { venueName, venueImage, guestCount, checkInDate, setConfig, setDraftIds } = useCheckoutStore();
  const { user } = useAuthStore();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(!!templateId);

  useEffect(() => {
    if (!templateId) return;
    setIsLoadingTemplate(true);
    getPublicTemplate(templateId)
      .then(setTemplate)
      .catch(() => toast.error('Could not load event details.'))
      .finally(() => setIsLoadingTemplate(false));
  }, [templateId]);

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

  // Derived template values
  const templateName = template?.name || venueName || 'Event Package';
  const templateCategory = template?.category
    ? template.category.charAt(0).toUpperCase() + template.category.slice(1).toLowerCase().replace(/_/g, ' ')
    : 'Event';
  const templateImage = template?.images?.[0]?.url || venueImage;
  const templateLocation = [template?.targetCity, template?.targetState].filter(Boolean).join(', ') || 'Location TBD';
  const basePrice = template?.estimatedTotal ?? 0;
  const serviceFee = 150;

  // Collect all optional items from the template
  const optionalAssets: any[] = (template?.templateAssets ?? []).filter((ta: any) => ta.isOptional);
  const optionalServices: any[] = (template?.templateServices ?? []).filter((ts: any) => ts.isOptional);
  const optionalVenues: any[] = (template?.templateVenues ?? []).filter((tv: any) => tv.isOptional);
  const allOptionalItems: any[] = [
    ...optionalAssets.map(ta => ({ ...ta, _type: 'asset', label: ta.asset?.name ?? 'Gear', price: ta.agreedPrice })),
    ...optionalServices.map(ts => ({ ...ts, _type: 'service', label: ts.service?.name ?? 'Service', price: ts.agreedPrice })),
    ...optionalVenues.map(tv => ({ ...tv, _type: 'venue', label: tv.venue?.name ?? 'Venue', price: tv.agreedPrice })),
  ];

  const optOutSavings = allOptionalItems
    .filter(item => excludedItemIds.has(item.id))
    .reduce((sum, item) => sum + (item.price ?? 0), 0);

  const totalAmount = basePrice - optOutSavings + serviceFee;
  const includedServices: any[] = template?.templateServices?.filter((ts: any) => !ts.isOptional).slice(0, 4) ?? [];

  const [selectedTime, setSelectedTime] = useState('18:00');
  const [guests, setGuests] = useState(2);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [dateError, setDateError] = useState('');
  const [excludedItemIds, setExcludedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (guestCount) setGuests(guestCount);
  }, [guestCount]);

  useEffect(() => {
    if (!templateId) return;
    fetchTemplateAvailability(templateId)
      .then(d => setBookedDates(d.bookedDates))
      .catch(() => {});
  }, [templateId]);

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

      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/" className="hover:text-white transition-colors">Explore</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="hover:text-white transition-colors">{templateCategory}</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-semibold">{isLoadingTemplate ? '…' : templateName}</span>
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

                {/* Date picker */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold">Event Date(s)</label>
                    {selectedDates.length > 0 && (
                      <span className="text-xs font-bold text-accent flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {selectedDates.length === 1
                          ? new Date(selectedDates[0] + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
                          : `${selectedDates.length} dates selected`}
                      </span>
                    )}
                  </div>
                  <AvailabilityCalendar
                    mode="multi"
                    values={selectedDates}
                    onChange={(dates) => { setSelectedDates(dates); if (dates.length > 0) setDateError(''); }}
                    bookedDates={bookedDates}
                    accent="lime"
                  />
                  {dateError && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {dateError}
                    </p>
                  )}
                  {selectedDates.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {selectedDates.map(d => (
                        <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent">
                          {new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                          <button onClick={() => setSelectedDates(prev => prev.filter(x => x !== d))} className="text-accent/60 hover:text-accent">
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

                {/* Call time */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Start Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all scheme-dark"
                  />
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
                      <p className="text-sm text-text-muted">Package rate applies</p>
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

              {/* Included Services */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">diamond</span>
                  <h3 className="text-xl font-display font-bold text-white">What's Included</h3>
                </div>
                {isLoadingTemplate ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="p-5 rounded-2xl bg-surface-highlight/30 border border-white/5 h-28 animate-pulse" />
                    ))}
                  </div>
                ) : includedServices.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {includedServices.map((ts: any, i: number) => {
                      const svc = ts.service;
                      const icons = ['check_circle', 'celebration', 'restaurant', 'camera'];
                      const gradients = [
                        'from-purple-500 to-indigo-600',
                        'from-orange-400 to-red-500',
                        'from-emerald-400 to-teal-500',
                        'from-blue-400 to-cyan-500',
                      ];
                      return (
                        <div key={ts.id ?? i} className="p-5 rounded-2xl bg-surface-highlight/30 border border-accent/30 bg-accent/5 h-full">
                          <div className="flex justify-between items-start mb-3">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white shadow-lg`}>
                              <span className="material-symbols-outlined">{icons[i % icons.length]}</span>
                            </div>
                            <span className="material-symbols-outlined text-accent text-[20px]">check_circle</span>
                          </div>
                          <h4 className="font-bold text-white mb-1">{svc?.name ?? 'Service'}</h4>
                          <p className="text-xs text-text-muted mb-3 line-clamp-2">{svc?.description ?? ''}</p>
                          <span className="text-accent font-bold text-sm">Included</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">All services included in the package price.</p>
                )}
              </div>

              {/* Optional Add-ons */}
              {allOptionalItems.length > 0 && (
                <div className="glass-card rounded-[2rem] p-8 border border-yellow-400/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-yellow-400 text-2xl">tune</span>
                    <h3 className="text-xl font-display font-bold text-white">Optional Add-ons</h3>
                  </div>
                  <p className="text-xs text-white/40 mb-6">Uncheck any item you don't need. The price will update automatically.</p>
                  <div className="space-y-3">
                    {allOptionalItems.map((item) => {
                      const excluded = excludedItemIds.has(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                            excluded
                              ? 'border-white/5 bg-white/2 opacity-50'
                              : 'border-yellow-400/20 bg-yellow-400/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={!excluded}
                              onChange={() => {
                                setExcludedItemIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(item.id)) next.delete(item.id);
                                  else next.add(item.id);
                                  return next;
                                });
                              }}
                              className="accent-yellow-400 h-4 w-4"
                            />
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-[10px] text-white/40 capitalize">{item._type}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${excluded ? 'text-white/30 line-through' : 'text-yellow-400'}`}>
                            ₱{(item.price ?? 0).toLocaleString()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {optOutSavings > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-400/5 border border-green-400/20 rounded-xl px-4 py-2.5">
                      <span className="material-symbols-outlined text-[16px]">savings</span>
                      You're saving ₱{optOutSavings.toLocaleString()} by removing optional items.
                    </div>
                  )}
                </div>
              )}

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
                    {isLoadingTemplate ? (
                      <div className="w-full h-full bg-surface-highlight/30 animate-pulse" />
                    ) : templateImage ? (
                      <img alt="Event" className="w-full h-full object-cover" src={templateImage} />
                    ) : (
                      <div className="w-full h-full bg-surface-highlight/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-[64px]">celebration</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{templateCategory}</span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white leading-tight">
                        {isLoadingTemplate ? <span className="opacity-50">Loading…</span> : templateName}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {selectedDates.length === 0
                            ? 'No date selected'
                            : selectedDates.length === 1
                              ? new Date(selectedDates[0] + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                              : `${selectedDates.length} dates`}
                        </p>
                        <p className="text-xs text-text-muted">Scheduled date</p>
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
                        <p className="text-sm font-bold text-white">{templateLocation}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-highlight/30 p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Package estimate</span>
                      <span className="text-white">
                        {isLoadingTemplate ? '…' : `₱${basePrice.toLocaleString()}`}
                      </span>
                    </div>
                    {optOutSavings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Optional removed</span>
                        <span className="text-green-400">−₱{optOutSavings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Service Fee</span>
                      <span className="text-white">₱{serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">Total</span>
                      <span className="text-2xl font-display font-bold text-accent">
                        {isLoadingTemplate ? '…' : `₱${totalAmount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      disabled={isCreatingBooking || isLoadingTemplate}
                      onClick={async () => {
                        setConfig({
                          templateId: templateId ?? undefined,
                          venueName: templateName,
                          venueImage: templateImage ?? undefined,
                          venueLocation: templateLocation,
                          checkInDate: null,
                          checkInTime: selectedTime,
                          nights: 1,
                          totalAmount,
                          guestCount: guests,
                        });

                        if (selectedDates.length === 0) {
                          setDateError('Please select at least one date.');
                          return;
                        }

                        if (templateId) {
                          setIsCreatingBooking(true);
                          try {
                            const startAt = new Date(`${selectedDates[0]}T${selectedTime}:00`);
                            const lastDate = selectedDates[selectedDates.length - 1];
                            const endAt = new Date(`${lastDate}T${selectedTime}:00`);
                            endAt.setHours(endAt.getHours() + 6);
                            const result = await bookFromTemplate({
                              templateId,
                              guestCount: guests,
                              totalAmount,
                              startAt: startAt.toISOString(),
                              endAt: endAt.toISOString(),
                              excludedAssetIds: optionalAssets.filter(ta => excludedItemIds.has(ta.id)).map(ta => ta.id),
                              excludedServiceIds: optionalServices.filter(ts => excludedItemIds.has(ts.id)).map(ts => ts.id),
                              excludedVenueIds: optionalVenues.filter(tv => excludedItemIds.has(tv.id)).map(tv => tv.id),
                            });
                            setDraftIds(result.eventId, result.booking.id);
                            router.push('/checkout');
                          } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Could not create booking. Please try again.');
                            setIsCreatingBooking(false);
                          }
                        } else {
                          router.push('/checkout');
                        }
                      }}
                      className="w-full btn-neon group relative overflow-hidden rounded-xl bg-accent py-4 text-black font-bold text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isCreatingBooking ? (
                          <><span className="h-5 w-5 rounded-full border-2 border-black/20 border-t-black animate-spin" /> Creating booking…</>
                        ) : (
                          <>Proceed to Payment <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></>
                        )}
                      </span>
                    </button>
                    <p className="text-center text-[10px] text-text-muted mt-3">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-1">lock</span>
                      Secure encrypted checkout
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-accent/20 bg-linear-to-b from-accent/5 to-black/20 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-accent/10">
                    <span className="material-symbols-outlined text-accent text-2xl">verified_user</span>
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">What Happens Next</h4>
                  </div>
                  <div className="p-6 space-y-0">
                    {[
                      { icon: 'event_available', title: 'Package Confirmed', desc: 'The organizer reviews and locks in your event details.' },
                      { icon: 'lock', title: 'Payment Held in Escrow', desc: 'Funds are secured — the provider cannot access them yet.' },
                      { icon: 'where_to_vote', title: 'Confirm Arrival', desc: 'On event day, confirm their arrival to release payment.' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-accent text-black' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                          </div>
                          {i < 2 && <div className="w-px flex-1 bg-white/10 my-1.5" />}
                        </div>
                        <div className="pb-5">
                          <p className={`text-sm font-bold mb-0.5 ${i === 0 ? 'text-accent' : 'text-white/70'}`}>{step.title}</p>
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
