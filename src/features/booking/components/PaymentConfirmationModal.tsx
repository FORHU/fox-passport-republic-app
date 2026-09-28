"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface PaymentConfirmationModalProps {
  amount: number;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function PaymentConfirmationModal({
  amount,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: PaymentConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isSubmitting]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#050608] p-4 animate-in fade-in duration-200"
      role="presentation"
    >
      <section
        aria-labelledby="payment-confirmation-title"
        aria-modal="true"
        className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#10131d] p-10 shadow-[0_0_80px_rgba(204,255,0,0.12)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        role="dialog"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

        <button
          aria-label="Close payment confirmation"
          disabled={isSubmitting}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/45 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onCancel}
          type="button"
        >
          <X size={19} />
        </button>

        <div className="relative">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-[0_0_28px_rgba(204,255,0,0.16)]">
            <span className="material-symbols-outlined text-[32px]">
              verified_user
            </span>
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-accent">
            Final review
          </p>
          <h2
            className="pr-8 font-display text-3xl font-bold tracking-tight text-white"
            id="payment-confirmation-title"
          >
            Confirm this payment?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/55">
            Your secure payment will be submitted to Stripe. The booking will
            be recorded after Stripe confirms the transaction.
          </p>

          <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-5">
            <span className="text-xs font-bold uppercase tracking-wider text-white/45">
              Total due
            </span>
            <span className="font-display text-3xl font-bold text-accent">
              ₱{amount.toLocaleString()}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
            <span className="material-symbols-outlined text-[15px] text-emerald-400">
              lock
            </span>
            Encrypted checkout powered by Stripe
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              className="rounded-2xl border border-white/10 px-4 py-4 text-sm font-bold text-white/65 transition-colors hover:bg-white/5 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              disabled={isSubmitting}
              onClick={onCancel}
              type="button"
            >
              Go back
            </button>
            <button
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-accent px-4 py-4 text-sm font-bold text-black shadow-[0_0_24px_rgba(204,255,0,0.2)] transition-all hover:bg-[#d9ff4d] hover:shadow-[0_0_34px_rgba(204,255,0,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 disabled:active:scale-100"
              disabled={isSubmitting}
              onClick={onConfirm}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4.5 w-4.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Pay securely
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
