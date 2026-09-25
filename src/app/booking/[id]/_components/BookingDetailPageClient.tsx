"use client";

import React from "react";
import BookingDetailClient, {
  type BookingMessageContext,
} from "@/features/booking/components/BookingDetailClient";
import InboxMessageButton from "@/features/messages/components/InboxMessageButton";
import MessageButton from "@/features/messages/components/MessageButton";

const BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors border border-zinc-700/50 disabled:opacity-50";

/**
 * Composes `booking` and `messages` at the app layer — the feature boundary
 * rule (`tools/validate-architecture.mjs`) forbids one importing the other.
 *
 * An Event booking's conversation goes to the Event's Shared Inbox
 * (CONTEXT.md): the guest writes to the Event, and its team — the Owner and
 * its Organizers — answers as one, or writes first to the guest. Anything
 * else stays a 1:1 with the other party.
 */
function messageAction(ctx: BookingMessageContext): React.ReactNode {
  if (ctx.eventId) {
    return ctx.viewerIsGuest ? (
      <InboxMessageButton
        eventId={ctx.eventId}
        label="Message Event"
        className={BUTTON}
      />
    ) : (
      <InboxMessageButton
        eventId={ctx.eventId}
        guestId={ctx.guestId}
        label="Message Guest"
        className={BUTTON}
      />
    );
  }
  if (!ctx.otherParty) return null;
  return (
    <MessageButton
      otherUserId={ctx.otherParty.id}
      otherUserName={ctx.otherParty.name ?? "User"}
      otherUserImgId={ctx.otherParty.imgId}
      contextType="booking"
      contextId={ctx.bookingId}
      contextLabel={ctx.contextLabel}
      label={ctx.viewerIsGuest ? "Message Foxer" : "Message User"}
      className={BUTTON}
    />
  );
}

export default function BookingDetailPageClient({
  bookingId,
}: {
  bookingId: string;
}) {
  return (
    <BookingDetailClient bookingId={bookingId} messageAction={messageAction} />
  );
}
