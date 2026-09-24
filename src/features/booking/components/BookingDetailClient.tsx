"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBookingById,
  getBookingEditRequest,
} from "@/features/booking/api/bookings";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { pollWhileVisible } from "@/shared/lib/realtime";
import CancelBookingModal from "./CancelBookingModal";
import RequestBookingEditModal from "./RequestBookingEditModal";
import BookingEditRequestStatusCard from "./BookingEditRequestStatusCard";
import MessageButton from "@/features/messages/components/MessageButton";
import { getDashboardPath } from "@/shared/lib/dashboard-path";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10" },
  confirmed: { label: "Confirmed", color: "text-blue-400 bg-blue-500/10" },
  active: { label: "Active", color: "text-green-400 bg-green-500/10" },
  completed: { label: "Completed", color: "text-white/50 bg-white/5" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/10" },
  disputed: { label: "Disputed", color: "text-orange-400 bg-orange-500/10" },
};

const PAYMENT_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed: { label: "Paid", color: "text-green-400 bg-green-500/10" },
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10" },
  failed: { label: "Failed", color: "text-red-400 bg-red-500/10" },
  refunded: { label: "Refunded", color: "text-purple-400 bg-purple-500/10" },
  cancelled: { label: "Cancelled", color: "text-white/50 bg-white/5" },
};

export default function BookingDetailClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  /**
   * This page used to fetch in a `useEffect` and hold the booking in component
   * state, exactly as the list at `/booking` did before it was converted - and
   * with the same consequence, one screen further in. The server emits the
   * `bookings` topic the moment a payment settles, `SocketProvider` turns that
   * into a React Query invalidation, and a component outside React Query cannot
   * hear it. So the frame arrived and this page went on showing "Pending".
   *
   * Measured on 10 Sep before the change: a signed `payment_intent.succeeded`
   * webhook, `42["data:invalidate",{"topic":"bookings"}]` in the socket log 73ms
   * later, and this screen still reading Pending fifteen seconds after that. It
   * is the exact scenario the whole invalidation design exists for - somebody
   * watching a booking while a payment lands - and it was the last screen still
   * unable to see it.
   *
   * The key is prefixed `user-bookings` for the reason `BookingListClient`
   * gives: that is what `TOPIC_QUERY_KEYS` maps `bookings` onto, and React Query
   * matches by prefix, so the same emit refreshes the list and this page.
   */
  const {
    data: booking,
    isPending,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["user-bookings", "detail", bookingId],
    queryFn: () => fetchBookingById(bookingId),
    enabled: Boolean(bookingId),
    refetchInterval: pollWhileVisible,
  });

  // Only ever populated for a direct-venue Booking (single provider, no
  // template) — see the API repo's booking-edit-request service for why a
  // template-based, multi-provider Event Booking is out of scope. Harmless
  // to query unconditionally: it just resolves to null for every other kind.
  const editRequestQueryKey = ["user-bookings", "edit-request", "booking", bookingId];
  const { data: editRequest } = useQuery({
    queryKey: editRequestQueryKey,
    queryFn: () => getBookingEditRequest("booking", bookingId),
    enabled: Boolean(bookingId),
    refetchInterval: pollWhileVisible,
  });

  const err = queryError as
    | {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      }
    | undefined;
  // A 404 is not a failure to load, it is an answer - keep the two apart, as
  // the effect version did.
  const notFound =
    (isError && err?.response?.status === 404) || (!isPending && !booking);
  const error =
    isError && !notFound
      ? (err?.response?.data?.message ??
        err?.message ??
        "Failed to load booking.")
      : "";
  const loading = isPending;

  const [nowMs] = useState(() => Date.now());

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
        <span className="material-symbols-outlined text-white/20 text-6xl">
          search_off
        </span>
        <h2 className="text-2xl font-display font-bold text-white">
          Booking Not Found
        </h2>
        <p className="text-text-muted">
          This booking does not exist or has been removed.
        </p>
        <Link
          href="/booking"
          className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-all"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-red-400/60 text-6xl">
          error_outline
        </span>
        <h2 className="text-2xl font-display font-bold text-white">
          Something went wrong
        </h2>
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
  const isActiveStatus =
    booking.status === "confirmed" || booking.status === "pending";
  const isCancelled = booking.status === "cancelled";
  const eventName = booking.event?.name || "Venue Booking";
  const payments = booking.payments || [];
  const totalPaid = payments
    .filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  // The subtotal/fee split lives on the Event this booking belongs to
  // (`itemsTotal`/`hostMarkupAmount`/`platformFeeAmount`), not on the Booking
  // row itself — Booking only ever carries the final `totalAmount`. Falls
  // back to the total alone if an older booking has no breakdown recorded.
  const subtotalAmount = Number(booking.event?.itemsTotal ?? 0);
  const hostMarkupAmount = Number(booking.event?.hostMarkupAmount ?? 0);
  const platformFeeAmount = Number(booking.event?.platformFeeAmount ?? 0);
  const hasBreakdown = subtotalAmount > 0;

  // `booking.totalAmount` is the server-computed Event total (items ×
  // markup only) and can legitimately be 0 for a template with no attached
  // items — it does not include a platform service fee charged at checkout.
  // What actually reflects money received is the sum of completed payment
  // records, so prefer that for display whenever it exists.
  const displayTotal = totalPaid > 0 ? totalPaid : Number(booking.totalAmount) || 0;

  const invoiceLineItems = [
    ...(booking.venueTransactions ?? []).map((tx: any) => ({
      label: tx.venue?.name || "Venue Reservation",
      amount: Number(tx.agreedPrice),
    })),
    ...(booking.assetTransactions ?? []).map((tx: any) => ({
      label: tx.asset?.name || "Gear Rental",
      amount: Number(tx.agreedPrice),
    })),
    ...(booking.serviceTransactions ?? []).map((tx: any) => ({
      label: tx.service?.name || "Talent Service",
      amount: Number(tx.agreedPrice),
    })),
  ];

  // Only the citizen who made the booking can cancel it — the host/organizer
  // viewing the same booking gets "Unauthorized" from the API if they try.
  const isOwner = !!user?.id && user.id === booking.userId;
  const otherParty = isOwner ? booking.event?.host : booking.user;
  const hasStarted = booking.startAt
    ? new Date(booking.startAt).getTime() <= nowMs
    : false;
  const canCancel = isOwner && isActiveStatus && !hasStarted;

  // A direct-venue Booking: single provider, no template, and nothing else
  // (asset/service items) attached to it via the ad-hoc marketplace — the
  // one case with a real per-booking price formula to reprice against. See
  // the API repo's booking-edit-request service.
  const isDirectVenueBooking =
    (booking.venueTransactions?.length ?? 0) === 1 &&
    !(booking.assetTransactions?.length ?? 0) &&
    !(booking.serviceTransactions?.length ?? 0);
  const hasActiveEditRequest =
    editRequest &&
    ["pending", "approved"].includes(editRequest.status) &&
    !(editRequest.status === "approved" && editRequest.appliedAt);
  const canRequestEdit =
    isOwner &&
    isDirectVenueBooking &&
    isActiveStatus &&
    !hasStarted &&
    !hasActiveEditRequest;

  // The event's match request can be approved by the host while the booking
  // itself is still "pending" — that just means payment hasn't gone through
  // yet. Surface both so "Pending" doesn't read as the host rejecting it.
  const requestStatus = booking.event?.requestStatus;
  const showRequestNote =
    requestStatus === "approved" && booking.status === "pending";

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-4xl px-4">
          <div className="glass-panel rounded-full px-4 sm:px-6 h-14 sm:h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
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

      <main className="grow pt-24 sm:pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back
            </button>
            <div className="flex items-center gap-2 text-sm text-text-muted min-w-0">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <Link
                href="/booking"
                className="hover:text-white transition-colors"
              >
                My Bookings
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-accent font-semibold truncate max-w-50">
                #{bookingId.slice(0, 12)}
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">
                    {eventName}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusInfo.color}`}
                  >
                    {showRequestNote ? "Pending Payment" : statusInfo.label}
                  </span>
                </div>
                <p className="text-text-muted text-sm font-mono">
                  Booking #{bookingId}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {otherParty?.id && (
                  <MessageButton
                    otherUserId={otherParty.id}
                    otherUserName={otherParty.name ?? "User"}
                    otherUserImgId={otherParty.imgId}
                    contextType="booking"
                    contextId={bookingId}
                    contextLabel={eventName}
                    label={isOwner ? "Message Foxer" : "Message User"}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors border border-zinc-700/50"
                  />
                )}
                {canRequestEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit_calendar
                    </span>
                    Request a Change
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 hover:border-red-500/50 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      cancel
                    </span>
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  Start Date
                </p>
                <p className="text-white font-semibold">
                  {booking.startAt
                    ? new Date(booking.startAt).toLocaleDateString("en-PH", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  End Date
                </p>
                <p className="text-white font-semibold">
                  {booking.endAt
                    ? new Date(booking.endAt).toLocaleDateString("en-PH", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  Guests
                </p>
                <p className="text-white font-semibold">
                  {booking.guestCount || "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  Total Amount
                </p>
                <p className="text-accent font-display font-bold text-xl">
                  ₱{displayTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="invoice-printable glass-panel rounded-3xl p-4 sm:p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">
                Invoice
              </h2>
              <button
                onClick={() => window.print()}
                className="print:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">
                  print
                </span>
                Print / Save as PDF
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  Billed To
                </p>
                <p className="text-white font-semibold">
                  {booking.user?.name || "—"}
                </p>
                <p className="text-text-muted">{booking.user?.email || ""}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  Date Issued
                </p>
                <p className="text-white font-semibold">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString("en-PH", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <p className="text-text-muted font-mono text-xs mt-1">
                  #{bookingId.slice(0, 12)}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              {(invoiceLineItems.length > 0
                ? invoiceLineItems
                : [{ label: eventName, amount: subtotalAmount || displayTotal }]
              ).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-white">
                    ₱{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
              {hasBreakdown && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-white">
                    ₱{subtotalAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {hostMarkupAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Host Markup</span>
                  <span className="text-white">
                    ₱{hostMarkupAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {platformFeeAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Platform Fee</span>
                  <span className="text-white">
                    ₱{platformFeeAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-white/20 mt-4 pt-4 flex justify-between items-end">
              <div>
                <p className="text-white font-bold font-display">Total</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <span className="text-2xl font-display font-bold text-accent">
                ₱{displayTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {booking.ticketCode &&
            !isCancelled &&
            booking.status !== "completed" && (
              <div className="glass-panel rounded-3xl p-4 sm:p-8 mt-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <div className="p-4 bg-white rounded-2xl">
                      <QRCode
                        value={booking.ticketCode}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <span className="material-symbols-outlined text-accent text-[20px]">
                        qr_code_2
                      </span>
                      <h2 className="text-xl font-display font-bold text-white">
                        Your Entry Ticket
                      </h2>
                    </div>
                    <p className="text-text-muted text-sm mb-4">
                      Show this QR code to the Event Foxer at the event entrance.
                      They will scan it to verify your booking.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="material-symbols-outlined text-white/40 text-[16px]">
                        confirmation_number
                      </span>
                      <span className="font-mono text-white font-semibold tracking-widest text-sm">
                        {booking.ticketCode}
                      </span>
                    </div>
                    {booking.checkedIn && (
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 ml-0 md:ml-3">
                        <span className="material-symbols-outlined text-green-400 text-[16px]">
                          check_circle
                        </span>
                        <span className="text-green-400 text-sm font-semibold">
                          Checked In
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {payments.length > 0 && (
            <div className="glass-panel rounded-3xl p-4 sm:p-8 mt-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">
                Payment History
              </h2>
              <div className="space-y-3">
                {payments.map((payment: any, idx: number) => {
                  const pStatus =
                    PAYMENT_STATUS_LABEL[payment.status] ||
                    PAYMENT_STATUS_LABEL.pending;
                  return (
                    <div
                      key={payment.id || idx}
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {payment.method
                            ? payment.method.toUpperCase()
                            : "Card"}{" "}
                          Payment
                        </p>
                        <p className="text-text-muted text-xs">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString(
                                "en-PH",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">
                          ₱{payment.amount?.toLocaleString() || "0"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${pStatus.color}`}
                        >
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
                  <span className="text-accent font-display font-bold text-lg">
                    ₱{totalPaid.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {editRequest && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <BookingEditRequestStatusCard
              request={editRequest}
              onChanged={(updated) =>
                queryClient.setQueryData(editRequestQueryKey, updated)
              }
            />
          </div>
        )}
      </main>

      {showCancelModal && (
        <CancelBookingModal
          bookingId={bookingId}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            // The server emits `bookings` for this too, so this is belt and
            // braces - but it is the local write, and waiting on a round trip
            // through the socket to see your own cancellation is the thing
            // this page was just fixed for.
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
          }}
        />
      )}

      {showEditModal && (
        <RequestBookingEditModal
          bookingType="booking"
          bookingId={bookingId}
          currentQuantityOrGuestCount={booking.guestCount ?? 1}
          currentStartDate={booking.startAt}
          currentEndDate={booking.endAt ?? null}
          onClose={() => setShowEditModal(false)}
          onSubmitted={(request) => {
            queryClient.setQueryData(editRequestQueryKey, request);
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}
