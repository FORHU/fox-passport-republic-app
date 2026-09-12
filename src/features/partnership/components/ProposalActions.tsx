"use client";

import React from "react";
import { PartnershipProposal } from "../types/partnership.types";
import {
  useAcceptPartnershipProposal,
  useRejectPartnershipProposal,
  useWithdrawPartnershipProposal,
} from "../hooks/usePartnerships";
import { Check, X, Undo2 } from "lucide-react";

export function ProposalActions({ proposal }: { proposal: PartnershipProposal }) {
  const { mutate: accept, isPending: isAccepting } = useAcceptPartnershipProposal();
  const { mutate: reject, isPending: isRejecting } = useRejectPartnershipProposal();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawPartnershipProposal();

  const isLoading = isAccepting || isRejecting || isWithdrawing;

  return (
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
    </div>
  );
}
