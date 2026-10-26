import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./_components/SearchClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search events, venues and Foxers",
  description:
    "Search FoxPassport by city, date and event type for venues, gear, services and ready-made event packages.",
  // Every query string is a view of this one page, not a page of its own.
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <SearchClient />
    </Suspense>
  );
}
