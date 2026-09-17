"use client";

import React, { useEffect, useState } from "react";
import {
  getBookingEditRequest,
  approveBookingEditRequest,
  declineBookingEditRequest,
  providerCancelBooking,
} from "@/features/booking/api/bookings";
import type { BookingEditRequest } from "@/features/booking/types/booking.types";
import { formatCurrency } from "@/shared/lib/currency";

type BookingType = "service" | "asset";

interface Props {
  bookingType: BookingType;
  bookingId: string;
  status: string;
  onChanged?: () => void;
}

const CANCELLABLE_STATUSES = ["pending", "confirmed", "active"];

/**
 * Self-fetching so `FoxerEarningsClient`'s booking list doesn't have to
 * orchestrate a per-row edit-request lookup — mirrors how
 * `FulfillmentPassClient` fetches its own booking data.
 */
export default function ProviderBookingRowActions({
  bookingType,
  bookingId,
  status,
  onChanged,
}: Props) {
  const [request, setRequest] = useState<BookingEditRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    getBookingEditRequest(bookingType, bookingId)
      .then(setRequest)
      .catch(() => {});
  }, [bookingType, bookingId]);

  const handleApprove = async () => {
    if (!request) return;
    setBusy(true);
    setError("");
    try {
      const updated = await approveBookingEditRequest(request.id);
      setRequest({ ...request, ...updated });
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    if (!request) return;
    setBusy(true);
    setError("");
    try {
      const updated = await declineBookingEditRequest(request.id);
      setRequest({ ...request, ...updated });
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError("A reason is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await providerCancelBooking(bookingType, bookingId, cancelReason);
      setShowCancelPrompt(false);
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message);
    } finally {
      setBusy(false);
    }
  };

  const hasPendingRequest = request?.status === "pending" && request.canApprove;

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {hasPendingRequest && (
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-3 py-1.5">
          <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
            Change requested
            {request!.priceDelta !== 0 &&
              ` (${request!.priceDelta > 0 ? "+" : ""}${formatCurrency(request!.priceDelta)})`}
          </span>
          <button
            onClick={handleApprove}
            disabled={busy}
            className="h-6 w-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 disabled:opacity-50"
            title="Approve"
          >
            <span className="material-symbols-outlined text-[14px]">
              check
            </span>
          </button>
          <button
            onClick={handleDecline}
            disabled={busy}
            className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 disabled:opacity-50"
            title="Decline"
          >
            <span className="material-symbols-outlined text-[14px]">
              close
            </span>
          </button>
        </div>
      )}

      {CANCELLABLE_STATUSES.includes(status) && !showCancelPrompt && (
        <button
          onClick={() => setShowCancelPrompt(true)}
          className="text-[10px] text-white/30 hover:text-red-400 transition-colors underline"
        >
          Cancel booking
        </button>
      )}

      {showCancelPrompt && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 w-56">
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Why are you cancelling?"
            rows={2}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs resize-none mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelPrompt(false)}
              className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/60 text-[10px] font-bold"
            >
              Back
            </button>
            <button
              onClick={handleCancel}
              disabled={busy}
              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold disabled:opacity-60"
            >
              {busy ? "..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
}
