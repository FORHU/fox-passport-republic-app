"use client";

import React from "react";
import Link from "next/link";
import { Building2, CalendarDays, Loader2, UserPlus } from "lucide-react";
import { useOpenToOrganizers } from "../hooks/useAppointments";
import type { AppointmentTarget } from "../api/appointments";
import { useAuthStore } from "@/shared/auth/useAuthStore";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * For an approved Organizer: venues and upcoming events whose owners take
 * requests, each with "Offer to organize". Individual Events have no public
 * page to ask from, so this is how an Organizer finds one. Renders nothing
 * for anyone else, or when nothing is open.
 */
export function OpenToOrganizersSection() {
  const isOrganizer = useAuthStore(
    (s) => s.user?.roleType?.includes("organizer") ?? false,
  );
  const { open, offer } = useOpenToOrganizers(isOrganizer);

  if (!isOrganizer || !open.data) return null;
  const rows: {
    key: string;
    target: AppointmentTarget;
    name: string;
    detail: string;
    href: string | null;
    Icon: typeof Building2;
  }[] = [
    ...open.data.venues.map((v) => ({
      key: `venue:${v.id}`,
      target: { type: "venue" as const, id: v.id },
      name: v.name,
      detail: v.city ?? "Venue",
      href: `/venues/${v.id}`,
      Icon: Building2,
    })),
    ...open.data.events.map((e) => ({
      key: `event:${e.id}`,
      target: { type: "event" as const, id: e.id },
      name: e.name,
      detail: [formatDate(e.startAt), e.targetCity].filter(Boolean).join(" · "),
      // Events have no public page of their own.
      href: null,
      Icon: CalendarDays,
    })),
  ];
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="open-to-organizers-heading" className="space-y-3">
      <div>
        <h2
          id="open-to-organizers-heading"
          className="text-xl font-display font-bold text-white"
        >
          Open to Organizers
        </h2>
        <p className="text-xs text-white/50">
          These owners take requests. Offer to help — they decide.
        </p>
      </div>
      <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {rows.map((row) => {
          const sending =
            offer.isPending &&
            offer.variables?.type === row.target.type &&
            offer.variables?.id === row.target.id;
          return (
            <li
              key={row.key}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <row.Icon className="w-5 h-5 text-white/40 shrink-0" />
                <div className="min-w-0">
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="block text-sm font-semibold text-white truncate hover:underline"
                    >
                      {row.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-white truncate">
                      {row.name}
                    </p>
                  )}
                  <p className="text-xs text-white/50 truncate">{row.detail}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={offer.isPending}
                onClick={() => offer.mutate(row.target)}
                aria-label={`Offer to organize ${row.name}`}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e879f9] text-black text-xs font-bold hover:brightness-110 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                Offer
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
