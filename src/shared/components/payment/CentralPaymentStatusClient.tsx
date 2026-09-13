"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useInvoiceStatusPoll } from "@/shared/hooks/useInvoiceStatus";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { getDashboardPath } from "@/shared/lib/dashboard-path";

export function CentralPaymentStatusClient({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading, isError } = useInvoiceStatusPoll(invoiceId);
  const { user } = useAuthStore();
  const dashboardPath = getDashboardPath(user);
  
  // Implement safety timeout message if still processing after 15 seconds
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <span className="h-10 w-10 block mx-auto rounded-full border-4 border-white/20 border-t-white/80 animate-spin mb-6" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Loading...</h2>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-500/20 text-red-500 font-bold mb-6">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Error</h2>
          <p className="text-text-muted">Could not retrieve payment status.</p>
        </div>
      );
    }
    
    if (invoice?.status === "paid" || invoice?.paymentStatus === "paid") {
      return (
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-accent text-black font-bold shadow-[0_0_50px_rgba(204,255,0,0.4)] mb-6">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Payment Confirmed!</h2>
          <p className="text-text-muted">Your transaction is complete.</p>
        </div>
      );
    }
    
    const unsuccessfulStatuses = ["failed", "cancelled", "refunded", "partially_refunded"];
    if (
      unsuccessfulStatuses.includes(invoice?.status ?? "") ||
      unsuccessfulStatuses.includes(invoice?.paymentStatus ?? "")
    ) {
      return (
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-500/20 text-red-500 font-bold mb-6">
            <span className="material-symbols-outlined text-4xl">cancel</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Payment Not Completed</h2>
          <p className="text-text-muted">
            {invoice?.status === "refunded" || invoice?.paymentStatus === "refunded"
              ? "This payment was refunded."
              : invoice?.status === "partially_refunded" || invoice?.paymentStatus === "partially_refunded"
                ? "This payment was partially refunded."
                : "Please try again."}
          </p>
        </div>
      );
    }

    // Everything else — "pending" (the real pre-confirmation value; nothing
    // in the backend ever actually sets "processing") or any other
    // non-terminal status — is "still waiting on the webhook". Falling
    // through to this rather than matching "processing" specifically is
    // what keeps this in sync with useInvoiceStatusPoll's own polling
    // condition, which watches for the same thing.
    return (
      <div className="text-center">
        <span className="h-10 w-10 block mx-auto rounded-full border-4 border-white/20 border-t-accent animate-spin mb-6" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">Confirming Payment...</h2>
        <p className="text-text-muted mb-4">Please wait while we confirm your payment.</p>
        {showTimeoutMessage && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto">
            <p className="text-sm text-white/80">
              Payment is still being confirmed. You can safely leave this page.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass-panel rounded-[2rem] p-8 max-w-md w-full relative border border-white/10 shadow-2xl">
        {renderContent()}
        <div className="mt-8 flex justify-center">
          <Link
            href={dashboardPath}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
