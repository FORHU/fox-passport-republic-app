"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { CentralPaymentStatusClient } from "@/shared/components/payment/CentralPaymentStatusClient";
import Link from "next/link";

export function CheckoutCancelRouter() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");

  if (invoiceId) {
    return <CentralPaymentStatusClient invoiceId={invoiceId} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass-panel rounded-[2rem] p-8 max-w-md w-full relative border border-white/10 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-500/20 text-red-500 font-bold mb-6">
          <span className="material-symbols-outlined text-4xl">cancel</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Checkout Cancelled</h2>
        <p className="text-text-muted mb-8">You have cancelled the checkout process.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
