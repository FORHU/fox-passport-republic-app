"use client";

import React from "react";
import { Check, Loader2, UserPlus, X } from "lucide-react";
import { useJoinRequest } from "../hooks/useAppointments";
import type { AppointmentTarget } from "../api/appointments";

/**
 * On a Venue's or Event's own page: lets an approved Organizer ask to join
 * its team (CONTEXT.md: Appointment). Shows only where it means something —
 * to an Organizer, on something whose owner has switched requests on — and
 * otherwise renders nothing, so it costs everyone else no space.
 */
export function JoinRequestButton({
  target,
  isOrganizer,
  className = "",
}: {
  target: AppointmentTarget;
  /** Whether the viewer holds the Organizer role; nobody else is asked. */
  isOrganizer: boolean;
  className?: string;
}) {
  const { status, request, withdraw } = useJoinRequest(target, isOrganizer);
  if (!isOrganizer || !status.data) return null;

  const { canRequest, reason, appointmentId } = status.data;
  const noun = target.type === "venue" ? "venue" : "event";

  if (reason === "requested" && appointmentId) {
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-2xl border border-[#e879f9]/30 bg-[#e879f9]/[0.06] p-4 ${className}`}
      >
        <p className="text-sm text-white flex items-center gap-2">
          <Check className="w-4 h-4 text-[#e879f9]" />
          Request sent — waiting for the owner.
        </p>
        <button
          type="button"
          disabled={withdraw.isPending}
          onClick={() => withdraw.mutate(appointmentId)}
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          Withdraw
        </button>
      </div>
    );
  }

  if (!canRequest) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}
    >
      <div>
        <p className="text-sm font-semibold text-white">
          Help run this {noun}
        </p>
        <p className="text-xs text-white/50">
          This {noun} takes requests from Organizers. The owner decides.
        </p>
      </div>
      <button
        type="button"
        disabled={request.isPending}
        onClick={() => request.mutate()}
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#e879f9] text-black text-xs font-bold hover:brightness-110 disabled:opacity-50"
      >
        {request.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <UserPlus className="w-3.5 h-3.5" />
        )}
        Offer to organize
      </button>
    </div>
  );
}
