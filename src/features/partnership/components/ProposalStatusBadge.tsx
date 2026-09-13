import React from "react";
import { PartnershipProposalStatus } from "../types/partnership.types";

export function ProposalStatusBadge({ status }: { status: PartnershipProposalStatus }) {
  const getBadgeStyle = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-500 border border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-500 border border-red-500/30";
      case "withdrawn":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-white/10 text-white border border-white/20";
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md ${getBadgeStyle()}`}>
      {status}
    </span>
  );
}
