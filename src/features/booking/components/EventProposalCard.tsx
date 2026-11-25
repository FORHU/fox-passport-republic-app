"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import StripePaymentForm from "./StripePaymentForm";
import { useConfirm } from "@/shared/components/ui/ConfirmDialog";
import { apiErrorCode, getApiErrorMessage } from "@/shared/lib/apiError";
import { formatCurrency } from "@/shared/lib/currency";
import { formatWhen, isOpenProposal } from "@/shared/lib/eventEdit";
import type { EventEditProposal } from "@/shared/types/eventEdit";
import {
  useBookingProposalList,
  useBookingReplacement,
  useProposalAnswers,
} from "../hooks/useEventProposals";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

/** Failures after which the proposal is gone or changed: show the latest. */
const REFETCH_ON = new Set([
  "PROPOSAL_PRICE_CHANGED",
  "PROPOSAL_STALE",
  "AVAILABILITY_CONFLICT",
  "BOOKING_NOT_EDITABLE",
  "CHANGE_NOT_APPLIED",
  "PROPOSAL_PENDING",
]);

function priceLine(p: EventEditProposal, paid: boolean): string {
  if (p.type === "reschedule" || p.priceDelta === 0) {
    return "Your total stays the same.";
  }
  const amount = formatCurrency(Math.abs(p.priceDelta));
  if (p.priceDelta > 0) return `Your total goes up by ${amount}.`;
  return paid
    ? `Your total goes down by ${amount}, refunded to your card.`
    : `Your total goes down by ${amount}.`;
}

/**
 * On a booked package event's booking page (ADR 0010): a Supplier that can't
 * make it and by when the host must replace it, and the host's proposal to
 * swap a Supplier or move the date. The citizen accepts or declines; a paid
 * booking whose total goes up pays the difference first. The host sees the
 * same card without the buttons. Renders nothing when all is well.
 */
export function EventProposalCard({
  bookingId,
  isCitizen,
  canCancel,
  onCancel,
}: {
  bookingId: string;
  /** The booking's citizen answers; anyone else (the host) only sees it. */
  isCitizen: boolean;
  canCancel: boolean;
  onCancel: () => void;
}) {
  const replacement = useBookingReplacement(bookingId, true);
  const proposals = useBookingProposalList(bookingId, true);
  const { accept, decline, confirmPayment, refresh } =
    useProposalAnswers(bookingId);
  const { confirm, dialog } = useConfirm();
  const [payment, setPayment] = useState<{
    proposalId: string;
    clientSecret: string;
    amount: number;
  } | null>(null);

  const status = replacement.data;
  const open = (proposals.data ?? []).find((p) => isOpenProposal(p));
  const paid = status ? !status.unpaid : false;
  const busy = accept.isPending || decline.isPending || confirmPayment.isPending;

  const fail = async (err: unknown, fallback: string) => {
    toast.error(getApiErrorMessage(err, fallback));
    const code = apiErrorCode(err);
    if (code && REFETCH_ON.has(code)) {
      setPayment(null);
      await refresh();
    }
  };

  const finish = async (proposalId: string) => {
    try {
      await confirmPayment.mutateAsync(proposalId);
      setPayment(null);
      toast.success("Accepted. The change is applied.");
      await refresh();
    } catch (err) {
      if (apiErrorCode(err) === "PAYMENT_NOT_COMPLETE") {
        toast.error("Your payment hasn't gone through yet. Try again.");
        return;
      }
      await fail(err, "We couldn't apply the change. Try again.");
    }
  };

  const onAccept = async (p: EventEditProposal) => {
    try {
      const result = await accept.mutateAsync(p.id);
      if (result.paymentRequired) {
        if (result.paid) return finish(p.id);
        if (!result.clientSecret) {
          toast.error("We couldn't start the payment. Try again.");
          return;
        }
        setPayment({
          proposalId: p.id,
          clientSecret: result.clientSecret,
          amount: result.amount,
        });
        return;
      }
      toast.success(
        p.type === "reschedule"
          ? "Accepted. Your booking moved to the new date."
          : "Accepted. The new Supplier will confirm.",
      );
      await refresh();
    } catch (err) {
      await fail(err, "We couldn't accept that. Try again.");
    }
  };

  const onDecline = async (p: EventEditProposal) => {
    const ok = await confirm({
      title:
        p.type === "reschedule" ? "Keep the current date?" : "Decline this change?",
      description: "Your host is told and can propose something else.",
      confirmLabel: "Decline",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await decline.mutateAsync(p.id);
      toast.success("Declined. Your host was told.");
    } catch (err) {
      await fail(err, "We couldn't decline that. Try again.");
    }
  };

  const needsReplacing = status?.items ?? [];
  if (!open && needsReplacing.length === 0) return dialog;

  return (
    <section
      aria-labelledby="event-proposal-title"
      className="glass-panel rounded-3xl border border-white/10 p-6"
    >
      {open ? (
        <>
          <h3
            id="event-proposal-title"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white"
          >
            <span
              aria-hidden
              className="material-symbols-outlined text-[18px] text-accent"
            >
              {open.type === "reschedule" ? "edit_calendar" : "swap_horiz"}
            </span>
            {open.type === "reschedule"
              ? "Your host proposes a new date"
              : "Your host proposes a change"}
          </h3>
          <p className="mt-3 text-sm text-white/80">
            {open.type === "reschedule" ? (
              <>
                Move your event from {formatWhen(open.previousStartAt)} to{" "}
                <span className="font-bold text-white">
                  {formatWhen(open.proposedStartAt)}
                </span>
                .
              </>
            ) : (
              <>
                {open.replacesName || "A Supplier"} can&apos;t be part of your
                event. Your host proposes{" "}
                <span className="font-bold text-white">
                  {open.itemName || "a replacement"}
                </span>{" "}
                instead.
              </>
            )}
          </p>
          {open.note && (
            <p className="mt-2 text-sm italic text-white/60">
              &ldquo;{open.note}&rdquo;
            </p>
          )}
          <p className="mt-2 text-sm text-white/60">{priceLine(open, paid)}</p>
          <p className="mt-1 text-xs text-white/40">
            Answer by {formatWhen(open.expiresAt)}.
          </p>

          {!isCitizen ? (
            <p className="mt-4 text-xs text-white/50">
              Waiting for the citizen to answer.
            </p>
          ) : payment ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-white/60">
                Pay the difference of{" "}
                <span className="font-bold text-white">
                  {formatCurrency(payment.amount)}
                </span>{" "}
                to confirm the change.
              </p>
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: payment.clientSecret }}
              >
                <StripePaymentForm
                  totalAmount={payment.amount}
                  onSuccess={() => finish(payment.proposalId)}
                />
              </Elements>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDecline(open)}
                disabled={busy}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => onAccept(open)}
                disabled={busy}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
              >
                {open.awaitingPayment
                  ? `Pay ${formatCurrency(open.priceDelta)} to confirm`
                  : paid && open.priceDelta > 0
                    ? `Accept and pay ${formatCurrency(open.priceDelta)}`
                    : "Accept"}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <h3
            id="event-proposal-title"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white"
          >
            <span
              aria-hidden
              className="material-symbols-outlined text-[18px] text-red-300"
            >
              person_off
            </span>
            A Supplier can&apos;t make it
          </h3>
          {status?.fullRefund ? (
            <p className="mt-3 text-sm text-white/70">
              Your host didn&apos;t find a replacement in time. You can cancel
              this booking for a full refund.
            </p>
          ) : (
            <p className="mt-3 text-sm text-white/70">
              {needsReplacing.map((i) => i.itemName).join(", ")} can&apos;t be
              part of your event.
              {status?.replaceBy
                ? ` Your host has until ${formatWhen(status.replaceBy)} to find a replacement. If they don't, you can cancel for a full refund.`
                : " Your host is finding a replacement."}
            </p>
          )}
          {isCitizen && status?.fullRefund && canCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-4 rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10"
            >
              Cancel for a full refund
            </button>
          )}
        </>
      )}
      {dialog}
    </section>
  );
}

export default EventProposalCard;
