import React, { Suspense } from "react";
import BookingListClient from "@/features/booking/components/BookingListClient";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "My Bookings | Fox Passport Republic",
  description: "View your venue, service, and asset booking history.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
        </div>
      }>
        <BookingListClient />
      </Suspense>
    </div>
  );
}
