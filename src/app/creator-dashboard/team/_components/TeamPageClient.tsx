"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Truck,
  Loader2,
  Users,
} from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { TeamPanel } from "@/features/appointment/components/TeamPanel";
import type { AppointmentTarget } from "@/features/appointment/api/appointments";
import { fetchVenuesByHostId } from "@/features/venue/api/venues";
import { fetchOrganizerEvents } from "@/features/event/api/events";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/**
 * One place to add Organizers and Check-in Helpers to everything you own
 * (CONTEXT.md: Appointment). The same panel also sits on each venue's and
 * event's own page, but an Event made without a template has no editor page
 * at all — this is the only route to its team.
 *
 * Composes `appointment`, `venue` and `event` at the app layer, which is why
 * it lives here and not inside any one of them.
 */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Row {
  key: string;
  target: AppointmentTarget;
  name: string;
  detail: string;
}

export default function TeamPageClient() {
  const userId = useAuthStore((s) => s.user?.id);

  const venues = useQuery({
    queryKey: ["host-data", "team", "venues", userId],
    queryFn: () => fetchVenuesByHostId(userId!),
    enabled: !!userId,
  });
  const events = useQuery({
    queryKey: ["host-data", "team", "events", userId],
    queryFn: () => fetchOrganizerEvents(userId!),
    enabled: !!userId,
  });

  // Read once, not on every render.
  const [now] = useState(() => Date.now());
  const venueRows: Row[] = (venues.data ?? []).map((v: any) => ({
    key: `venue:${v.id}`,
    target: { type: "venue", id: v.id },
    name: v.name,
    detail: [v.city, v.status].filter(Boolean).join(" · "),
  }));
  // Only Events that are still to come or running: nobody new can be added
  // to one that is over or cancelled.
  const eventRows: Row[] = (events.data ?? [])
    .filter(
      (e: any) =>
        !["cancelled", "completed"].includes(e.eventStatus) &&
        new Date(e.endAt).getTime() > now,
    )
    .map((e: any) => ({
      key: `event:${e.id}`,
      target: { type: "event", id: e.id },
      name: e.name,
      detail: `${formatDate(e.startAt)} – ${formatDate(e.endAt)}`,
    }));

  const loading = venues.isLoading || events.isLoading;

  return (
    <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
      <DashboardHeader />
      <main className="pt-28 pb-28 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <Link
              href="/creator-dashboard"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-display font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" />
              Team
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Add Organizers and Check-in Helpers to the venues and events you
              own. Prices, payouts, refunds and the team itself stay with you.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              Loading your venues and events…
            </div>
          ) : venueRows.length === 0 && eventRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
              You don&apos;t own any venues or upcoming events yet. Once you do,
              you can add a team to them here.
            </div>
          ) : (
            <>
              <TeamGroup
                title="Your venues"
                Icon={Building2}
                rows={venueRows}
                empty="No venues yet."
              />
              <TeamGroup
                title="Your upcoming and running events"
                Icon={CalendarDays}
                rows={eventRows}
                empty="No upcoming events."
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function TeamGroup({
  title,
  Icon,
  rows,
  empty,
}: {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  rows: Row[];
  empty: string;
}) {
  // One open at a time keeps the page short; the first is open to start.
  const [open, setOpen] = useState<string | null>(rows[0]?.key ?? null);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const isOpen = open === row.key;
            return (
              <li
                key={row.key}
                className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : row.key)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">
                      {row.name}
                    </span>
                    {row.detail && (
                      <span className="block text-xs text-white/40 truncate">
                        {row.detail}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="p-3 sm:p-4 border-t border-white/5 space-y-3">
                    {row.target.type === "event" && (
                      <Link
                        href={`/creator-dashboard/suppliers/${row.target.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white/80 hover:bg-white/5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Suppliers &amp; bids
                      </Link>
                    )}
                    <TeamPanel target={row.target} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
