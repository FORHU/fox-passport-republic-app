'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchUserBookings } from '@/features/booking/api/bookings';
import CancelBookingModal from '@/features/booking/components/CancelBookingModal';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10' },
  confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-500/10' },
  active: { label: 'Active', color: 'text-green-400 bg-green-500/10' },
  completed: { label: 'Completed', color: 'text-white/50 bg-white/5' },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10' },
  disputed: { label: 'Disputed', color: 'text-orange-400 bg-orange-500/10' },
  refunded: { label: 'Refunded', color: 'text-purple-400 bg-purple-500/10' },
  refund_failed: { label: 'Refund Failed', color: 'text-orange-400 bg-orange-500/10' },
};

export default function BookingListClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitial, setIsInitial] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const limit = 4;

  const loadBookings = () => {
    const userId = user?.id || user?.userId;
    if (!userId) return;
    if (!isInitial) setIsFetching(true);
    fetchUserBookings(userId, page, limit)
      .then((res) => {
        setBookings(res.bookings);
        setTotalPages(res.pagination.totalPages || 1);
      })
      .catch(() => toast.error('Could not load bookings.'))
      .finally(() => {
        setIsInitial(false);
        setIsFetching(false);
      });
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.userId, page]);

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase() || user?.systemRole) {
      case 'admin': case 'super_admin': return '/admin';
      case 'host': case 'mayor': case 'foxer': return '/creator-dashboard';
      default: return '/user';
    }
  };

    if (isInitial) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
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
            <div className="mb-10">
              <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-accent font-semibold">My Bookings</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">My Bookings</h1>
            </div>

            <div className="relative min-h-[520px]">
              {bookings.length === 0 ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-white/20 text-6xl mb-4">book_online</span>
                  <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
                  <p className="text-text-muted mb-6">Start by exploring venues and booking your next event.</p>
                  <Link href="/" className="inline-block px-8 py-4 rounded-xl bg-accent text-black font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all">
                    Browse Venues
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => {
                    const statusInfo = STATUS_LABEL[booking.status] || STATUS_LABEL.pending;
                    const eventName = booking.event?.name || 'Venue Booking';
                    const startDate = booking.startAt
                      ? new Date(booking.startAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—';
                    const isCompleted = booking.status === 'completed';
                    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
                    const noReview = !booking.hasReview;

                    return (
                      <div
                        key={booking.id}
                        className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <Link
                            href={`/booking/${booking.id}`}
                            className="flex items-start gap-4 flex-1 min-w-0 group"
                          >
                            <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                              <span className="material-symbols-outlined text-white/40 group-hover:text-accent text-2xl transition-colors">apartment</span>
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-white text-lg">{eventName}</h3>
                              <p className="text-text-muted text-sm mt-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {startDate}
                                <span className="material-symbols-outlined text-[14px] ml-1">group</span>
                                {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                              </p>
                              <p className="text-text-muted text-xs mt-1 font-mono">#{booking.id.slice(0, 12)}</p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-4 md:text-right shrink-0">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className="text-xl font-display font-bold text-accent">₱{booking.totalAmount?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-3">
                          <Link
                            href={`/booking/${booking.id}`}
                            className="px-5 py-2.5 rounded-xl bg-white/5 text-white/70 font-bold text-xs hover:bg-white/10 hover:text-white transition-all"
                          >
                            View Details
                          </Link>
                          {isCompleted && noReview && (
                            <Link
                              href={`/reviews/write/${booking.id}`}
                              className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
                            >
                              Leave a Review
                            </Link>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => setCancelTargetId(booking.id)}
                              className="px-5 py-2.5 rounded-xl border border-red-400/30 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isFetching && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl">
                  <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-10 w-10 rounded-xl font-bold text-sm transition-all ${p === page
                        ? 'bg-accent text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </main>

        {cancelTargetId && (
          <CancelBookingModal
            bookingId={cancelTargetId}
            onClose={() => setCancelTargetId(null)}
            onSuccess={() => {
              setCancelTargetId(null);
              toast.success('Booking cancelled. Refund (if any) will appear in 5–10 business days.');
              loadBookings();
            }}
          />
        )}
      </div>
    );
  }