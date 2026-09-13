"use client";

import React, { useState } from "react";
import { usePartnershipProposals } from "@/features/partnership/hooks/usePartnerships";
import { ProposalList } from "@/features/partnership/components/ProposalList";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export default function PartnershipsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "sent" | "active">("incoming");
  
  // Basic example using the hook, in reality you'd probably fetch differently for incoming vs sent
  // For V1, the backend returns everything for the user based on context
  const { data: proposals = [], isLoading } = usePartnershipProposals();

  const incomingProposals = proposals.filter((p: any) => p.canAccept || p.canReject); // Simplistic filter for incoming
  const sentProposals = proposals.filter((p: any) => p.canWithdraw || p.status === 'pending' && !p.canAccept);
  const activePartnerships = proposals.filter((p: any) => p.status === 'accepted');

  const getActiveList = () => {
    switch (activeTab) {
      case "incoming": return incomingProposals;
      case "sent": return sentProposals;
      case "active": return activePartnerships;
      default: return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Partnerships</h1>
        <p className="text-white/60">Manage your incoming proposals and sent partnership requests.</p>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
            activeTab === "incoming" ? "text-white border-[#ccff00]" : "text-white/50 border-transparent hover:text-white"
          }`}
        >
          Incoming Proposals
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
            activeTab === "sent" ? "text-white border-[#ccff00]" : "text-white/50 border-transparent hover:text-white"
          }`}
        >
          Sent Proposals
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
            activeTab === "active" ? "text-white border-[#ccff00]" : "text-white/50 border-transparent hover:text-white"
          }`}
        >
          Active Partnerships
        </button>
      </div>

      <ProposalList
        proposals={getActiveList()}
        isLoading={isLoading}
        emptyMessage={`No ${activeTab} partnerships found.`}
      />
    </div>
  );
}
