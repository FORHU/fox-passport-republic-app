'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  totalAmount: number;
  onSuccess?: () => void;
}

export default function StripePaymentForm({ totalAmount, onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // If confirmPayment doesn't redirect, an error occurred
    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="stripe-elements-container">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 shrink-0">error</span>
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full rounded-2xl bg-[#ccff00] py-4 px-6 text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isProcessing ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            Processing…
          </>
        ) : (
          <>
            Confirm & Pay ₱{totalAmount.toLocaleString()}
            <span className="material-symbols-outlined">arrow_forward</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-white/40">
        <span className="material-symbols-outlined text-[14px] text-green-500">lock</span>
        Encrypted & Secure · Powered by Stripe
      </div>
    </form>
  );
}
