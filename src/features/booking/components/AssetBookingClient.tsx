'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAssetById } from '@/features/asset/api/assets';
import { bookAsset, fetchAssetAvailability } from '@/features/booking/api/bookings';
import { useItemBookingStore } from '@/features/booking/store/useItemBookingStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'sonner';
import type { BackendAsset } from '@/shared/lib/api-types';
import AvailabilityCalendar from './AvailabilityCalendar';

const SERVICE_FEE = 150;

function diffDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function AssetBookingClient({ assetId }: { assetId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setBookingDetails, setBookingId } = useItemBookingStore();

  const [asset, setAsset] = useState<BackendAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<{ startDate: string; endDate: string; bookedQty: number }[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [errors, setErrors] = useState<{ dates?: string; address?: string }>({});

  // Form state
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAssetById(assetId)
      .then(setAsset)
      .catch(() => toast.error('Could not load equipment details.'))
      .finally(() => setIsLoading(false));
    fetchAssetAvailability(assetId)
      .then(d => { setBookedRanges(d.bookedRanges); setTotalQty(d.totalQty); })
      .catch(() => {});
  }, [assetId]);

  // Ensure end date is never before start date
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

  const unitPrice = Number(asset?.price ?? 0);
  const days = useMemo(() => diffDays(startDate, endDate), [startDate, endDate]);
  const subtotal = unitPrice * quantity * days;
  const total = subtotal + SERVICE_FEE;

  const rateLabel = `₱${unitPrice.toLocaleString()} / day`;
  const imageUrl = asset?.images?.[0]?.url ?? asset?.images?.[0]?.imageUrl ?? null;

  const handleProceed = async () => {
    const newErrors: typeof errors = {};
    if (!startDate || !endDate) newErrors.dates = !startDate ? 'Please select a pickup date.' : 'Please select a return date.';
    if (fulfillment === 'delivery' && !deliveryAddress.trim()) newErrors.address = 'Please enter a delivery address.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    if (!asset) return;

    setIsSubmitting(true);
    try {
      let bookingId: string | null = null;
      try {
        const result = await bookAsset({
          assetId: asset.id,
          startDate: new Date(`${startDate}T00:00:00`).toISOString(),
          endDate: new Date(`${endDate}T23:59:59`).toISOString(),
          quantity,
          fulfillmentType: fulfillment,
          deliveryAddress: fulfillment === 'delivery' ? deliveryAddress.trim() : undefined,
          notes: notes.trim() || undefined,
          totalAmount: total,
        });
        bookingId = result?.id ?? null;
      } catch {
        // API may not have this endpoint yet — continue to checkout without booking ID
      }

      setBookingDetails({
        itemType: 'asset',
        itemId: String(asset.id),
        itemName: asset.name,
        itemImage: imageUrl,
        providerName: asset.ownerId ? `Owner #${asset.ownerId}` : 'Provider',
        billingRate: asset.billingRate ?? 'per_day',
        pricePerUnit: unitPrice,
        totalAmount: total,
        scheduledDate: startDate,
        location: fulfillment === 'delivery' ? deliveryAddress.trim() : 'Pickup',
      });

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
          <p className="text-text-muted text-sm">Loading equipment details…</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Equipment Not Found</h2>
          <Link href="/categories" className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors">
            Browse Equipment
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
              <span className="text-white/60">Equipment</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-semibold">{asset.name}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-purple-400/20 border border-purple-400/30 rounded-full text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    Equipment Rental
                  </span>
                  {asset.condition && (
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      {asset.condition}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Rent Equipment</h1>
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

              {/* Rental Period */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">date_range</span>
                  <h3 className="text-xl font-display font-bold text-white">Rental Period</h3>
                </div>

                {/* Selected range summary */}
                {(startDate || endDate) && (
                  <div className="flex items-center gap-4 mb-4 px-4 py-3 bg-purple-400/5 border border-purple-400/20 rounded-xl">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Pickup</p>
                      <p className="text-sm font-bold text-white">
                        {startDate
                          ? new Date(startDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-purple-400 text-[20px]">arrow_forward</span>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Return</p>
                      <p className="text-sm font-bold text-white">
                        {endDate
                          ? new Date(endDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    {startDate && endDate && (
                      <>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Duration</p>
                          <p className="text-sm font-bold text-purple-400">{days}d</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <AvailabilityCalendar
                  mode="range"
                  startValue={startDate}
                  endValue={endDate}
                  onStartChange={(d) => { setStartDate(d); setErrors(e => ({ ...e, dates: undefined })); }}
                  onEndChange={(d) => { setEndDate(d); if (d) setErrors(e => ({ ...e, dates: undefined })); }}
                  bookedRanges={bookedRanges}
                  totalQty={totalQty || 99}
                  requestedQty={quantity}
                  accent="purple"
                />
                {errors.dates && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.dates}
                  </p>
                )}
                {bookedRanges.length > 0 && (
                  <p className="text-[10px] text-white/30 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-red-400">info</span>
                    Fully-booked dates shown in red — increasing quantity may reveal more unavailable days
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">inventory_2</span>
                  <h3 className="text-xl font-display font-bold text-white">Quantity</h3>
                </div>
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5 max-w-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 rounded-xl bg-surface-highlight text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-white">{quantity}</span>
                    <span className="text-text-muted text-xs block">unit{quantity !== 1 ? 's' : ''}</span>
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12 rounded-xl bg-white text-black hover:bg-accent flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Fulfillment */}
              <div className="glass-card rounded-[2rem] p-8 border border-white/10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-accent text-2xl">local_shipping</span>
                  <h3 className="text-xl font-display font-bold text-white">Fulfillment</h3>
                </div>

                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5">
                  <button
                    onClick={() => setFulfillment('delivery')}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      fulfillment === 'delivery' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    Delivery
                  </button>
                  <button
                    onClick={() => setFulfillment('pickup')}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      fulfillment === 'pickup' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">store</span>
                    Pickup
                  </button>
                </div>

                {fulfillment === 'delivery' ? (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Full address for delivery (Street, Barangay, City)"
                      value={deliveryAddress}
                      onChange={(e) => { setDeliveryAddress(e.target.value); if (e.target.value.trim()) setErrors(er => ({ ...er, address: undefined })); }}
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${errors.address ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/30' : 'border-white/10 focus:border-accent focus:ring-accent'}`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {errors.address}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="material-symbols-outlined text-accent text-[18px] mt-0.5 shrink-0">info</span>
                    <p className="text-sm text-text-muted">
                      You'll pick up and return the equipment directly from the owner's location. Coordinates will be shared after booking is confirmed.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Additional Notes</label>
                  <textarea
                    placeholder="Gate codes, loading dock instructions, setup help needed, condition checks…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none h-28 outline-none"
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
                      <img alt={asset.name} className="w-full h-full object-cover" src={imageUrl} />
                    ) : (
                      <div className="w-full h-full bg-surface-highlight/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-[64px]">inventory_2</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-purple-400 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {asset.category ?? 'Equipment'}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white leading-tight">{asset.name}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Rate</span>
                      <span className="text-white font-medium">{rateLabel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Quantity</span>
                      <span className="text-white font-medium">× {quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Days</span>
                      <span className="text-white font-medium">× {days}</span>
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

                <div className="rounded-3xl border border-purple-400/20 bg-linear-to-b from-purple-400/5 to-black/20 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-purple-400/10">
                    <span className="material-symbols-outlined text-purple-400 text-2xl">verified_user</span>
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">What Happens Next</h4>
                  </div>
                  <div className="p-6 space-y-0">
                    {[
                      { icon: 'inventory_2', title: 'Owner Confirms', desc: 'They verify the gear is available for your selected dates.' },
                      { icon: 'lock', title: 'Payment Held in Escrow', desc: 'Funds are secured — the owner cannot access them yet.' },
                      { icon: 'where_to_vote', title: 'Confirm Receipt', desc: 'Once you receive the gear in good condition, release payment.' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-purple-400 text-black' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                          </div>
                          {i < 2 && <div className="w-px flex-1 bg-white/10 my-1.5" />}
                        </div>
                        <div className="pb-5">
                          <p className={`text-sm font-bold mb-0.5 ${i === 0 ? 'text-purple-400' : 'text-white/70'}`}>{step.title}</p>
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
