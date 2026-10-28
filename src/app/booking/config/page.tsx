import React, { Suspense } from "react";
import BookingConfigPageClient from "./_components/BookingConfigPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Configuration",
  description: "Customize your premium venue reservation.",
};

export default function BookingConfigPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense>
        <BookingConfigPageClient />
      </Suspense>
    </div>
  );
}
