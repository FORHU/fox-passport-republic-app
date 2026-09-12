import React from "react";
import { PartnershipProposal } from "../types/partnership.types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { ProposalActions } from "./ProposalActions";

export function ProposalCard({ proposal }: { proposal: PartnershipProposal }) {
  return (
    <div className="bg-[#151821] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-bold text-lg">{proposal.title}</h3>
            <ProposalStatusBadge status={proposal.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <p>
              <span className="font-medium text-white/40">Type:</span>{" "}
              <span className="capitalize">{proposal.partnershipType}</span>
            </p>
            {proposal.proposedAmount != null && (
              <p>
                <span className="font-medium text-white/40">Amount:</span>{" "}
                <span className="text-[#ccff00]">
                  ₱{Number(proposal.proposedAmount).toLocaleString()}
                </span>
              </p>
            )}
            <p>
              <span className="font-medium text-white/40">Submitted:</span>{" "}
              {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="text-white/80 text-sm leading-relaxed mt-2 line-clamp-3">
            {proposal.description}
          </div>
          
          {proposal.proposedBenefits && (proposal.proposedBenefits as any).text && (
            <div className="mt-2 bg-white/5 rounded-lg p-3">
              <p className="text-xs font-medium text-white/40 mb-1">Proposed Benefits</p>
              <p className="text-white/80 text-sm">{(proposal.proposedBenefits as any).text}</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0">
          <ProposalActions proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
