"use client";

import React, { useDeferredValue, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  ScanLine,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useOrganizerSearch, useTeam } from "../hooks/useAppointments";
import type {
  AppointmentKind,
  AppointmentTarget,
  OrganizerCard,
  TeamMember,
} from "../api/appointments";

interface TeamPanelProps {
  /** Null while there is nothing to appoint to yet — e.g. an Event not yet scheduled. */
  target: AppointmentTarget | null;
  /** Shown when `target` is null. */
  unavailableMessage?: string;
}

const KIND_COPY: Record<
  AppointmentKind,
  { label: string; badge: string; hint: string; button: string }
> = {
  organizer: {
    label: "Organizer",
    badge: "Organizer",
    hint: "An approved Organizer who helps you run this. Find them by name or city, or type their email. They must accept your invitation, which expires after 14 days. Prices, payouts, refunds and the team stay with you.",
    button: "Send Invitation",
  },
  check_in_helper: {
    label: "Check-in Helper",
    badge: "Check-In",
    hint: "Anyone, added straight away, who can only check guests in at the door.",
    button: "Add Helper",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function pastLabel(member: TeamMember) {
  switch (member.state) {
    case "expired":
      return "Invitation expired";
    case "declined":
      return "Declined";
    case "finished":
      return "Event over";
    default:
      return member.endReason === "left"
        ? "Left"
        : member.endReason === "role_revoked"
          ? "Organizer role removed"
          : "Removed";
  }
}

/**
 * The Mayor's or Event Owner's team for one Venue or Event: invite Organizers,
 * add Check-in Helpers, and remove either. Only they can see or change it.
 */
export function TeamPanel({ target, unavailableMessage }: TeamPanelProps) {
  const { team, add, remove, settings, toggleRequests, answerRequest } =
    useTeam(target);
  const [kind, setKind] = useState<AppointmentKind>("organizer");
  const [email, setEmail] = useState("");
  const [showPast, setShowPast] = useState(false);
  // For an Organizer the box also searches by name or city; an email still
  // invites directly. A Check-in Helper is anyone, so it stays email only.
  const searchTerm = useDeferredValue(kind === "organizer" ? email : "");
  const search = useOrganizerSearch(searchTerm);
  const isEmail = email.includes("@");

  const members = team.data ?? [];
  const active = members.filter((m) => m.state === "active");
  const invited = members.filter((m) => m.state === "invited");
  const requests = members.filter((m) => m.state === "requested");
  const past = members.filter(
    (m) => !["active", "invited", "requested"].includes(m.state),
  );
  const onTeamIds = new Set(
    [...active, ...invited, ...requests].map((m) => m.userId),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    add.mutate(
      { kind, email: trimmed },
      { onSuccess: () => setEmail("") },
    );
  };

  const inviteFound = (card: OrganizerCard) =>
    add.mutate(
      { kind: "organizer", userId: card.id, label: card.name },
      { onSuccess: () => setEmail("") },
    );

  const busy = add.isPending || remove.isPending || answerRequest.isPending;
  const accepting = settings.data?.acceptsOrganizerRequests ?? false;

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f111a] p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-white text-lg">
            Organizers &amp; Helpers
          </h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed max-w-xl">
          You&apos;re always an organizer of what you own. Add people to help
          you run it.
        </p>
      </div>

      {!target ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/50">
          <AlertCircle className="w-4 h-4 text-yellow-400/80 shrink-0" />
          <span>
            {unavailableMessage ??
              "You can add organizers and helpers once this is scheduled."}
          </span>
        </div>
      ) : (
        <div className="space-y-5">
          <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <span>
              <span className="block text-sm font-semibold text-white">
                Accept requests from Organizers
              </span>
              <span className="block text-xs text-white/40 mt-0.5">
                Approved Organizers can ask to join from this page. You decide
                on every request.
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={accepting}
              aria-label="Accept requests from Organizers"
              disabled={settings.isLoading || toggleRequests.isPending}
              onClick={() => toggleRequests.mutate(!accepting)}
              className={`relative shrink-0 h-6 w-11 p-0 rounded-full transition-colors disabled:opacity-50 ${accepting ? "bg-accent" : "bg-white/15"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform ${accepting ? "translate-x-5 bg-black" : "translate-x-0 bg-white/70"}`}
              />
            </button>
          </label>

          {requests.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#e879f9] mb-2">
                Requests to join
              </p>
              <ul className="divide-y divide-white/5 rounded-2xl border border-[#e879f9]/20 overflow-hidden">
                {requests.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#e879f9]/[0.04]"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {m.user.name || "Organizer"}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {m.user.email}
                        {m.expiresAt && (
                          <span className="text-white/30">
                            {" "}
                            · Expires {formatDate(m.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          answerRequest.mutate({ id: m.id, accept: false })
                        }
                        disabled={busy}
                        aria-label={`Decline ${m.user.name || m.user.email}`}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          answerRequest.mutate({ id: m.id, accept: true })
                        }
                        disabled={busy}
                        aria-label={`Accept ${m.user.name || m.user.email}`}
                        className="px-3 py-1.5 rounded-lg bg-accent text-black text-xs font-bold hover:bg-accent/90 disabled:opacity-50"
                      >
                        Accept
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div
              role="radiogroup"
              aria-label="What they'll do"
              className="flex bg-white/5 p-1 rounded-xl"
            >
              {(Object.keys(KIND_COPY) as AppointmentKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    kind === k
                      ? "bg-accent text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {KIND_COPY[k].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              {KIND_COPY[kind].hint}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type={kind === "organizer" ? "text" : "email"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  kind === "organizer"
                    ? "Search Organizers by name or city, or type an email"
                    : "Their email address"
                }
                aria-label={
                  kind === "organizer"
                    ? "Search Organizers or enter an email"
                    : "Email address"
                }
                disabled={busy}
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent/30 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={busy || !isEmail}
                className="px-4 py-2.5 rounded-xl bg-accent text-black text-xs font-bold hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
              >
                {add.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{KIND_COPY[kind].button}</span>
              </button>
            </div>
            {kind === "organizer" && !isEmail && email.trim().length >= 2 && (
              <OrganizerResults
                loading={search.isFetching}
                results={search.data ?? []}
                onTeamIds={onTeamIds}
                onInvite={inviteFound}
                disabled={busy}
              />
            )}
          </form>

          {team.isLoading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-white/40">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Loading your team…</span>
            </div>
          ) : team.isError ? (
            <div className="py-6 text-center text-xs text-red-300/80 border border-dashed border-red-500/20 rounded-2xl">
              Couldn&apos;t load your team. Try refreshing the page.
            </div>
          ) : active.length === 0 && invited.length === 0 ? (
            <div className="py-6 text-center text-xs text-white/40 border border-dashed border-white/5 rounded-2xl">
              No one else yet — only you can run this.
            </div>
          ) : (
            <div className="space-y-4">
              <MemberList
                title="On the team"
                members={active}
                actionLabel="Remove"
                onAction={(m) => remove.mutate(m.id)}
                disabled={busy}
                note={(m) =>
                  m.respondedAt ? `Since ${formatDate(m.respondedAt)}` : null
                }
              />
              <MemberList
                title="Waiting for an answer"
                members={invited}
                actionLabel="Withdraw"
                onAction={(m) => remove.mutate(m.id)}
                disabled={busy}
                note={(m) =>
                  m.expiresAt ? `Expires ${formatDate(m.expiresAt)}` : null
                }
              />
            </div>
          )}

          {past.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowPast((v) => !v)}
                aria-expanded={showPast}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showPast ? "rotate-180" : ""}`}
                />
                Past ({past.length})
              </button>
              {showPast && (
                <div className="mt-3">
                  <MemberList
                    members={past}
                    note={pastLabel}
                    muted
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberList({
  title,
  members,
  actionLabel,
  onAction,
  disabled,
  note,
  muted,
}: {
  title?: string;
  members: TeamMember[];
  actionLabel?: string;
  onAction?: (m: TeamMember) => void;
  disabled?: boolean;
  note?: (m: TeamMember) => string | null;
  muted?: boolean;
}) {
  if (members.length === 0) return null;
  return (
    <div>
      {title && (
        <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">
          {title}
        </p>
      )}
      <ul className="divide-y divide-white/5 rounded-2xl border border-white/5 overflow-hidden">
        {members.map((m) => {
          const name = m.user.name || m.user.email;
          const isOrganizer = m.kind === "organizer";
          const detail = note?.(m);
          return (
            <li
              key={m.id}
              className={`flex items-center justify-between gap-3 p-3.5 bg-white/[0.02] ${muted ? "opacity-60" : "hover:bg-white/[0.04]"} transition-colors`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                  {name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {m.user.name || "Citizen"}
                  </div>
                  <div className="text-xs text-text-muted truncate">
                    {m.user.email}
                    {detail && <span className="text-white/30"> · {detail}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {isOrganizer ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    <ScanLine className="w-3 h-3" />
                  )}
                  {KIND_COPY[m.kind].badge}
                </span>
                {onAction && actionLabel && (
                  <button
                    type="button"
                    onClick={() => onAction(m)}
                    disabled={disabled}
                    aria-label={`${actionLabel} ${name}`}
                    title={actionLabel}
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Organizers the search found, each with an Invite button. */
function OrganizerResults({
  loading,
  results,
  onTeamIds,
  onInvite,
  disabled,
}: {
  loading: boolean;
  results: OrganizerCard[];
  onTeamIds: Set<string>;
  onInvite: (card: OrganizerCard) => void;
  disabled: boolean;
}) {
  if (loading && results.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40 px-1">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
        Searching Organizers…
      </div>
    );
  }
  if (results.length === 0) {
    return (
      <p className="text-xs text-white/40 px-1">
        No approved Organizers match. You can still invite someone by email.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {results.map((card) => {
        const already = onTeamIds.has(card.id);
        return (
          <li
            key={card.id}
            className="flex items-center justify-between gap-3 p-3 bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#e879f9]/10 border border-[#e879f9]/20 flex items-center justify-center text-[#e879f9] text-xs font-bold overflow-hidden">
                {card.imgId ? (
                  <img src={card.imgId} alt="" className="w-full h-full object-cover" />
                ) : (
                  card.name[0]?.toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {card.name}
                  <span className="ml-2 text-[10px] font-bold text-[#e879f9]">
                    Lv {card.level}
                  </span>
                </div>
                <div className="text-xs text-white/40 truncate">
                  {[card.city, ...card.specializations.map(labelFor)]
                    .filter(Boolean)
                    .join(" · ") || "Organizer"}
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={disabled || already}
              onClick={() => onInvite(card)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-accent text-black text-xs font-bold hover:bg-accent/90 disabled:opacity-40"
            >
              {already ? "On the team" : "Invite"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** `beach_resort` → "Beach resort". */
function labelFor(category: string) {
  const words = category.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
