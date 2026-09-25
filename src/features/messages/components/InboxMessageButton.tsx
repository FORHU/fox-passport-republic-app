"use client";

import React from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOpenInbox } from "../hooks/useMessages";

/**
 * Opens a Shared Inbox thread (CONTEXT.md) — the conversation belongs to the
 * Venue or Event, so its whole team can answer and a reply shows who wrote
 * it. `guestId` only when an Event's team writes first - to one of its guests
 * or one of its Suppliers.
 */
export default function InboxMessageButton({
  venueId,
  eventId,
  guestId,
  label,
  className,
}: {
  venueId?: string;
  eventId?: string;
  guestId?: string;
  label: string;
  className?: string;
}) {
  const openInbox = useOpenInbox();

  return (
    <button
      type="button"
      disabled={openInbox.isPending}
      onClick={() =>
        openInbox.mutate(
          { venueId, eventId, guestId },
          {
            onError: (error: any) =>
              toast.error(
                error?.response?.data?.message ??
                  "Could not open this conversation.",
              ),
          },
        )
      }
      className={className}
    >
      {openInbox.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <MessageCircle className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
