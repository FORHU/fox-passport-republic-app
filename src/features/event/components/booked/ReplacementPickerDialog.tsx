"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Money } from "@/shared/components/ui/Money";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatCurrency } from "@/shared/lib/currency";
import type { BookedSupplierRow } from "@/shared/types/eventEdit";
import {
  useBookedEventActions,
  useReplacements,
} from "@/features/event/hooks/useBookedEvent";
import { BookedDialog, primaryButton, secondaryButton } from "./BookedDialog";

/**
 * "Find a replacement" (ADR 0010): listings like the lost one that are free on
 * the event's dates, partners first. Proposing tells the citizen and posts to
 * the event's chat; nothing changes until they accept.
 */
export function ReplacementPickerDialog({
  row,
  open,
  onOpenChange,
}: {
  row: BookedSupplierRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const candidates = useReplacements(row.transactionId, row.kind, open);
  const { propose } = useBookedEventActions();
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const list = candidates.data ?? [];
  const choice = list.find((c) => c.itemId === picked);

  const submit = async () => {
    if (!choice) return;
    try {
      const proposal = await propose.mutateAsync({
        transactionId: row.transactionId,
        kind: row.kind,
        itemId: choice.itemId,
        note: note.trim() || undefined,
      });
      const delta = proposal.priceDelta;
      const change =
        delta === 0
          ? "The total stays the same."
          : `The total goes ${delta > 0 ? "up" : "down"} by ${formatCurrency(Math.abs(delta))}, to ${formatCurrency(proposal.proposedPrice)} incl. fees.`;
      toast.success(`Sent. The citizen will answer. ${change}`);
      setPicked(null);
      setNote("");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Couldn't send that replacement. Try again."),
      );
    }
  };

  return (
    <BookedDialog
      open={open}
      onOpenChange={onOpenChange}
      busy={propose.isPending}
      title={`Replace ${row.itemName}`}
      description="Listings like it that are free on the event's dates. The citizen accepts or declines your choice."
      footer={
        <>
          <button
            type="button"
            className={secondaryButton}
            disabled={propose.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={primaryButton}
            disabled={!choice || propose.isPending}
            onClick={submit}
          >
            {propose.isPending ? "Sending…" : "Propose"}
          </button>
        </>
      }
    >
      {candidates.isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : candidates.isError ? (
        <p className="text-sm text-red-400">
          {getApiErrorMessage(
            candidates.error,
            "Couldn't load replacements. Try again.",
          )}
        </p>
      ) : list.length === 0 ? (
        <p className="text-sm text-white/50">
          Nothing like it is free on those dates.
        </p>
      ) : (
        <fieldset>
          <legend className="sr-only">Pick a replacement</legend>
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c.itemId}>
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                    picked === c.itemId
                      ? "border-accent bg-accent/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <input
                      type="radio"
                      name="replacement"
                      value={c.itemId}
                      checked={picked === c.itemId}
                      onChange={() => setPicked(c.itemId)}
                      className="accent-accent"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-bold text-white">
                        <span className="truncate">{c.name}</span>
                        {c.partner && (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                            Partner
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-white/40">
                        {c.supplierName}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-white/60">
                    <Money amount={c.price} />
                    <span className="block text-[10px] text-white/30">
                      before fees
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <label className="mt-4 block text-xs font-bold text-white/60">
            Note to the citizen (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-2 text-sm font-normal text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              placeholder="Why this one?"
            />
          </label>
          <p className="mt-2 text-[11px] text-white/40">
            The new total, with your commission and fees, is shown once you
            propose. A partner is booked without confirming; anyone else
            confirms within 24 hours of the citizen accepting.
          </p>
        </fieldset>
      )}
    </BookedDialog>
  );
}

export default ReplacementPickerDialog;
