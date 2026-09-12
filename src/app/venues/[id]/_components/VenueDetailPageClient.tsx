"use client";

import { useState } from "react";
import VenueDetailClient from "@/features/venue/components/VenueDetailClient";
import ProposePartnershipModal from "@/features/partnership/components/ProposePartnershipModal";
import type { Venue } from "@/features/venue/hooks/useVenuesByCategory";
import type { Host } from "@/features/venue/types/venue";

/**
 * Composes `venue` and `partnership` at the app layer — the feature
 * boundary rule (`tools/validate-architecture.mjs`) forbids one feature
 * importing another directly, so this is where the "propose a partnership
 * on a venue" flow gets wired together instead of inside VenueDetailClient.
 */
export default function VenueDetailPageClient({
  venue,
  host,
}: {
  venue: Venue;
  host: Host;
}) {
  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);

  return (
    <>
      <VenueDetailClient
        venue={venue}
        host={host}
        onProposePartnership={() => setIsPartnershipOpen(true)}
      />
      {isPartnershipOpen && (
        <ProposePartnershipModal
          targetVenueId={venue.id}
          targetName={venue.title}
          onClose={() => setIsPartnershipOpen(false)}
        />
      )}
    </>
  );
}
