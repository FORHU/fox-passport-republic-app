"use client";

import Link from "next/link";
import { formatWhen, reasonLabel } from "@/shared/lib/eventEdit";
import type { ConflictIssue } from "@/shared/types/eventEdit";
import { useNeedsAttention } from "@/features/event/hooks/useBookedEvent";

const MAX_EVENTS = 5;

function issueText(i: ConflictIssue): string {
  if (i.reason === "declined") {
    return i.cause === "busy"
      ? `${i.supplierName} is busy with another booking and left. Pick a replacement.`
      : `${i.supplierName} declined. Pick a replacement.`;
  }
  if (i.reason === "date_blocked") {
    return `${i.supplierName} blocked a day of it. Pick another venue or date.`;
  }
  return `${i.itemName} is no longer available. Pick a replacement.`;
}

/**
 * The conflict alert's marker (ADR 0010): each upcoming booked event that lost
 * a Supplier, which one and why, linked to where it is repaired. Renders
 * nothing when every booked event is fine.
 */
export function NeedsAttentionSection({ enabled = true }: { enabled?: boolean }) {
  const { data } = useNeedsAttention(enabled);
  const events = data ?? [];
  if (events.length === 0) return null;
  const shown = events.slice(0, MAX_EVENTS);
  const more = events.length - shown.length;

  return (
    <section
      aria-labelledby="needs-attention-title"
      className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 sm:p-5"
    >
      <h2
        id="needs-attention-title"
        className="flex items-center gap-2 text-sm font-bold text-red-300"
      >
        <span aria-hidden className="material-symbols-outlined text-[18px]">
          warning
        </span>
        Needs your attention
      </h2>
      <ul className="mt-3 space-y-2">
        {shown.map((e) => (
          <li key={e.eventId}>
            <Link
              href={`/creator-dashboard/suppliers/${encodeURIComponent(e.eventId)}`}
              className="block rounded-xl border border-white/10 bg-black/20 p-3 transition-colors hover:border-red-400/40 hover:bg-black/30"
            >
              <p className="text-sm font-bold text-white">
                {e.eventName}
                <span className="ml-2 text-xs font-normal text-white/40">
                  {formatWhen(e.startAt)}
                </span>
              </p>
              <ul className="mt-1 space-y-0.5">
                {e.issues.map((i) => (
                  <li
                    key={`${i.kind}:${i.transactionId}`}
                    className="text-xs text-white/60"
                  >
                    <span className="sr-only">
                      {reasonLabel(i.reason, i.cause)}:{" "}
                    </span>
                    {issueText(i)}
                    {i.pendingProposalId ? (
                      <span className="ml-1 text-accent">
                        Replacement sent, waiting for the citizen.
                      </span>
                    ) : i.replaceBy ? (
                      <span className="ml-1 text-red-300/80">
                        Replace by {formatWhen(i.replaceBy)}.
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <p className="mt-2 text-xs text-white/40">
          {more === 1
            ? "and 1 more event needs a replacement"
            : `and ${more} more need a replacement`}
        </p>
      )}
    </section>
  );
}

export default NeedsAttentionSection;
