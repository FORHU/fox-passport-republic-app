/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { fetchUserBookings } from "@/features/booking/api/bookings";
import CancelBookingModal from "@/features/booking/components/CancelBookingModal";
import { toast } from "sonner";
import { getDashboardPath } from "@/shared/lib/dashboard-path";
import { pollWhileVisible } from "@/shared/lib/realtime";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10" },
  confirmed: { label: "Confirmed", color: "text-blue-400 bg-blue-500/10" },
  active: { label: "Active", color: "text-green-400 bg-green-500/10" },
  completed: { label: "Completed", color: "text-white/50 bg-white/5" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/10" },
  disputed: { label: "Disputed", color: "text-orange-400 bg-orange-500/10" },
  refunded: { label: "Refunded", color: "text-purple-400 bg-purple-500/10" },
  refund_failed: {
    label: "Refund Failed",
    color: "text-orange-400 bg-orange-500/10",
  },
};

/** Mirrors the backend sweep's own idea of "overdue unpaid" (BookingReminderService.cancelOverdueUnpaid) — kept in sync as a client-side fallback for the window before that job catches up. */
function isPastDueUnpaid(booking: any) {
  return booking.status === "pending" && new Date(booking.startAt) < new Date();
}

export default function BookingListClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const limit = 4;
  const userId = user?.id || user?.userId;

  /**
   * This list used to fetch in a `useEffect` and hold its rows in component
   * state, which put it outside React Query entirely - so the `bookings` topic
   * the server emits on every booking change reached the dashboards and the
   * admin tab but never this screen, the one belonging to the person the
   * booking is for. They saw a confirmed booking by reloading.
   *
   * The key is prefixed `user-bookings`, which is what `TOPIC_QUERY_KEYS` maps
   * `bookings` onto; React Query matches by prefix, so one emit refreshes
   * whichever page is open here and the mobile view besides.
   */
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["user-bookings", userId, page, limit],
    queryFn: () => fetchUserBookings(userId as string, page, limit),
    enabled: Boolean(userId),
    // Paging replaced the whole list with a spinner before; this keeps the
    // previous page on screen under the overlay while the next one loads.
    placeholderData: keepPreviousData,
    refetchInterval: pollWhileVisible,
  });

  const bookings = useMemo(() => data?.bookings ?? [], [data?.bookings]);
  const totalPages = data?.pagination.totalPages || 1;

  const { attentionBookings, otherBookings } = useMemo(() => {
    const attention = bookings.filter(isPastDueUnpaid);
    const others = bookings.filter((b) => !isPastDueUnpaid(b));
    return { attentionBookings: attention, otherBookings: others };
  }, [bookings]);

  useEffect(() => {
    if (isError) toast.error("Could not load bookings.");
  }, [isError]);

  // No user id means the query never runs, which is the same dead-end the
  // effect version reached - the layout's `requireAuth` is what turns those
  // people away.
  if (isPending || !userId) {
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
            <Link
              href="/"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                FoxPassport
              </h2>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Explore
              </Link>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 transition-all"
              >
                Bookings
              </Link>
            </nav>
            <div
              className="h-10 w-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-accent transition-colors"
              onClick={() => router.push(getDashboardPath(user))}
            >
              {user?.imgId ? (
                <img
                  alt="User"
                  className="h-full w-full object-cover"
                  src={user.imgId}
                />
              ) : (
                <div className="h-full w-full bg-[#ccff00] flex items-center justify-center text-black font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-28 sm:pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-accent font-semibold">My Bookings</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
              My Bookings
            </h1>
          </div>

          <div className="relative min-h-130">
            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-white/20 text-6xl mb-4">
                  book_online
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  No bookings yet
                </h3>
                <p className="text-text-muted mb-6">
                  Start by exploring venues and booking your next event.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-4 rounded-xl bg-accent text-black font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
                >
                  Browse Venues
                </Link>
              </div>
            ) : (
              <>
                {attentionBookings.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-orange-400 text-xl">
                        error
                      </span>
                      <h2 className="text-lg font-bold text-white">
                        Needs Attention
                      </h2>
                    </div>
                    <p className="text-text-muted text-sm mb-4">
                      These bookings&apos; dates have passed without payment.
                      They&apos;ll be cancelled automatically.
                    </p>
                    <div className="grid gap-4">
                      {attentionBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onCancel={setCancelTargetId}
                          pastDueUnpaid
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid gap-4">
                  {otherBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={setCancelTargetId}
                    />
                  ))}
                </div>
              </>
            )}

            {isFetching && !isPending && (
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
                <span className="material-symbols-outlined text-lg">
                  chevron_left
                </span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-10 w-10 rounded-xl font-bold text-sm transition-all ${
                    p === page
                      ? "bg-accent text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                      : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
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
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
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
            toast.success(
              "Booking cancelled. Refund (if any) will appear in 5–10 business days.",
            );
            refetch();
          }}
        />
      )}
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  pastDueUnpaid = false,
}: {
  booking: any;
  onCancel: (id: string) => void;
  pastDueUnpaid?: boolean;
}) {
  const statusInfo = STATUS_LABEL[booking.status] || STATUS_LABEL.pending;
  const eventName = booking.event?.name || "Venue Booking";
  const startDate = booking.startAt
    ? new Date(booking.startAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const isCompleted = booking.status === "completed";
  // Cancelling here would just race the auto-cancel sweep — nothing to offer but the notice above.
  const canCancel =
    !pastDueUnpaid &&
    (booking.status === "pending" || booking.status === "confirmed");
  const noReview = !booking.hasReview;

  return (
    <div
      className={`glass-panel rounded-2xl p-6 border transition-all ${
        pastDueUnpaid
          ? "border-orange-500/30 hover:border-orange-500/50"
          : "border-white/5 hover:border-accent/30"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href={`/booking/${booking.id}`}
          className="flex items-start gap-4 flex-1 min-w-0 group"
        >
          <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
            <span className="material-symbols-outlined text-white/40 group-hover:text-accent text-2xl transition-colors">
              apartment
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">
              {eventName}
            </h3>
            <p className="text-text-muted text-sm mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                calendar_today
              </span>
              {startDate}
              <span className="material-symbols-outlined text-[14px] ml-1">
                group
              </span>
              {booking.guestCount}{" "}
              {booking.guestCount === 1 ? "guest" : "guests"}
            </p>
            <p className="text-text-muted text-xs mt-1 font-mono">
              #{booking.id.slice(0, 12)}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4 md:text-right shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              pastDueUnpaid
                ? "text-orange-400 bg-orange-500/10"
                : statusInfo.color
            }`}
          >
            {pastDueUnpaid ? "Unpaid & Expired" : statusInfo.label}
          </span>
          <span className="text-xl font-display font-bold text-accent">
            ₱{booking.totalAmount?.toLocaleString() || "0"}
          </span>
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
            onClick={() => onCancel(booking.id)}
            className="px-5 py-2.5 rounded-xl border border-red-400/30 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
