"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { formatWhen, reasonLabel } from "@/shared/lib/eventEdit";
import {
  useBookedEventActions,
  useReschedulePreview,
} from "@/features/event/hooks/useBookedEvent";
import { BookedDialog, primaryButton, secondaryButton } from "./BookedDialog";

/** "YYYY-MM-DDTHH:MM" (the picker's local time) as an ISO instant, or null. */
export function localToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * "Change date" (ADR 0010 decision 6). The host picks a new start; the event
 * keeps its length. Every Supplier still on it must be free then, and those
 * who aren't partners confirm the new date. Nothing moves until the citizen
 * accepts.
 */
export function RescheduleDialog({
  eventId,
  open,
  onOpenChange,
}: {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { reschedule } = useBookedEventActions();

  // One preview per date the host settles on, not per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(localToIso(value)), 300);
    return () => clearTimeout(t);
  }, [value]);

  const preview = useReschedulePreview(eventId, open ? debounced : null);
  const p = preview.data;
  const reconfirm = p?.lines.filter((l) => l.reconfirm) ?? [];
  const canPropose =
    !!p && p.available && !!debounced && !preview.isFetching;

  const submit = async () => {
    if (!debounced) return;
    try {
      await reschedule.mutateAsync({
        eventId,
        startAt: debounced,
        note: note.trim() || undefined,
      });
      toast.success("Sent. The citizen will answer.");
      setValue("");
      setNote("");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Couldn't propose that date. Try again."),
      );
    }
  };

  return (
    <BookedDialog
      open={open}
      onOpenChange={onOpenChange}
      busy={reschedule.isPending}
      title="Change the date"
      description="Pick a new start. The event keeps its length and its price, and the citizen accepts or declines."
      footer={
        <>
          <button
            type="button"
            className={secondaryButton}
            disabled={reschedule.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={primaryButton}
            disabled={!canPropose || reschedule.isPending}
            onClick={submit}
          >
            {reschedule.isPending ? "Sending…" : "Propose this date"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* A native picker: the event builder's DateTimePicker portals its
            calendar to <body>, which a modal dialog makes unclickable. */}
        <label className="block text-xs font-bold text-white/60">
          New start
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-normal text-white scheme-dark focus:border-accent focus:outline-none"
          />
        </label>

        {!debounced ? (
          <p className="text-xs text-white/40">
            Both the current and the new start must be at least 48 hours away.
          </p>
        ) : preview.isLoading || preview.isFetching ? (
          <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ) : preview.isError ? (
          <p role="alert" className="text-sm text-red-400">
            {getApiErrorMessage(
              preview.error,
              "Couldn't check that date. Try again.",
            )}
          </p>
        ) : p ? (
          <div className="space-y-3" aria-live="polite">
            <p className="text-xs text-white/60">
              {formatWhen(p.currentStartAt)} →{" "}
              <span className="font-bold text-white">
                {formatWhen(p.proposedStartAt)}
              </span>
              <span className="block text-white/40">
                Ends {formatWhen(p.proposedEndAt)}. The price stays the same.
              </span>
            </p>
            <ul className="space-y-1.5">
              {p.lines.map((l) => (
                <li
                  key={`${l.kind}:${l.transactionId}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-xs"
                >
                  <span className="min-w-0 truncate text-white">
                    {l.itemName}
                    <span className="text-white/40"> · {l.supplierName}</span>
                  </span>
                  <span
                    className={
                      l.available
                        ? "shrink-0 text-green-400"
                        : "shrink-0 font-bold text-red-400"
                    }
                  >
                    {l.available ? "Free" : "Busy then"}
                  </span>
                </li>
              ))}
            </ul>
            {!p.available && (
              <p role="alert" className="text-xs text-red-400">
                Pick another date, or replace the busy Suppliers first.
              </p>
            )}
            {p.skipped.length > 0 && (
              <p className="text-xs text-white/50">
                Needs replacing first, on whichever date the event ends up on:{" "}
                {p.skipped
                  .map((s) => `${s.itemName} (${reasonLabel(s.reason)})`)
                  .join(", ")}
                .
              </p>
            )}
            {p.available && (
              <p className="text-xs text-white/50">
                {reconfirm.length === 0
                  ? "Every Supplier is your partner, so they stay booked."
                  : `${reconfirm.map((l) => l.itemName).join(", ")} must confirm the new date within 24 hours of the citizen accepting.`}
              </p>
            )}
            <label className="block text-xs font-bold text-white/60">
              Note to the citizen (optional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={2}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-2 text-sm font-normal text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                placeholder="Why the new date?"
              />
            </label>
          </div>
        ) : null}
      </div>
    </BookedDialog>
  );
}

export default RescheduleDialog;
