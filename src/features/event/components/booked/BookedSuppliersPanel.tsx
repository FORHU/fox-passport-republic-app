"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { formatWhen, reasonLabel } from "@/shared/lib/eventEdit";
import type {
  BookedEventDetail,
  BookedSupplierRow,
} from "@/shared/types/eventEdit";
import { LineItemStatusBadge } from "../LineItemStatusBadge";
import type { LineItemStatus } from "@/features/event/api/marketplaceItems";
import {
  useBookedEventActions,
  useBookingProposals,
} from "@/features/event/hooks/useBookedEvent";
import { ReplacementPickerDialog } from "./ReplacementPickerDialog";
import { RescheduleDialog } from "./RescheduleDialog";

const KIND_LABEL: Record<BookedSupplierRow["kind"], string> = {
  venue: "Venue",
  asset: "Gear",
  service: "Talent / service",
};

/**
 * Every Supplier on one of the host's booked events and where each stands
 * (ADR 0010). A Supplier that needs replacing is marked, with its deadline;
 * the host proposes a replacement or a new date, and the citizen answers.
 * `actions` is where the page puts "Open event chat".
 */
export function BookedSuppliersPanel({
  detail,
  actions,
}: {
  detail: BookedEventDetail;
  actions?: ReactNode;
}) {
  const proposals = useBookingProposals(detail.editableBookingId);
  const { withdraw, declineBooking } = useBookedEventActions();
  const [replacing, setReplacing] = useState<BookedSupplierRow | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [declining, setDeclining] = useState(false);
  // When the page opened; deadlines are compared against it, not re-read per render.
  const [nowMs] = useState(() => Date.now());

  const needs = detail.suppliers.filter((s) => s.reason);
  const proposalById = new Map(
    (proposals.data ?? []).map((p) => [p.id, p] as const),
  );
  const pendingReschedule = detail.pendingReschedule ?? null;
  const canEdit = !!detail.editableBookingId;

  return (
    <div className="space-y-3">
      {needs.length > 0 && (
        <div
          role="status"
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm"
        >
          <p className="font-bold text-red-300">
            This event needs a replacement
          </p>
          <p className="mt-0.5 text-xs text-white/60">
            A Supplier is no longer available for it. Pick a replacement, or
            ask the Supplier.
          </p>
        </div>
      )}

      {pendingReschedule && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm">
          <p className="text-white/80">
            New date proposed:{" "}
            <span className="font-bold text-white">
              {formatWhen(pendingReschedule.proposedStartAt)}
            </span>
            <span className="block text-xs text-white/50">
              Waiting for the citizen until{" "}
              {formatWhen(pendingReschedule.expiresAt)}.
            </span>
          </p>
          <button
            type="button"
            onClick={() => withdraw.mutate(pendingReschedule.proposalId)}
            disabled={withdraw.isPending}
            className="h-8 rounded-full bg-white/10 px-3 text-xs font-bold text-white/80 hover:bg-white/20 disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>
      )}

      {detail.suppliers.length === 0 ? (
        <p className="text-sm text-white/40">
          No Suppliers are booked for this event yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {detail.suppliers.map((s) => {
            const waiting = s.pendingProposalId
              ? proposalById.get(s.pendingProposalId)
              : undefined;
            return (
              <li
                key={`${s.kind}:${s.transactionId}`}
                data-testid={`booked-row-${s.transactionId}`}
                className={`rounded-xl border p-3 ${
                  s.reason
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                      {KIND_LABEL[s.kind]}
                    </p>
                    <p className="truncate text-sm font-bold text-white">
                      {s.itemName}
                    </p>
                    <p className="truncate text-xs text-white/40">
                      {s.supplierName}
                    </p>
                  </div>
                  <LineItemStatusBadge status={s.status as LineItemStatus} />
                </div>

                {s.reason && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="font-bold text-red-300">
                      {reasonLabel(s.reason, s.cause)}
                    </p>
                    {s.pendingProposalId ? (
                      <p className="text-white/60">
                        Replacement sent, waiting for the citizen
                        {waiting?.itemName ? `: ${waiting.itemName}` : ""}
                        {waiting
                          ? `, new total ${formatCurrency(waiting.proposedPrice)} incl. fees.`
                          : "."}
                      </p>
                    ) : s.replaceBy ? (
                      new Date(s.replaceBy).getTime() > nowMs ? (
                        <p className="text-white/60">
                          Replace by {formatWhen(s.replaceBy)}, or the citizen
                          can cancel for a full refund.
                        </p>
                      ) : (
                        <p className="text-red-300/80">
                          Past the deadline. The citizen can cancel for a full
                          refund.
                        </p>
                      )
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {!s.pendingProposalId && canEdit && (
                        <button
                          type="button"
                          onClick={() => setReplacing(s)}
                          className="h-8 rounded-full bg-accent px-3 text-xs font-bold text-black hover:bg-accent-hover"
                        >
                          Find a replacement
                        </button>
                      )}
                      {s.pendingProposalId && (
                        <button
                          type="button"
                          onClick={() => withdraw.mutate(s.pendingProposalId!)}
                          disabled={withdraw.isPending}
                          className="h-8 rounded-full bg-white/10 px-3 text-xs font-bold text-white/80 hover:bg-white/20 disabled:opacity-50"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {canEdit && !pendingReschedule && (
          <button
            type="button"
            onClick={() => setRescheduling(true)}
            className="h-9 rounded-full border border-white/15 px-4 text-xs font-bold text-white/80 hover:bg-white/10"
          >
            Change date
          </button>
        )}
        {actions}
        {detail.declinableBookingId && (
          <button
            type="button"
            onClick={() => setDeclining(true)}
            className="h-9 rounded-full border border-red-500/40 px-4 text-xs font-bold text-red-400 hover:bg-red-500/10"
          >
            I can&apos;t run this event
          </button>
        )}
      </div>

      {replacing && (
        <ReplacementPickerDialog
          row={replacing}
          open
          onOpenChange={(open) => {
            if (!open) setReplacing(null);
          }}
        />
      )}
      <RescheduleDialog
        eventId={detail.eventId}
        open={rescheduling}
        onOpenChange={setRescheduling}
      />
      <ConfirmDialog
        open={declining}
        onOpenChange={setDeclining}
        tone="danger"
        title="Decline this event?"
        description="The citizen and every Supplier are told, and the booking ends. Nothing was charged. You cannot undo this."
        confirmLabel="Decline this event"
        onConfirm={() =>
          declineBooking.mutateAsync({
            bookingId: detail.declinableBookingId!,
            cause: "other",
          })
        }
        secondaryAction={{
          label: "I'm busy then",
          onConfirm: () =>
            declineBooking.mutateAsync({
              bookingId: detail.declinableBookingId!,
              cause: "busy",
            }),
        }}
      />
    </div>
  );
}

export default BookedSuppliersPanel;
