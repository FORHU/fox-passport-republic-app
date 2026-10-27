"use client";

import BookingConfigurationClient from "@/features/booking/components/BookingConfigurationClient";
import MessageButton from "@/features/messages/components/MessageButton";

/**
 * Composes `booking` and `messages` at the app layer: the feature boundary
 * rule (`tools/validate-architecture.mjs`) forbids one feature importing
 * another, so the full event's "Ask the Event Foxer" chat is wired in here.
 */
export default function BookingConfigPageClient() {
  return (
    <BookingConfigurationClient
      renderAskEventFoxer={({ foxer, templateId, templateName }) => (
        <MessageButton
          otherUserId={foxer.id}
          otherUserName={foxer.name ?? "Event Foxer"}
          otherUserImgId={foxer.imgId}
          contextType="event"
          contextId={templateId}
          contextLabel={templateName}
          label="Ask the Event Foxer"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors"
        />
      )}
    />
  );
}
