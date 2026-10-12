import PageLoader from "@/shared/components/ui/PageLoader";
import React, { Suspense } from "react";
import BookingListClient from "@/features/booking/components/BookingListClient";
import MobileBookingsView from "@/features/booking/components/MobileBookingsView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Bookings | Fox Passport Republic",
  description: "View your venue, service, and asset booking history.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileBookingsView />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
        <Suspense
          fallback={
            <PageLoader />
          }
        >
          <BookingListClient
            initialTab={tab === "received" ? "received" : "mine"}
          />
        </Suspense>
      </div>
    </>
  );
}
