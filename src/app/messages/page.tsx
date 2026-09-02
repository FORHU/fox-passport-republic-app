import React, { Suspense } from "react";
import ConversationListClient from "@/features/messages/components/ConversationListClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages | Fox Passport Republic",
  description: "Message the event Foxer or provider on your bookings.",
};

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
        </div>
      }
    >
      <ConversationListClient />
    </Suspense>
  );
}
