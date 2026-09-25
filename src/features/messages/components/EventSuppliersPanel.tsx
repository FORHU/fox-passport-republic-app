"use client";

import React from "react";
import { Loader2, Truck } from "lucide-react";
import { useEventSuppliers } from "../hooks/useMessages";
import InboxMessageButton from "./InboxMessageButton";
import type { EventSupplier } from "../types";

const KIND_LABEL: Record<EventSupplier["supplies"][number]["kind"], string> = {
  venue: "Venue",
  service: "Talent",
  asset: "Gear",
};

/**
 * An Event's Suppliers - those booked on it and those with a live bid - each
 * with a Message button into the Event's Shared Inbox, so the whole team
 * sees the thread and it outlasts whoever started it (ADR 0005).
 */
export function EventSuppliersPanel({ eventId }: { eventId: string }) {
  const suppliers = useEventSuppliers(eventId);

  if (suppliers.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/40">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        Loading suppliers…
      </div>
    );
  }
  if (suppliers.isError) {
    return (
      <p className="text-sm text-red-300">
        Couldn&apos;t load this event&apos;s suppliers.
      </p>
    );
  }

  const rows = suppliers.data ?? [];
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
        <Truck className="w-6 h-6 mx-auto mb-2 text-white/30" />
        No suppliers yet. Anyone booked on this event, or bidding for it, shows
        up here.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {rows.map(({ user, supplies }) => (
        <li
          key={user.id}
          className="p-4 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.name ?? "A Foxer"}
            </p>
            <p className="text-xs text-white/50 truncate">
              {supplies
                .map(
                  (s) =>
                    `${KIND_LABEL[s.kind]}: ${s.name}${s.via === "bid" ? " (bid)" : ""}`,
                )
                .join(" · ")}
            </p>
          </div>
          <InboxMessageButton
            eventId={eventId}
            guestId={user.id}
            label="Message"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white/80 hover:bg-white/5 disabled:opacity-50 transition-colors"
          />
        </li>
      ))}
    </ul>
  );
}
