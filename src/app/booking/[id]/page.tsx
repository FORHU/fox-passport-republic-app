import React, { Suspense } from "react";
import BookingDetailClient from "@/features/booking/components/BookingDetailClient";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Booking Details | Fox Passport Republic",
  description: "View your booking details, payment history, and manage cancellations.",
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
        </div>
      }>
        <BookingDetailClient bookingId={id} />
      </Suspense>
    </div>
  );
}
