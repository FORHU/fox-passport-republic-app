"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmBookingPayment } from "@/features/booking/api/bookings";
import { formatCurrency } from "@/shared/lib/currency";
import LandingHeader from "@/shared/components/layout/LandingHeader";

export default function VenueBookingSuccessClient() {
  const searchParams = useSearchParams();
  const confirmed = useRef(false);

  const bookingId = searchParams.get("bookingId");
  const totalParam = searchParams.get("total");
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  const totalAmount = totalParam ? Number(totalParam) : 0;
  const [orderNumber] = useState(() =>
    Math.floor(10000 + Math.random() * 90000),
  );

  useEffect(() => {
    if (confirmed.current) return;
    if (
      paymentIntentId &&
      redirectStatus === "succeeded" &&
      bookingId &&
      totalAmount > 0
    ) {
      confirmed.current = true;
      confirmBookingPayment(bookingId, paymentIntentId, totalAmount).catch(
        () => {},
      );
    }
  }, []);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden">
      <LandingHeader />

      <main className="grow pt-20 sm:pt-32 pb-28 sm:pb-20 relative flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>

        <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-accent text-black font-bold mb-6">
              <span className="material-symbols-outlined text-5xl">
                check_circle
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
              Venue Booking Confirmed!
            </h1>
            <p className="text-lg text-text-muted max-w-lg mx-auto">
              Your venue reservation is confirmed. We&apos;ve sent the receipt
              and booking details to your email.
            </p>
          </div>

          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="h-40 w-40 md:h-48 md:w-48 rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                <div className="h-full w-full bg-surface-highlight/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/20 text-[64px]">
                    apartment
                  </span>
                </div>
              </div>
              <div className="grow flex flex-col justify-center">
                <div className="text-accent font-bold text-xs mb-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                  Confirmed &bull; Booking #FP-{orderNumber}
                </div>
                <h3 className="font-display font-bold text-white text-3xl leading-tight mb-4">
                  Direct Venue Booking
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                      Reference
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">
                        receipt
                      </span>
                      {bookingId ? `#${bookingId.slice(0, 12)}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                      Status
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">
                        verified
                      </span>
                      {redirectStatus === "succeeded" ? "Paid" : "Confirmed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                      Guests
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">
                        group
                      </span>
                      See booking details
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                      Amount Paid
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-accent">
                        payments
                      </span>
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-white/20 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-text-muted text-sm">Total Charged</p>
                <span className="text-3xl font-display font-bold text-white">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link
                  href="/booking"
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all text-center"
                >
                  View Bookings
                </Link>
                <Link
                  href="/"
                  className="flex-1 sm:flex-none btn-neon rounded-xl bg-accent px-6 py-3 text-black font-bold text-sm transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  Return Home
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black pt-10 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">
                explore
              </span>
              <span className="text-xl font-display font-bold text-white">
                FoxPassport
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              © {new Date().getFullYear()} FoxPassport Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="/privacy"
              >
                Privacy
              </a>
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="/terms"
              >
                Terms
              </a>
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="/cookies"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
