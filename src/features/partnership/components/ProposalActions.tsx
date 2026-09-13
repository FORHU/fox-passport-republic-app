"use client";

import React from "react";
import { PartnershipProposal } from "../types/partnership.types";
import {
  useAcceptPartnershipProposal,
  useRejectPartnershipProposal,
  useWithdrawPartnershipProposal,
} from "../hooks/usePartnerships";
import { usePartnershipCheckoutMutation } from "../hooks/usePartnershipCheckout";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { Check, X, Undo2, CreditCard, Loader2 } from "lucide-react";

export function ProposalActions({ proposal }: { proposal: PartnershipProposal }) {
  const { mutate: accept, isPending: isAccepting } = useAcceptPartnershipProposal();
  const { mutate: reject, isPending: isRejecting } = useRejectPartnershipProposal();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawPartnershipProposal();
  const { mutate: checkout, isPending: isCheckingOut, error: checkoutError } = usePartnershipCheckoutMutation();
  const { user } = useAuthStore();

  const isLoading = isAccepting || isRejecting || isWithdrawing || isCheckingOut;

  // Payment is owed by the partner who proposed it, not the organizer/owner
  // who calls accept — `payment.required` alone is proposal-level, not
  // viewer-scoped, so without this check the *other* party would see a "Pay
  // Now" button too (harmless server-side, since POST .../checkout 403s
  // anyone but the partner, but confusing UI for whoever isn't supposed to
  // pay).
  const isPartner = !!user && proposal.partnerId === user.id;
  const showPaymentAction =
    isPartner && proposal.status === 'accepted' && proposal.payment?.required;
  const paymentStatus = proposal.payment?.status;

  const errorMessage = (checkoutError as any)?.response?.data?.message;

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex gap-2">
        {proposal.canAccept && (
          <button
            onClick={() => accept(proposal.id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        )}
        
        {proposal.canReject && (
          <button
            onClick={() => reject(proposal.id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        )}

        {proposal.canWithdraw && (
          <button
            onClick={() => withdraw(proposal.id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-sm font-medium transition disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            Withdraw
          </button>
        )}

        {showPaymentAction && (
          <>
            {paymentStatus === 'paid' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-sm font-bold">
                <Check className="w-4 h-4" />
                Paid
              </div>
            ) : paymentStatus === 'processing' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
              </div>
            ) : (
              <button
                onClick={() => checkout(proposal.id)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ccff00] hover:bg-[#b3e600] text-black text-sm font-bold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'refunded' ? 'Retry Payment' : 'Pay Now'}
              </button>
            )}
          </>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-left w-full max-w-xs">
          <span className="material-symbols-outlined text-red-400 text-[16px] mt-0.5 shrink-0">
            error
          </span>
          <p className="text-red-400 text-xs font-medium leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}
