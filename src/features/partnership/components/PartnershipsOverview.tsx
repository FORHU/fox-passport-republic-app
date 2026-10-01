"use client";

import Link from "next/link";
import { usePartnershipProposals } from "../hooks/usePartnerships";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { Money } from "@/shared/components/ui/Money";
import type { PartnershipProposal } from "../types/partnership.types";

interface PartnershipsOverviewProps {
  /** An Investor sends proposals and registers inventory or capital; an
   * Event or Venue owner only receives them. Changes the CTAs and copy. */
  isInvestor: boolean;
}

/**
 * The partnerships card on the creator dashboard overview — the Investor's
 * main workspace there (they hold no listings, so the rest of the overview
 * is empty for them), and a heads-up for owners with proposals to answer.
 * Same incoming / sent / active split as /creator-dashboard/partnerships.
 */
export function PartnershipsOverview({
  isInvestor,
}: PartnershipsOverviewProps) {
  const { data: proposals = [], isPending } = usePartnershipProposals();

  const incoming = proposals.filter(
    (p: PartnershipProposal) => p.canAccept || p.canReject,
  );
  const sent = proposals.filter(
    (p: PartnershipProposal) => p.status === "pending" && p.canWithdraw,
  );
  const active = proposals.filter(
    (p: PartnershipProposal) => p.status === "accepted",
  );
  const recent = [...proposals]
    .sort(
      (a: PartnershipProposal, b: PartnershipProposal) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);

  // An owner only needs this card while someone is waiting on them.
  if (!isInvestor && !isPending && incoming.length === 0) return null;

  const stats = [
    { label: "Awaiting you", value: incoming.length },
    { label: "Sent, pending", value: sent.length },
    { label: "Active", value: active.length },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0f111a]/60 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981]">
              handshake
            </span>
            Partnerships
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {isInvestor
              ? "Proposals you've sent to events and venues, and the ones they've accepted."
              : "Investors have proposed partnering with your events or venues."}
          </p>
        </div>
        <Link
          href="/creator-dashboard/partnerships"
          className="text-xs font-bold text-[#10b981] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/5 bg-white/3 p-4"
          >
            <p className="text-2xl font-display font-bold text-white">
              {isPending ? "…" : s.value}
            </p>
            <p className="text-[11px] text-white/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {isPending ? (
        <div className="h-20 rounded-2xl bg-white/3 animate-pulse" />
      ) : recent.length === 0 ? (
        <p className="text-sm text-white/50">
          No proposals yet. Browse events and venues open to partners, then
          propose an investment, sponsorship or resource deal from their page.
        </p>
      ) : (
        <ul className="divide-y divide-white/5">
          {recent.map((p: PartnershipProposal) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {p.title}
                </p>
                <p className="text-[11px] text-white/40 capitalize">
                  {p.partnershipType}
                  {p.proposedAmount != null && (
                    <>
                      {" · "}
                      <Money amount={p.proposedAmount} />
                    </>
                  )}
                </p>
              </div>
              <ProposalStatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      )}

      {isInvestor && (
        <div className="flex flex-wrap gap-2 mt-6">
          <Link
            href="/foxer/create-investment"
            className="px-4 py-2 rounded-full bg-[#10b981] text-black text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Register inventory or capital
          </Link>
          <Link
            href="/republic/investments"
            className="px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 transition-colors"
          >
            Open the partner map
          </Link>
        </div>
      )}
    </section>
  );
}
