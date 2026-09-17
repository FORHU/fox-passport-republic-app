"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  withdrawBookingEditRequest,
  confirmBookingEditDeltaPayment,
} from "@/features/booking/api/bookings";
import type { BookingEditRequest } from "@/features/booking/types/booking.types";
import StripePaymentForm from "./StripePaymentForm";
import { formatCurrency } from "@/shared/lib/currency";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

interface Props {
  request: BookingEditRequest;
  onChanged: (request: BookingEditRequest) => void;
}

export default function BookingEditRequestStatusCard({
  request,
  onChanged,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (request.status === "withdrawn" || request.status === "expired") {
    return null;
  }

  const handleWithdraw = async () => {
    setBusy(true);
    setError("");
    try {
      const updated = await withdrawBookingEditRequest(request.id);
      onChanged({ ...request, ...updated });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message);
    } finally {
      setBusy(false);
    }
  };

  const needsPayment =
    request.status === "approved" &&
    !request.appliedAt &&
    request.deltaClientSecret;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-accent">
            edit_calendar
          </span>
          Requested Change
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            request.status === "pending"
              ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
              : request.status === "approved"
                ? "bg-green-400/20 text-green-400 border-green-400/30"
                : "bg-red-400/20 text-red-400 border-red-400/30"
          }`}
        >
          {request.status}
        </span>
      </div>

      {request.status === "pending" && (
        <p className="text-sm text-white/50">
          Waiting for the provider to respond
          {request.priceDelta !== 0 && (
            <>
              {" "}
              — price will {request.priceDelta > 0 ? "increase" : "decrease"}{" "}
              by {formatCurrency(Math.abs(request.priceDelta))}.
            </>
          )}
        </p>
      )}

      {request.status === "declined" && (
        <p className="text-sm text-white/50">
          The provider declined this request
          {request.declineReason ? `: ${request.declineReason}` : "."}
        </p>
      )}

      {request.status === "approved" && !needsPayment && (
        <p className="text-sm text-green-400/80">
          Approved and applied to your booking.
        </p>
      )}

      {needsPayment && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-white/60">
            Approved! Pay the price difference of{" "}
            <span className="text-white font-bold">
              {formatCurrency(request.priceDelta)}
            </span>{" "}
            to confirm the change.
          </p>
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: request.deltaClientSecret! }}
          >
            <StripePaymentForm
              totalAmount={request.priceDelta}
              onSuccess={async () => {
                setBusy(true);
                try {
                  const updated = await confirmBookingEditDeltaPayment(
                    request.id,
                  );
                  onChanged({ ...request, ...updated });
                } catch (e: any) {
                  setError(e?.response?.data?.message ?? e.message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </Elements>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {request.canWithdraw && (
        <button
          onClick={handleWithdraw}
          disabled={busy}
          className="mt-4 text-xs text-white/40 hover:text-red-400 transition-colors underline disabled:opacity-60"
        >
          Withdraw request
        </button>
      )}
    </div>
  );
}
