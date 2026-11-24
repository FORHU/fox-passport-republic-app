"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/shared/lib/utils";
import {
  MATCH_DECLINE_NOTE_MAX,
  MATCH_DECLINE_REASONS,
  type MatchDeclineReason,
} from "@/features/gamification/lib/matchDeclineReasons";

interface DeclineMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown under the title: the package and the item. */
  subtitle?: string;
  /**
   * Sends the decline. While it is pending the dialog can't be dismissed; it
   * closes when it resolves and stays open if it rejects (the error shows).
   */
  onDecline: (reason: MatchDeclineReason, note: string) => Promise<void>;
}

/**
 * Why a Provider declines a package invite (api#447): pick a reason, add a
 * note (required for "Other"). The Event Foxer sees it.
 */
export function DeclineMatchDialog({
  open,
  onOpenChange,
  subtitle,
  onDecline,
}: DeclineMatchDialogProps) {
  const [reason, setReason] = React.useState<MatchDeclineReason | null>(null);
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setReason(null);
      setNote("");
      setError(null);
    }
  }, [open]);

  const needsNote = reason === "other" && note.trim().length === 0;
  const canSend = reason !== null && !needsNote && !pending;

  const send = async () => {
    if (!reason || needsNote) return;
    setPending(true);
    setError(null);
    try {
      await onDecline(reason, note.trim());
      onOpenChange(false);
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't send your answer. Try again.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-surface-raised p-6 shadow-[0_10px_35px_rgba(0,0,0,0.25)] focus:outline-none">
          <DialogPrimitive.Title className="font-display text-lg font-bold text-white">
            Why not join this package?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1.5 text-sm text-white/50">
            {subtitle ?? "The Event Foxer sees your reason."}
          </DialogPrimitive.Description>

          <fieldset className="mt-4 flex flex-col gap-2">
            <legend className="sr-only">Reason</legend>
            {MATCH_DECLINE_REASONS.map((r) => (
              <label
                key={r.value}
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 text-sm text-white transition-colors",
                  reason === r.value
                    ? "border-white bg-white/10"
                    : "border-white/10 hover:bg-white/5",
                )}
              >
                <input
                  type="radio"
                  name="match-decline-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="h-4 w-4 accent-white"
                />
                {r.label}
              </label>
            ))}
          </fieldset>

          <label
            htmlFor="match-decline-note"
            className="mt-4 block text-xs font-bold text-white/60"
          >
            Note{" "}
            <span className="text-white/40">
              (optional, required for Other)
            </span>
          </label>
          <textarea
            id="match-decline-note"
            rows={2}
            maxLength={MATCH_DECLINE_NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-invalid={needsNote}
            aria-describedby={
              needsNote ? "match-decline-note-error" : undefined
            }
            className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
          />
          {needsNote && (
            <p
              id="match-decline-note-error"
              className="mt-1 text-xs text-red-400"
            >
              Add a note for Other.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                disabled={pending}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Back
              </button>
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
            >
              Decline request
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
