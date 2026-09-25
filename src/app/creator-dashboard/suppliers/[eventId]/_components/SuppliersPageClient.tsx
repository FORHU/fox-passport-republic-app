"use client";

import React from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { EventBidsPanel } from "@/features/event/components/EventBidsPanel";
import { useEventBids } from "@/features/event/hooks/useEventBids";
import { EventSuppliersPanel } from "@/features/messages/components/EventSuppliersPanel";
import { useMyAccess } from "@/features/appointment/hooks/useAppointments";

/**
 * One Event's Suppliers and the bids for its open slots. Composes `messages`
 * (who to talk to), `event` (the bids) and `appointment` (whether the viewer
 * is the Owner, who alone may accept a bid) at the app layer.
 */
export default function SuppliersPageClient({ eventId }: { eventId: string }) {
  const access = useMyAccess({ type: "event", id: eventId });
  const isOwner = access.data?.role === "owner";
  // The event's name rides along on every bid; the panel's query is shared,
  // so this doesn't fetch twice.
  const { bids } = useEventBids(eventId);
  const eventName = bids.data?.find((b) => b.event)?.event?.name;

  return (
    <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
      <DashboardHeader />
      <main className="pt-28 pb-28 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <Link
              href="/creator-dashboard"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-display font-bold flex items-center gap-2">
              <Truck className="w-6 h-6 text-accent" />
              Suppliers{eventName ? ` · ${eventName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Message the venue, talent and gear behind this event. Conversations
              go to the event&apos;s shared inbox, so the whole team sees them.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
              Suppliers
            </h2>
            <EventSuppliersPanel eventId={eventId} />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
                Bids
              </h2>
              <p className="mt-1 text-xs text-white/40">
                {isOwner
                  ? "Offers for this event's open slots. Accepting one sets its price."
                  : "Offers for this event's open slots. You can turn one down; accepting stays with the event's owner."}
              </p>
            </div>
            <EventBidsPanel eventId={eventId} canAccept={isOwner} />
          </section>
        </div>
      </main>
    </div>
  );
}
