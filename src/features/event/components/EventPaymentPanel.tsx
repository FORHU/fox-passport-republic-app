"use client";

import React, { useState } from "react";
import {
  useEventPaymentSummary,
  useEventCheckoutMutation,
} from "@/features/event/hooks/useEventCheckout";

export interface EventPaymentPanelProps {
  eventId: string;
}

export function EventPaymentPanel({ eventId }: EventPaymentPanelProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | undefined>(
    undefined,
  );

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useEventPaymentSummary(eventId, appliedVoucher);

  const {
    mutate: checkout,
    isPending: isCheckoutLoading,
    error: checkoutError,
  } = useEventCheckoutMutation();

  const handleApplyVoucher = () => {
    setAppliedVoucher(voucherCode.trim() || undefined);
  };

  const handlePayNow = () => {
    checkout({ eventId, voucherCode: appliedVoucher });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const errorMessage = (checkoutError as any)?.response?.data?.message;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-accent text-2xl">
          payments
        </span>
        <h2 className="text-xl font-display font-bold text-white">Payment</h2>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 shrink-0">
            error
          </span>
          <div>
            <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {summaryError ? (
        <div className="text-sm text-red-400">
          {(summaryError as any)?.response?.data?.message ||
            "Failed to load payment summary."}
        </div>
      ) : isSummaryLoading ? (
        <div className="flex justify-center py-8">
          <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      ) : summary ? (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-white/60">
            <span>Subtotal</span>
            <span>{formatCurrency(summary.subtotalAmount)}</span>
          </div>

          {summary.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Discount</span>
              <span>-{formatCurrency(summary.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm text-white/60">
            <span>Platform Fee</span>
            <span>{formatCurrency(summary.platformFeeAmount)}</span>
          </div>

          <div className="h-px bg-white/10 my-4" />

          <div className="flex justify-between items-center text-lg font-bold text-white mb-6">
            <span>Total</span>
            <span>{formatCurrency(summary.grossAmount)}</span>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Voucher Code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleApplyVoucher}
              disabled={isSummaryLoading || !voucherCode.trim()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              Apply
            </button>
          </div>

          <button
            onClick={handlePayNow}
            disabled={isCheckoutLoading}
            className="w-full flex items-center justify-center gap-2 bg-accent text-black font-bold py-3 px-4 rounded-xl hover:bg-[#b3e600] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCheckoutLoading ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                Redirecting to secure checkout…
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
