'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  booking: {
    event?: { name?: string };
    venueName?: string;
    startAt?: string;
  };
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  booking,
}: CancelBookingModalProps) {
  if (!isOpen) return null;

  const eventName = booking.event?.name || booking.venueName || 'Venue Booking';
  const bookingDate = booking.startAt
    ? new Date(booking.startAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-panel rounded-2xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Cancel Booking?</h2>
          <p className="text-text-muted text-sm">
            Are you sure you want to cancel your booking for <strong className="text-white">{eventName}</strong>?
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Event</span>
            <span className="text-white font-medium">{eventName}</span>
          </div>
          {bookingDate && (
            <div className="flex justify-between">
              <span className="text-text-muted">Date</span>
              <span className="text-white font-medium">{bookingDate}</span>
            </div>
          )}
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs text-red-300 leading-relaxed">
            Refunds are processed within 5–10 business days. Depending on the venue&apos;s policy, cancellation fees may apply. This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel My Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
