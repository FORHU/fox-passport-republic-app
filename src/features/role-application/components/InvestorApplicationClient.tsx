"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import {
  Coins,
  Building2,
  Wallet,
  ArrowRight,
  Package,
  Landmark,
} from "lucide-react";
import RequireAuth from "@/shared/auth/RequireAuth";
import Link from "next/link";
import FileUploader from "@/shared/components/layout/FileUploader";
import { ApplicationFlowHeader } from "./ApplicationFlowHeader";

// Same vocabulary CreateInvestmentWizard uses for its two investment
// streams — kept identical here so a declared "interest" always matches the
// modality an approved investor will actually register later, instead of
// drifting into a second, uncoordinated set of category names.
const INTEREST_OPTIONS = [
  {
    value: "physical_inventory",
    label: "Physical Equipment & Inventory Hub",
    desc: "Pool tools and gear (chairs, staging, sound, generators) at a depot for nearby venues to request.",
    icon: Package,
  },
  {
    value: "venue_equity",
    label: "Financial Capital & Venue Equity",
    desc: "Pledge capital against a specific venue for a revenue-share, paid out alongside the Venue Foxer.",
    icon: Landmark,
  },
];

const ACCENT = "#10b981"; // matches ROLE_BADGE.investor ("Partner Foxer")

export default function InvestorApplicationClient() {
  const { mutate: applyRole, isPending } = useApplyRole();

  const [companyName, setCompanyName] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [proofFileId, setProofFileId] = useState("");

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyRole({
      roleType: "investor",
      data: {
        companyName: companyName.trim() || undefined,
        investmentRange: Number(investmentRange),
        interests,
        proofFileId: proofFileId || undefined,
      },
    });
  };

  return (
    <RequireAuth>
      <ApplicationFlowHeader />
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl bg-[#1a1a24] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 blur-[100px] rounded-full pointer-events-none"
            style={{ backgroundColor: `${ACCENT}1a` }}
          />

          <div className="mb-10 text-center relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${ACCENT}33`, color: ACCENT }}
            >
              <Coins size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Apply to be a <span style={{ color: ACCENT }}>Partner Foxer</span>
            </h1>
            <p className="text-white/60">
              Register your interest in supplying equipment or capital to the
              Republic. Once approved, you can register your investment
              stream and start deploying.
            </p>
          </div>

          {/* Every other role application is its own page too — this is the
              one place an investor applicant would otherwise be stuck. */}
          <p className="text-xs text-white/40 text-center -mt-5 mb-8 relative z-10">
            Looking for a different role?{" "}
            <Link
              href="/foxer/apply"
              className="text-white/70 underline hover:text-white"
            >
              Talent, Gear, Performer, or Organizer
            </Link>
            ,{" "}
            <Link
              href="/venue-foxer/apply"
              className="text-white/70 underline hover:text-white"
            >
              Venue Foxer
            </Link>
            , or{" "}
            <Link
              href="/creator-dashboard/apply"
              className="text-white/70 underline hover:text-white"
            >
              Event Foxer
            </Link>
            .
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Company / Organization Name{" "}
                <span className="text-white/30 normal-case font-normal tracking-normal">
                  — optional
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-colors"
                  placeholder="Optional — leave blank if applying as an individual"
                />
              </div>
            </div>

            {/* Investment Range */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Investment Range (₱) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Wallet size={18} />
                </div>
                <input
                  required
                  type="number"
                  min={0}
                  value={investmentRange}
                  onChange={(e) => setInvestmentRange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-colors"
                  placeholder="e.g. 250000"
                />
              </div>
              <p className="text-xs text-white/40">
                A rough figure — how much you're looking to deploy overall.
              </p>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Investment Interests{" "}
                <span className="text-white/30 normal-case font-normal tracking-normal">
                  — pick one or both
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt.value);
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleInterest(opt.value)}
                      className="text-left p-4 rounded-2xl border transition-all"
                      style={{
                        borderColor: selected ? ACCENT : "rgba(255,255,255,0.1)",
                        backgroundColor: selected
                          ? `${ACCENT}14`
                          : "rgba(255,255,255,0.03)",
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: selected ? ACCENT : "rgba(255,255,255,0.4)" }}
                        className="mb-2"
                      />
                      <p className="text-sm font-bold text-white mb-1">
                        {opt.label}
                      </p>
                      <p className="text-xs text-white/40">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proof of Funds */}
            <div className="pt-2">
              <FileUploader
                label="Proof of Funds (optional)"
                accept="image/*,application/pdf"
                onUploadComplete={(id) => setProofFileId(id)}
              />
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-center font-medium"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={isPending || interests.length === 0}
                className="w-full flex-1 flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: ACCENT }}
              >
                {isPending ? "Submitting..." : "Submit Application"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}
