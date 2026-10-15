import React, { Suspense } from "react";
import VenueRequestPendingClient from "@/features/booking/components/VenueRequestPendingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Sent | FoxPassport",
  description: "Your over-capacity venue request is awaiting Venue Foxer approval.",
};

export default function VenueRequestPendingPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense>
        <VenueRequestPendingClient />
      </Suspense>
    </div>
  );
}
