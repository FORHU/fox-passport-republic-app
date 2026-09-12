"use client";

import React from "react";
import { PartnershipProposal } from "../types/partnership.types";
import { ProposalCard } from "./ProposalCard";

interface ProposalListProps {
  proposals: PartnershipProposal[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function ProposalList({ 
  proposals, 
  isLoading, 
  emptyMessage = "No proposals found." 
}: ProposalListProps) {
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-40"></div>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
        <p className="text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map(proposal => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}
