'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchServiceBooking, fetchAssetBooking, confirmArrival, reportNoShow } from '@/features/booking/api/bookings';
import { createStamp } from '@/features/gamification/api/stamps';
import { toast } from 'sonner';

type BookingType = 'service' | 'asset';

interface Props {
  bookingType: BookingType;
  bookingId: string;
}

const ESCROW_STEPS = [
  { label: 'PAYMENT SECURED IN ESCROW' },
  { label: 'AWAITING ARRIVAL (FUNDS HELD)' },
  { label: 'RELEASE FUNDS TO FOXER' },
];

function stepsDone(status: string): boolean[] {
  switch (status) {
    case 'completed': return [true, true, true];
    case 'active':    return [true, true, false];
    case 'disputed':  return [true, false, false];
    case 'confirmed': return [true, false, false];
    default:          return [true, false, false];
  }
}

export default function FulfillmentPassClient({ bookingType, bookingId }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    const fetcher = bookingType === 'service' ? fetchServiceBooking : fetchAssetBooking;
    fetcher(bookingId)
      .then(setBooking)
      .catch(() => setError('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId, bookingType]);

  const handleConfirmArrival = async () => {
    setActionLoading(true);
    try {
      const updated = await confirmArrival(bookingType, bookingId);
      setBooking(updated);
      // Trigger stamp creation for this booking
      try {
        await createStamp(bookingId);
        toast.success('🎉 Stamp earned!');
      } catch {
        // Stamp creation is best-effort; don't block the arrival confirmation UI
      }
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportNoShow = async () => {
    setShowDisputeModal(false);
    setActionLoading(true);
    try {
      const updated = await reportNoShow(bookingType, bookingId);
      setBooking(updated);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-spin material-symbols-outlined text-accent text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <span className="material-symbols-outlined text-white/20 text-6xl block mb-4">error</span>
          <p className="text-white/60">{error || 'Booking not found'}</p>
          <button onClick={() => router.back()} className="mt-4 text-accent text-sm hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  const isService = bookingType === 'service';
  const item = isService ? booking.service : booking.asset;
  const owner = item?.owner;
  const status: string = booking.status;
  const passId = `BK-${bookingId.slice(-5).toUpperCase()}`;

  const scheduledDate = new Date(isService ? booking.scheduledDate : booking.startDate);
  const formattedDate = scheduledDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = scheduledDate.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const location = isService ? booking.location : (booking.deliveryAddress || 'Pickup from owner');

  const done = stepsDone(status);
  const isDisputed  = status === 'disputed';
  const isCompleted = status === 'completed';
  const isActive    = status === 'active';
  const canConfirm  = status === 'confirmed';
  const canDispute  = ['confirmed', 'active'].includes(status);

  const statusBadge = {
    pending:   'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
    confirmed: 'bg-accent/20 text-accent border-accent/30',
    active:    'bg-blue-400/20 text-blue-400 border-blue-400/30',
    completed: 'bg-green-400/20 text-green-400 border-green-400/30',
    cancelled: 'bg-white/10 text-white/40 border-white/10',
    disputed:  'bg-red-400/20 text-red-400 border-red-400/30',
  }[status] ?? 'bg-white/10 text-white/40 border-white/10';

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen font-body">
      {/* Navbar */}
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white group-hover:text-accent transition-colors">FoxPassport</h2>
            </Link>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="pt-36 pb-20 px-4">
        <div className="mx-auto max-w-2xl space-y-5">

          {/* Header Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-display font-bold text-white truncate mb-1">{item?.name}</h1>
                <p className="text-xs font-bold text-accent uppercase tracking-[3px]">FULFILLMENT PASS #{passId}</p>
              </div>
              <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBadge}`}>
                {status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Schedule</p>
                <p className="text-white font-bold text-sm">{formattedDate}</p>
                <p className="text-white/40 text-xs">{formattedTime} (Call Time)</p>
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Location</p>
                <p className="text-white font-bold text-sm line-clamp-2">{location}</p>
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Provider</p>
                <p className="text-white font-bold text-sm">{owner?.name || 'TBD'}</p>
                <p className="text-accent text-xs truncate">{owner?.email}</p>
              </div>
            </div>
          </div>

          {/* Two-column section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Preparation */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent">assignment</span>
                  Preparation
                </h3>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Instructions</span>
              </div>

              {booking.notes ? (
                <p className="text-sm text-text-muted leading-relaxed italic">&quot;{booking.notes}&quot;</p>
              ) : (
                <p className="text-sm text-white/30 italic">No special instructions provided.</p>
              )}

              <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-white/30">payments</span>
                  <span className="text-xs text-white/40">Amount: </span>
                  <span className="text-xs text-white font-bold">₱{booking.totalAmount?.toLocaleString()}</span>
                </div>
                {!isService && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-white/30">inventory_2</span>
                    <span className="text-xs text-white/40">Qty: </span>
                    <span className="text-xs text-white font-bold">{booking.quantity} unit(s) · {booking.fulfillmentType}</span>
                  </div>
                )}
                {isService && booking.guestCount > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-white/30">group</span>
                    <span className="text-xs text-white/40">Guests: </span>
                    <span className="text-xs text-white font-bold">{booking.guestCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Escrow Protection */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent">shield</span>
                  Escrow Protection
                </h3>
                <span className={`h-3 w-3 rounded-full ${isDisputed ? 'bg-red-400' : isCompleted ? 'bg-green-400' : 'bg-accent animate-pulse'}`} />
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-5 relative z-10">
                <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-white/10" />
                {ESCROW_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 relative z-10">
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      done[i] ? 'bg-accent border-accent shadow-[0_0_8px_rgba(204,255,0,0.4)]' : 'bg-background border-white/20'
                    }`}>
                      {done[i] && <span className="material-symbols-outlined text-[10px] text-black font-black">check</span>}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${done[i] ? 'text-white' : 'text-white/30'}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action area */}
              {isDisputed ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                  <span className="material-symbols-outlined text-red-400 text-3xl block mb-1">warning</span>
                  <p className="text-red-400 font-bold text-sm">Dispute Reported</p>
                  <p className="text-white/40 text-xs mt-1">Our team will review within 24 hours. You&apos;ll be contacted by email.</p>
                </div>
              ) : isCompleted ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                  <span className="material-symbols-outlined text-green-400 text-3xl block mb-1">check_circle</span>
                  <p className="text-green-400 font-bold text-sm">Funds Released</p>
                  <p className="text-white/40 text-xs mt-1">Payment has been wired to the provider.</p>
                </div>
              ) : isActive ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
                  <span className="material-symbols-outlined text-blue-400 text-3xl block mb-1">send_money</span>
                  <p className="text-blue-400 font-bold text-sm">Arrival Confirmed</p>
                  <p className="text-white/40 text-xs mt-1">Funds are being released. 3–5 business days.</p>
                </div>
              ) : canConfirm ? (
                <>
                  <button
                    onClick={handleConfirmArrival}
                    disabled={actionLoading}
                    className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] active:scale-95 transition-all disabled:opacity-60"
                  >
                    {actionLoading
                      ? <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                      : <>Confirm Arrival <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span></>
                    }
                  </button>
                  <p className="text-[10px] text-amber-400/80 text-center mt-2 font-medium uppercase tracking-wider leading-relaxed">
                    Important: Only confirm once they arrive. Your money is 100% safe in our vault until this step.
                  </p>
                </>
              ) : (
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-white/40 text-xs">Awaiting payment confirmation from provider.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {owner?.email && (
                <a
                  href={`mailto:${owner.email}`}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Message {owner?.name?.split(' ')[0]}
                </a>
              )}
              {canDispute && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="flex-1 py-3 rounded-2xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  Report a Problem or No-Show
                </button>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-white/30 text-xs mb-1.5">Need an Invoice?</p>
              <span className="text-accent text-xs font-bold cursor-default underline">
                Download the full fulfillment PDF for your records.
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* Dispute Confirmation Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
          <div className="glass-panel rounded-3xl p-8 border border-white/10 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-red-400 text-5xl block mb-3">warning</span>
              <h3 className="text-xl font-display font-bold text-white mb-2">Report No-Show?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                This flags the booking for admin review. If the provider truly failed to show, we&apos;ll initiate a full refund within 3–5 business days.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-3 rounded-2xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReportNoShow}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Reporting...' : 'Yes, Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
