"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useMyAppointments } from "@/features/appointment/hooks/useAppointments";
import { useConversations } from "@/features/messages/hooks/useMessages";

/**
 * What needs an Organizer's attention right now: invitations to answer,
 * unread messages on the events they help run, and what's coming up next.
 * Composed here because it reads two features (appointment, messages) that
 * may not import each other. Renders nothing for anyone who isn't an
 * Organizer, or when there is nothing to say.
 */
export function OrganizerAttention() {
  const isOrganizer = useAuthStore((s) =>
    (s.user?.roleType ?? []).includes("organizer"),
  );
  const { mine } = useMyAppointments();
  const { data: conversations } = useConversations();
  const [now] = useState(() => Date.now());

  if (!isOrganizer) return null;

  const rows = mine.data ?? [];
  const invitations = rows.filter((a) => a.state === "invited").length;

  const unread = (conversations ?? [])
    .filter(
      (c) =>
        c.isInbox &&
        c.inbox?.type === "event" &&
        c.viewerRole === "team" &&
        c.unreadCount > 0,
    )
    .reduce((sum, c) => sum + c.unreadCount, 0);

  const next = rows
    .filter(
      (a) =>
        a.state === "active" &&
        a.kind === "organizer" &&
        a.event &&
        new Date(a.event.startAt).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.event!.startAt).getTime() -
        new Date(b.event!.startAt).getTime(),
    )[0];

  if (invitations === 0 && unread === 0 && !next) return null;

  const chip =
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-colors";

  return (
    <div
      aria-label="Needs your attention"
      className="flex flex-wrap items-center gap-2"
    >
      {invitations > 0 && (
        <span
          className={`${chip} border-[#e879f9]/30 bg-[#e879f9]/10 text-[#e879f9]`}
        >
          {invitations} invitation{invitations === 1 ? "" : "s"} to answer
        </span>
      )}
      {unread > 0 && (
        <Link
          href="/messages"
          className={`${chip} border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20`}
        >
          {unread} unread message{unread === 1 ? "" : "s"}
        </Link>
      )}
      {next?.event && (
        <Link
          href={`/event/${next.event.id}`}
          className={`${chip} border-white/10 bg-white/5 text-white/70 hover:bg-white/10`}
        >
          Next: {next.event.name} ·{" "}
          {new Date(next.event.startAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </Link>
      )}
    </div>
  );
}
