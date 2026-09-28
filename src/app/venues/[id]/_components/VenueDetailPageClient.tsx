"use client";

import { useState } from "react";
import { toast } from "sonner";
import VenueDetailClient from "@/features/venue/components/VenueDetailClient";
import ProposePartnershipModal from "@/features/partnership/components/ProposePartnershipModal";
import { useOpenInbox } from "@/features/messages/hooks/useMessages";
import { JoinRequestButton } from "@/features/appointment/components/JoinRequestButton";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import type { Venue } from "@/features/venue/hooks/useVenuesByCategory";
import type { Host } from "@/features/venue/types/venue";

/**
 * Composes `venue` and `partnership` at the app layer — the feature
 * boundary rule (`tools/validate-architecture.mjs`) forbids one feature
 * importing another directly, so this is where the "propose a partnership
 * on a venue" flow gets wired together instead of inside VenueDetailClient;
 * and, the same way, messaging the venue's Shared Inbox (`messages`).
 */
export default function VenueDetailPageClient({
  venue,
  host,
}: {
  venue: Venue;
  host: Host;
}) {
  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);
  const openInbox = useOpenInbox();
  const isOrganizer = useAuthStore(
    (s) => s.user?.roleType?.includes("organizer") ?? false,
  );

  return (
    <>
      <VenueDetailClient
        venue={venue}
        host={host}
        onProposePartnership={() => setIsPartnershipOpen(true)}
        organizerSlot={
          <JoinRequestButton
            target={{ type: "venue", id: venue.id }}
            isOrganizer={isOrganizer}
          />
        }
        onContactVenue={() =>
          openInbox.mutate(
            { venueId: venue.id },
            {
              onError: (error: any) =>
                toast.error(
                  error?.response?.data?.message ??
                    "Could not open a conversation with this venue.",
                ),
            },
          )
        }
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
