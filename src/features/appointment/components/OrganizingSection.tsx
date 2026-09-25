"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Check,
  Loader2,
  LogOut,
  ScanLine,
  X,
} from "lucide-react";
import { useMyAppointments } from "../hooks/useAppointments";
import type { MyAppointment } from "../api/appointments";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function targetOf(a: MyAppointment) {
  if (a.event) {
    return {
      name: a.event.name,
      detail: formatDate(a.event.startAt),
      href: `/event/${a.event.id}`,
      // An Event Organizer works its bookings and its suppliers; check-in is
      // linked separately, for everyone.
      manageHref: "/booking?tab=received",
      manageLabel: "Bookings",
      suppliersHref: `/creator-dashboard/suppliers/${a.event.id}` as string | null,
      Icon: CalendarDays,
      noun: "event",
    };
  }
  return {
    name: a.venue?.name ?? "A venue",
    detail: a.venue?.city ?? "",
    href: a.venue ? `/venues/${a.venue.id}` : "#",
    manageHref: a.venue ? `/creator-dashboard/venues/${a.venue.id}/edit` : null,
    manageLabel: "Manage",
    suppliersHref: null as string | null,
    Icon: Building2,
    noun: "venue",
  };
}

/**
 * The Organizer's side of Appointments: invitations to answer, and the Venues
 * and Events they currently help run. Renders nothing when there are neither,
 * so it costs a Foxer who is nobody's Organizer no space at all.
 */
export function OrganizingSection() {
  const { mine, accept, decline, leave, withdraw } = useMyAppointments();
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);

  const rows = mine.data ?? [];
  const invitations = rows.filter((a) => a.state === "invited");
  const teams = rows.filter((a) => a.state === "active");
  const requests = rows.filter((a) => a.state === "requested");

  if (
    mine.isLoading ||
    (invitations.length === 0 && teams.length === 0 && requests.length === 0)
  ) {
    return null;
  }

  const busy =
    accept.isPending ||
    decline.isPending ||
    leave.isPending ||
    withdraw.isPending;

  return (
    <section aria-labelledby="organizing-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="organizing-heading"
            className="text-xl font-display font-bold text-white"
          >
            Organizing
          </h2>
          <p className="text-xs text-white/50">
            Venues and events you help run for someone else.
          </p>
        </div>
        {teams.length > 0 && (
          <Link
            href="/creator-dashboard/check-in"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold hover:bg-[#ccff00]/20 transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5" />
            Check in guests
          </Link>
        )}
      </div>

      {requests.length > 0 && (
        <ul className="space-y-2">
          {requests.map((a) => {
            const t = targetOf(a);
            return (
              <li
                key={a.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <t.Icon className="w-5 h-5 text-white/40 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      You asked to help run{" "}
                      <Link
                        href={t.href}
                        className="font-semibold hover:underline"
                      >
                        {t.name}
                      </Link>
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      Waiting for {a.appointedBy.name || a.appointedBy.email}
                      {a.expiresAt && ` · until ${formatDate(a.expiresAt)}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => withdraw.mutate(a.id)}
                  disabled={busy}
                  aria-label={`Withdraw your request for ${t.name}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 disabled:opacity-50"
                >
                  Withdraw
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {invitations.length > 0 && (
        <ul className="space-y-3">
          {invitations.map((a) => {
            const t = targetOf(a);
            return (
              <li
                key={a.id}
                className="rounded-2xl border border-[#e879f9]/30 bg-[#e879f9]/[0.06] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <t.Icon className="w-5 h-5 text-[#e879f9] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-semibold">
                        {a.appointedBy.name || a.appointedBy.email}
                      </span>{" "}
                      invited you to organize{" "}
                      <Link
                        href={t.href}
                        className="font-semibold underline decoration-white/30 hover:decoration-white"
                      >
                        {t.name}
                      </Link>
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {t.detail && `${t.detail} · `}
                      {a.expiresAt && `Answer by ${formatDate(a.expiresAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => decline.mutate(a.id)}
                    disabled={busy}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-white/80 text-xs font-bold hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => accept.mutate(a.id)}
                    disabled={busy}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#e879f9] text-black text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {accept.isPending && accept.variables === a.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Accept
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {teams.length > 0 && (
        <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          {teams.map((a) => {
            const t = targetOf(a);
            const leaving = confirmLeave === a.id;
            return (
              <li
                key={a.id}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <t.Icon className="w-5 h-5 text-white/40 shrink-0" />
                  <div className="min-w-0">
                    <Link
                      href={t.href}
                      className="block text-sm font-semibold text-white truncate hover:underline"
                    >
                      {t.name}
                    </Link>
                    <p className="text-xs text-white/50 truncate">
                      {a.kind === "organizer" ? "Organizer" : "Check-in Helper"}
                      {" · for "}
                      {a.appointedBy.name || a.appointedBy.email}
                      {t.detail && ` · ${t.detail}`}
                    </p>
                  </div>
                </div>
                {leaving ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmLeave(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Stay
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        leave.mutate(a.id, {
                          onSettled: () => setConfirmLeave(null),
                        })
                      }
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs font-bold hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                    >
                      Leave {t.noun}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                  {a.kind === "organizer" && t.manageHref && (
                    <Link
                      href={t.manageHref}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white/80 hover:bg-white/5 transition-colors"
                    >
                      {t.manageLabel}
                    </Link>
                  )}
                  {a.kind === "organizer" && t.suppliersHref && (
                    <Link
                      href={t.suppliersHref}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white/80 hover:bg-white/5 transition-colors"
                    >
                      Suppliers
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmLeave(a.id)}
                    aria-label={`Leave ${t.name}`}
                    title="Leave"
                    className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
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
