"use client";

import React from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useMyAccess } from "@/features/appointment/hooks/useAppointments";
import { VenueListingDetailsForm } from "@/features/venue/components/VenueListingDetailsForm";
import { VenueAvailabilitySection } from "@/features/venue/components/VenueAvailabilitySection";
import { VenueAffiliatesSection } from "@/features/venue-affiliation/components/VenueAffiliatesSection";

/**
 * One venue page for everyone who runs the venue (the API's docs/adr/0005):
 * the Mayor gets the full studio (`children`); an Organizer gets the same
 * page's sections they are allowed — the listing's description and photos,
 * the calendar, and affiliation requests — and none of the Mayor's: pricing,
 * the revenue projector, publishing, or the team. The API refuses those from
 * an Organizer regardless; this only stops offering them.
 */
export function VenueEditSwitch({
  venueId,
  children,
}: {
  venueId: string;
  children: React.ReactNode;
}) {
  const access = useMyAccess({ type: "venue", id: venueId });

  if (access.isLoading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (access.data?.role !== "organizer") return <>{children}</>;

  const can = (permission: string) =>
    access.data?.permissions.includes(permission) ?? false;

  return (
    <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
      <DashboardHeader />
      <main className="pt-28 pb-28 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Link
                href="/creator-dashboard"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                ← Dashboard
              </Link>
              <h1 className="mt-2 text-2xl font-display font-bold">
                Venue you organize
              </h1>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/50">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e879f9]" />
                You help run this venue. Pricing, payouts and its team stay
                with the Mayor.
              </p>
            </div>
            <Link
              href={`/venues/${venueId}`}
              className="shrink-0 px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5 transition-colors"
            >
              View public page
            </Link>
          </div>

          {can("venue:edit-listing") && (
            <VenueListingDetailsForm venueId={venueId} />
          )}
          {can("venue:calendar") && <VenueAvailabilitySection venueId={venueId} />}
          {can("venue:approve-affiliations") && (
            <VenueAffiliatesSection venueId={venueId} asOrganizer />
          )}
        </div>
      </main>
    </div>
  );
}
