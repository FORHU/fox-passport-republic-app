import PageLoader from "@/shared/components/ui/PageLoader";
import React, { Suspense } from "react";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import BookingListClient from "@/features/booking/components/BookingListClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Bookings | Fox Passport Republic",
  description: "View your venue, service, and asset booking history.",
};

// One responsive page for every width: the shared app header (with its mobile
// menu and bottom nav) over the bookings list.
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <div className="min-h-screen bg-canvas font-body">
      <LandingHeader />
      <Suspense fallback={<PageLoader />}>
        <BookingListClient
          initialTab={tab === "received" ? "received" : "mine"}
        />
      </Suspense>
    </div>
  );
}
