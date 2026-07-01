import React, { Suspense } from "react";
import VenueCheckoutClient from "@/features/booking/components/VenueCheckoutClient";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Checkout | Fox Passport Republic",
  description: "Complete payment for your venue booking.",
};

export default function VenueCheckoutPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense>
        <VenueCheckoutClient />
      </Suspense>
    </div>
  );
}
