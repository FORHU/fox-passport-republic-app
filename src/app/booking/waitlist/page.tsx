import React, { Suspense } from "react";
import WaitlistPageClient from "@/features/booking/components/WaitlistPageClient";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "My Waitlist | Fox Passport Republic",
  description: "View and manage your waitlist entries.",
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense>
        <WaitlistPageClient />
      </Suspense>
    </div>
  );
}
