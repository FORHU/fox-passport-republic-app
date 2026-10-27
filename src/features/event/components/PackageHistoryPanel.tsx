"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import {
  fetchPackageHistory,
  type PackageHistoryEntry,
} from "@/shared/api/event-templates";
import { categoryLabel } from "@/features/search/helpers/labels";
import { formatCurrency } from "@/shared/lib/currency";

/**
 * A package's History in Event Studio: its edits, the items added and
 * removed, and its bookings, newest first, with who and when. Only the
 * package's owner can read it (the API checks).
 */

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  description: "Description",
  category: "Category",
  isPublic: "Public",
  targetCity: "City",
  targetState: "State",
  targetCountry: "Country",
  hostMarkupPct: "Markup",
  maxAttendees: "Max Attendees",
  photos: "Photos",
};

const KIND_LABELS = { asset: "gear", service: "service", venue: "venue" };

function show(field: string, value: unknown): string {
  if (field === "maxAttendees" && value === null) return "no limit";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (field === "hostMarkupPct") return `${value}%`;
  if (field === "category") return categoryLabel(String(value));
  if (field === "description") {
    const text = String(value);
    return text.length > 40 ? `${text.slice(0, 40)}…` : text;
  }
  return String(value);
}

function describe(entry: PackageHistoryEntry): string[] {
  const kind = entry.kind ? KIND_LABELS[entry.kind] : "item";
  const item = entry.itemName || entry.description || "";
  switch (entry.action) {
    case "package.edit":
      return Object.entries(entry.changes ?? {}).map(
        ([field, { from, to }]) =>
          `${FIELD_LABELS[field] ?? field}: ${show(field, from)} → ${show(field, to)}`,
      );
    case "package.item.add":
      return [`Added ${kind}${item ? ` ${item}` : ""}`];
    case "package.item.remove":
      return [`Removed ${kind}${item ? ` ${item}` : ""}`];
    case "booking.created": {
      const guests = entry.guestCount ? ` for ${entry.guestCount} guests` : "";
      const date = entry.startAt
        ? ` on ${new Date(entry.startAt).toLocaleDateString()}`
        : "";
      return [`Booked${guests}${date}`];
    }
    case "booking.paid":
      return [
        `Paid${entry.amount !== undefined ? ` ${formatCurrency(entry.amount)}` : ""}`,
      ];
    case "booking.checkedIn":
      return [entry.byReview ? "Marked a booking attended" : "Checked in a booking"];
    case "booking.cancelled":
      if (entry.noShow) return ["Marked a booking as a no-show"];
      return [`Cancelled a booking${entry.refunded ? " (refunded)" : ""}`];
    default:
      return [entry.action];
  }
}

export default function PackageHistoryPanel({
  templateId,
}: {
  templateId: string;
}) {
  const { data: entries, isPending, isError } = useQuery({
    queryKey: ["package-history", templateId],
    queryFn: () => fetchPackageHistory(templateId),
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
        <History className="h-5 w-5 text-white/60" aria-hidden="true" />
        History
      </h2>
      <p className="mt-1 text-sm text-white/60">
        Changes to this package and its bookings, newest first.
      </p>

      <div className="mt-4">
        {isPending ? (
          <p className="text-sm text-white/50">Loading history…</p>
        ) : isError ? (
          <p className="text-sm text-white/50">
            Couldn&apos;t load the history. Try again later.
          </p>
        ) : !entries?.length ? (
          <p className="text-sm text-white/50">Nothing recorded yet.</p>
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg bg-white/5 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-x-3 text-xs text-white/50">
                  <span className="truncate">
                    {entry.actor.name || "Deleted user"}
                  </span>
                  <time dateTime={entry.at}>
                    {new Date(entry.at).toLocaleString()}
                  </time>
                </div>
                {describe(entry).map((line) => (
                  <div key={line} className="mt-0.5 text-white/85">
                    {line}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
