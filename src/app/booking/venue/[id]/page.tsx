import React, { Suspense } from "react";
import VenueBookingClient from "@/features/booking/components/VenueBookingClient";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Book Venue | Fox Passport Republic",
  description: "Select dates and customize your venue booking.",
};

export default async function VenueBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense>
        <VenueBookingClient venueId={id} />
      </Suspense>
    </div>
  );
}
