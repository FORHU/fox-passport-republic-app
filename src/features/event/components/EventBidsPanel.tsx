"use client";

import React from "react";
import { Check, Gavel, Loader2, X } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { useEventBids } from "../hooks/useEventBids";
import type { BidStatus, EventBid } from "../api/bids";

const STATUS_STYLE: Record<BidStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  accepted: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
  withdrawn: "bg-white/10 text-white/50",
};

/**
 * An Event's bids from Talent and Gear Foxers. Whoever may see them - the
 * Owner and their Organizers - may reject one; accepting sets the agreed
 * price, so only the Owner gets that button (ADR 0005). The api enforces
 * both; `canAccept` only hides a button that would be refused.
 */
export function EventBidsPanel({
  eventId,
  canAccept,
}: {
  eventId: string;
  canAccept: boolean;
}) {
  const { bids, accept, reject } = useEventBids(eventId);

  if (bids.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/40">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        Loading bids…
      </div>
    );
  }
  if (bids.isError) {
    return (
      <p className="text-sm text-red-300">
        Couldn&apos;t load bids for this event.
      </p>
    );
  }

  const rows = bids.data ?? [];
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
        <Gavel className="w-6 h-6 mx-auto mb-2 text-white/30" />
        No bids yet. Talent and Gear Foxers can bid on this event&apos;s open
        slots.
      </div>
    );
  }

  const busyId =
    (accept.isPending && accept.variables?.id) ||
    (reject.isPending && reject.variables?.id) ||
    null;

  return (
    <ul className="space-y-3">
      {rows.map((bid) => (
        <BidRow
          key={`${bid.kind}:${bid.id}`}
          bid={bid}
          canAccept={canAccept}
          busy={busyId === bid.id}
          disabled={accept.isPending || reject.isPending}
          onAccept={() => accept.mutate({ kind: bid.kind, id: bid.id })}
          onReject={() => reject.mutate({ kind: bid.kind, id: bid.id })}
        />
      ))}
    </ul>
  );
}

function BidRow({
  bid,
  canAccept,
  busy,
  disabled,
  onAccept,
  onReject,
}: {
  bid: EventBid;
  canAccept: boolean;
  busy: boolean;
  disabled: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const currency = bid.slot?.currency;
  const slotName =
    bid.slot?.description || (bid.kind === "service" ? "Talent slot" : "Gear slot");
  const open = bid.status === "pending" && !bid.slot?.matched;

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">
            {bid.kind === "service" ? "Talent" : "Gear"} · {slotName}
          </p>
          <p className="mt-1 text-sm font-semibold text-white truncate">
            {bid.provider?.name ?? "A Foxer"}
            {bid.offering && (
              <span className="font-normal text-white/50">
                {" "}
                offers {bid.offering.name}
                {bid.kind === "asset" && (bid.proposedQuantity ?? 1) > 1
                  ? ` ×${bid.proposedQuantity}`
                  : ""}
              </span>
            )}
          </p>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[bid.status]}`}
        >
          {bid.status}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="font-bold text-white">
          {formatCurrency(bid.proposedPrice, currency)}
        </span>
        {bid.slot && bid.slot.agreedPrice > 0 && (
          <span className="text-xs text-white/40">
            Budget {formatCurrency(bid.slot.agreedPrice, currency)}
          </span>
        )}
        <span className="text-xs text-white/40">
          {new Date(bid.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {bid.message && (
        <p className="text-sm text-white/70 whitespace-pre-line">
          {bid.message}
        </p>
      )}

      {open && (
        <div className="flex flex-wrap gap-2">
          {canAccept && (
            <button
              type="button"
              onClick={onAccept}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-black text-xs font-bold hover:brightness-110 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Accept
            </button>
          )}
          <button
            type="button"
            onClick={onReject}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs font-bold hover:bg-red-500/25 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </li>
  );
}
