"use client";

import React, { useState } from "react";
import { createBookingEditRequest } from "@/features/booking/api/bookings";
import type { BookingEditRequest } from "@/features/booking/types/booking.types";

type BookingType = "service" | "asset";

interface Props {
  bookingType: BookingType;
  bookingId: string;
  /** The booking's current quantity (asset) or guestCount (service). */
  currentQuantityOrGuestCount: number;
  /** The booking's current start date (asset startDate / service scheduledDate), as an ISO date string. */
  currentStartDate: string;
  /** The booking's current end date, if any, as an ISO date string. */
  currentEndDate: string | null;
  onClose: () => void;
  onSubmitted: (request: BookingEditRequest) => void;
}

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

export default function RequestBookingEditModal({
  bookingType,
  bookingId,
  currentQuantityOrGuestCount,
  currentStartDate,
  currentEndDate,
  onClose,
  onSubmitted,
}: Props) {
  const isAsset = bookingType === "asset";
  const [quantityOrGuests, setQuantityOrGuests] = useState(
    currentQuantityOrGuestCount,
  );
  const [startDate, setStartDate] = useState(
    toDateInputValue(currentStartDate),
  );
  const [endDate, setEndDate] = useState(
    currentEndDate ? toDateInputValue(currentEndDate) : "",
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasChanges =
    quantityOrGuests !== currentQuantityOrGuestCount ||
    startDate !== toDateInputValue(currentStartDate) ||
    (currentEndDate ? endDate !== toDateInputValue(currentEndDate) : false);

  const handleSubmit = async () => {
    if (!hasChanges) {
      setError("Change something before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const request = await createBookingEditRequest({
        bookingKind: bookingType,
        bookingId,
        proposedQuantity:
          isAsset && quantityOrGuests !== currentQuantityOrGuestCount
            ? quantityOrGuests
            : undefined,
        proposedGuestCount:
          !isAsset && quantityOrGuests !== currentQuantityOrGuestCount
            ? quantityOrGuests
            : undefined,
        proposedStartDate:
          startDate !== toDateInputValue(currentStartDate)
            ? new Date(startDate).toISOString()
            : undefined,
        proposedEndDate:
          endDate && (!currentEndDate || endDate !== toDateInputValue(currentEndDate))
            ? new Date(endDate).toISOString()
            : undefined,
        reason: reason || undefined,
      });
      onSubmitted(request);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
      <div className="glass-panel rounded-3xl p-8 border border-white/10 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
        <div className="mb-6">
          <span className="material-symbols-outlined text-accent text-4xl block mb-3">
            edit_calendar
          </span>
          <h3 className="text-xl font-display font-bold text-white mb-1">
            Request a Change
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Propose a new {isAsset ? "quantity or " : ""}date. The provider
            has to approve it before anything changes — if the price moves,
            you&apos;ll be charged or refunded the difference.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">
              {isAsset ? "Quantity" : "Guest Count"}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuantityOrGuests((q) => Math.max(1, q - 1))
                }
                className="h-9 w-9 rounded-xl border border-white/10 text-white flex items-center justify-center hover:bg-white/5"
              >
                −
              </button>
              <span className="text-white font-bold w-8 text-center">
                {quantityOrGuests}
              </span>
              <button
                type="button"
                onClick={() => setQuantityOrGuests((q) => q + 1)}
                className="h-9 w-9 rounded-xl border border-white/10 text-white flex items-center justify-center hover:bg-white/5"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">
                {isAsset ? "Start Date" : "Date"}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
              />
            </div>
            {isAsset && (
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none"
              placeholder="Let the provider know why you're asking"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <span className="material-symbols-outlined text-red-400 text-[16px] mt-0.5 shrink-0">
                error
              </span>
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-2xl bg-accent text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
