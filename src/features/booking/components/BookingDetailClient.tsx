'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchBookingById } from '@/features/booking/api/bookings';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10' },
  confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-500/10' },
  active: { label: 'Active', color: 'text-green-400 bg-green-500/10' },
  completed: { label: 'Completed', color: 'text-white/50 bg-white/5' },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10' },
  disputed: { label: 'Disputed', color: 'text-orange-400 bg-orange-500/10' },
};

const PAYMENT_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  succeeded: { label: 'Paid', color: 'text-green-400 bg-green-500/10' },
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10' },
  failed: { label: 'Failed', color: 'text-red-400 bg-red-500/10' },
  refunded: { label: 'Refunded', color: 'text-purple-400 bg-purple-500/10' },
  refund_failed: { label: 'Refund Failed', color: 'text-orange-400 bg-orange-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-white/50 bg-white/5' },
};

export default function BookingDetailClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    fetchBookingById(bookingId)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setBooking(data);
        }
      })
      .catch((err: any) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err?.response?.data?.message || err?.message || 'Failed to load booking.');
        }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase() || user?.systemRole) {
      case 'admin': case 'super_admin': return '/admin';
      case 'host': case 'mayor': case 'foxer': return '/creator-dashboard';
      default: return '/user';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-white/20 text-6xl">search_off</span>
        <h2 className="text-2xl font-display font-bold text-white">Booking Not Found</h2>
        <p className="text-text-muted">This booking does not exist or has been removed.</p>
        <Link href="/booking" className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-all">
          Back to My Bookings
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-red-400/60 text-6xl">error_outline</span>
        <h2 className="text-2xl font-display font-bold text-white">Something went wrong</h2>
        <p className="text-text-muted">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_LABEL[booking.status] || STATUS_LABEL.pending;
  const isActiveStatus = booking.status === 'confirmed' || booking.status === 'pending';
  const isCancelled = booking.status === 'cancelled';
  const eventName = booking.event?.name || 'Venue Booking';
  const payments = booking.payments || [];
  const totalPaid = payments
    .filter((p: any) => p.status === 'succeeded')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-4xl px-4">
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/booking" className="hover:text-white transition-colors">My Bookings</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-accent font-semibold truncate max-w-[200px]">#{bookingId.slice(0, 12)}</span>
          </div>

          <div className="glass-panel rounded-3xl p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{eventName}</h1>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-text-muted text-sm font-mono">Booking #{bookingId}</p>
              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-white font-semibold">
                  {booking.startAt
                    ? new Date(booking.startAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">End Date</p>
                <p className="text-white font-semibold">
                  {booking.endAt
                    ? new Date(booking.endAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Guests</p>
                <p className="text-white font-semibold">{booking.guestCount || '—'}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-accent font-display font-bold text-xl">₱{booking.totalAmount?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="glass-panel rounded-3xl p-8 mt-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">Payment History</h2>
              <div className="space-y-3">
                {payments.map((payment: any, idx: number) => {
                  const pStatus = PAYMENT_STATUS_LABEL[payment.status] || PAYMENT_STATUS_LABEL.pending;
                  return (
                    <div key={payment.id || idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {payment.method ? payment.method.toUpperCase() : 'Card'} Payment
                        </p>
                        <p className="text-text-muted text-xs">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">₱{payment.amount?.toLocaleString() || '0'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${pStatus.color}`}>
                          {pStatus.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPaid > 0 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
                  <span className="text-text-muted text-sm">Total Paid</span>
                  <span className="text-accent font-display font-bold text-lg">₱{totalPaid.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
