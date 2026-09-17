"use client";

import React, { useState } from "react";
import {
  useEventPaymentSummary,
  useEventCheckoutMutation,
  useCancelEventMutation,
} from "@/features/event/hooks/useEventCheckout";

export interface EventPaymentPanelProps {
  eventId: string;
}

export function EventPaymentPanel({ eventId }: EventPaymentPanelProps) {
  const [voucherCode, setVoucherCode] = useState("");
  // No one-code limit: this event may have a different active voucher per
  // provider (venue/gear/talent), plus at most one platform-wide code — the
  // backend matches each typed code to whichever line item it's scoped to.
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useEventPaymentSummary(eventId, appliedVouchers);

  const {
    mutate: checkout,
    isPending: isCheckoutLoading,
    error: checkoutError,
  } = useEventCheckoutMutation();

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const {
    mutate: cancelEvent,
    isPending: isCancelling,
  } = useCancelEventMutation(eventId);

  const handleApplyVoucher = () => {
    const code = voucherCode.trim();
    if (!code || appliedVouchers.includes(code)) return;
    setAppliedVouchers((prev) => [...prev, code]);
    setVoucherCode("");
  };

  const handleRemoveVoucher = (code: string) => {
    setAppliedVouchers((prev) => prev.filter((c) => c !== code));
  };

  const handlePayNow = () => {
    checkout({ eventId, voucherCodes: appliedVouchers });
  };

  const handleCancelEvent = () => {
    if (!confirmingCancel) {
      setConfirmingCancel(true);
      return;
    }
    cancelEvent();
    setConfirmingCancel(false);
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
          {summary.items.length > 0 && (
            <div className="space-y-2 mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                What you&apos;re paying for
              </p>
              <div className="space-y-1.5">
                {summary.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-xl px-3 py-2.5"
                  >
                    <span className="material-symbols-outlined text-accent text-[18px] shrink-0">
                      {item.type === "venue"
                        ? "location_city"
                        : item.type === "asset"
                          ? "inventory_2"
                          : "concierge"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {item.providerName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm text-white/80 block">
                        {formatCurrency(item.amount)}
                      </span>
                      {item.discountAmount > 0 && (
                        <span className="text-xs text-green-400 block">
                          -{formatCurrency(item.discountAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-white/10 my-2" />
            </div>
          )}

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

          <div className="mb-6 space-y-2">
            {appliedVouchers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {appliedVouchers.map((code) => (
                  <span
                    key={code}
                    className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent text-xs font-semibold rounded-full pl-3 pr-1.5 py-1"
                  >
                    {code}
                    <button
                      onClick={() => handleRemoveVoucher(code)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-accent/20"
                      aria-label={`Remove voucher ${code}`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        close
                      </span>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyVoucher();
                  }
                }}
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

          <button
            onClick={handleCancelEvent}
            onBlur={() => setConfirmingCancel(false)}
            disabled={isCancelling}
            className={
              confirmingCancel
                ? "w-full mt-3 flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/50 text-red-300 font-bold py-3 px-4 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-70"
                : "w-full mt-3 flex items-center justify-center gap-2 bg-transparent border border-white/10 text-white/50 text-sm py-2.5 px-4 rounded-xl hover:bg-white/5 hover:text-white/70 transition-colors disabled:opacity-70"
            }
          >
            {isCancelling ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                Cancelling…
              </>
            ) : confirmingCancel ? (
              "Click again to confirm cancellation"
            ) : (
              "Cancel this Event"
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
