'use client';

import React, { useEffect, useState } from 'react';
import { checkCancelEligibility, cancelBooking } from '@/features/booking/api/bookings';
import { X } from 'lucide-react';

interface CancelBookingModalProps {
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalState =
  | { phase: 'loading' }
  | { phase: 'not_eligible'; message: string; canCancelWithoutRefund?: boolean }
  | { phase: 'eligible'; eligibleData: { refundPercent: number; totalPaid: number; estimatedRefund: number; message: string; hoursUntilStart: number } }
  | { phase: 'confirming' }
  | { phase: 'success'; refunds: any[] }
  | { phase: 'error'; error: string };

export default function CancelBookingModal({ bookingId, onClose, onSuccess }: CancelBookingModalProps) {
  const [state, setState] = useState<ModalState>({ phase: 'loading' });

  useEffect(() => {
    checkCancelEligibility(bookingId)
      .then((data) => {
        if (data.eligible) {
          setState({ phase: 'eligible', eligibleData: data });
        } else {
          setState({
            phase: 'not_eligible',
            message: data.message,
            canCancelWithoutRefund: /no refund/i.test(data.message || ''),
          });
        }
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Unable to check cancellation eligibility.';
        setState({ phase: 'error', error: msg });
      });
  }, [bookingId]);

  const handleConfirmCancel = async () => {
    setState({ phase: 'confirming' });
    try {
      const result = await cancelBooking(bookingId);
      setState({ phase: 'success', refunds: result.refunds || [] });
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel booking.';
      setState({ phase: 'error', error: msg });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && state.phase !== 'confirming') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={state.phase === 'confirming'}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-400 text-[20px]">cancel</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Cancel Booking</h2>
            <p className="text-white/40 text-xs">This action cannot be undone</p>
          </div>
        </div>

        {state.phase === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          </div>
        )}

        {state.phase === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">{state.error}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/5 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        )}

        {state.phase === 'not_eligible' && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-400 text-[20px] shrink-0">info</span>
                <p className="text-yellow-400 text-sm">{state.message}</p>
              </div>
            </div>
            {state.canCancelWithoutRefund ? (
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition-all"
                >
                  Cancel Without Refund
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/5 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-95 transition-all"
              >
                Go Back
              </button>
            )}
          </div>
        )}

        {state.phase === 'eligible' && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm leading-relaxed">
              You are requesting to cancel this booking. Based on the cancellation policy, here is your refund estimate:
            </p>

            <div className="bg-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Total Paid</span>
                <span className="text-white font-bold">₱{state.eligibleData.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Refund Percentage</span>
                <span className="text-accent font-bold">{state.eligibleData.refundPercent}%</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <span className="text-text-muted text-sm">Estimated Refund</span>
                <span className="text-accent font-display font-bold text-xl">₱{state.eligibleData.estimatedRefund.toLocaleString()}</span>
              </div>
              {state.eligibleData.hoursUntilStart > 0 && (
                <p className="text-text-muted text-xs">
                  {state.eligibleData.hoursUntilStart >= 24
                    ? `${Math.floor(state.eligibleData.hoursUntilStart / 24)} day(s) until event start`
                    : `${state.eligibleData.hoursUntilStart} hour(s) until event start`}
                </p>
              )}
            </div>

            {state.eligibleData.message && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-blue-400 text-xs leading-relaxed">{state.eligibleData.message}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-95 transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition-all"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        )}

        {state.phase === 'confirming' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
            </div>
            <p className="text-center text-text-muted text-sm">Processing cancellation...</p>
          </div>
        )}

        {state.phase === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
              <span className="material-symbols-outlined text-green-400 text-4xl mb-2">check_circle</span>
              <h3 className="text-white font-bold text-lg">Booking Cancelled</h3>
              <p className="text-text-muted text-sm mt-1">Your booking has been successfully cancelled.</p>
            </div>

            {state.refunds.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-white">Refund Summary</p>
                {state.refunds.map((refund: any, idx: number) => {
                  const isSuccess = refund.status === 'succeeded' || refund.status === 'completed';
                  const isFailed = refund.status === 'failed';
                  return (
                    <div key={refund.id || idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {refund.method ? refund.method.toUpperCase() : 'Payment'} Refund
                        </p>
                        {refund.adminNotes && (
                          <p className="text-text-muted text-xs mt-0.5">{refund.adminNotes}</p>
                        )}
                      </div>
                      <span className={`font-bold ${
                        isSuccess ? 'text-green-400' : isFailed ? 'text-red-400' : 'text-orange-400'
                      }`}>
                        {isSuccess
                          ? `+₱${(refund.amount || 0).toLocaleString()}`
                          : isFailed
                            ? `-₱${(refund.amount || 0).toLocaleString()} (failed)`
                            : `₱${(refund.amount || 0).toLocaleString()} (${refund.status || 'pending'})`}
                      </span>
                    </div>
                  );
                })}
                {state.refunds.some((r: any) => r.status === 'failed') && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-orange-400 text-[16px] shrink-0 mt-0.5">error_outline</span>
                    <div>
                      <p className="text-orange-300 text-xs font-semibold">Refund encountered an issue</p>
                      <p className="text-orange-400/80 text-xs mt-0.5">
                        Our support team has been notified and will resolve this within 3-5 business days. You don&apos;t need to do anything.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {state.refunds.length === 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-text-muted text-sm text-center">No refunds were processed for this cancellation.</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
