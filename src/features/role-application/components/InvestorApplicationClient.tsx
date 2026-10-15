"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import { Coins, Building2, Wallet, Package, Landmark } from "lucide-react";
import Link from "next/link";
import FileUploader from "@/shared/components/layout/FileUploader";
import { ApplicationWizard, WizardStep } from "./ApplicationWizard";
import { currencySymbol } from "@/shared/lib/currency";

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

const LABEL = "text-sm font-bold text-white/80 uppercase tracking-wider";
const INPUT =
  "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-colors";
const ICON =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40";

export default function InvestorApplicationClient() {
  const { mutate: applyRole, isPending } = useApplyRole();

  const [companyName, setCompanyName] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [proofFileId, setProofFileId] = useState("");

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const interestLabels = interests
    .map((v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(", ");

  return (
    <ApplicationWizard
      accent={ACCENT}
      icon={<Coins size={32} />}
      title={
        <>
          Apply to be a <span style={{ color: ACCENT }}>Partner Foxer</span>
        </>
      }
      subtitle="Register your interest in supplying equipment or capital to the Republic. Once approved, you can register your investment stream and start deploying."
      // Every other role application is its own page too — this is the one
      // place an investor applicant would otherwise be stuck.
      intro={
        <p className="text-center text-xs text-white/40">
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
      }
      summary={[
        { label: "Company / organization", value: companyName.trim() },
        {
          label: "Investment range",
          value: investmentRange
            ? `${currencySymbol()}${Number(investmentRange).toLocaleString()}`
            : "",
        },
        { label: "Investment interests", value: interestLabels },
        {
          label: "Proof of funds",
          value: proofFileId ? "Uploaded" : "",
        },
      ]}
      agreement="By submitting this application, you confirm the details are accurate and agree to FoxPassport's Partner Foxer policies. Your application will be reviewed by our team."
      isPending={isPending}
      onSubmit={() =>
        applyRole({
          roleType: "investor",
          data: {
            companyName: companyName.trim() || undefined,
            investmentRange: Number(investmentRange),
            interests,
            proofFileId: proofFileId || undefined,
          },
        })
      }
    >
      <WizardStep
        label="About you"
        title="About your investing"
        description="Who is investing and roughly how much."
      >
        <div className="space-y-2">
          <label className={LABEL}>
            Company / Organization Name{" "}
            <span className="font-normal normal-case tracking-normal text-white/30">
              — optional
            </span>
          </label>
          <div className="relative">
            <div className={ICON}>
              <Building2 size={18} />
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={INPUT}
              placeholder="Optional — leave blank if applying as an individual"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL}>
            Investment Range ({currencySymbol()}) *
          </label>
          <div className="relative">
            <div className={ICON}>
              <Wallet size={18} />
            </div>
            <input
              required
              type="number"
              min={0}
              value={investmentRange}
              onChange={(e) => setInvestmentRange(e.target.value)}
              className={INPUT}
              placeholder="e.g. 250000"
            />
          </div>
          <p className="text-xs text-white/40">
            A rough figure — how much you&apos;re looking to deploy overall.
          </p>
        </div>
      </WizardStep>

      <WizardStep
        label="Interests"
        title="What you want to invest in"
        description="Pick one or both. You can register the details after you're approved."
        validate={() =>
          interests.length === 0
            ? "Pick at least one investment interest."
            : null
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INTEREST_OPTIONS.map((opt) => {
            const selected = interests.includes(opt.value);
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleInterest(opt.value)}
                aria-pressed={selected}
                className="cursor-pointer rounded-2xl border p-4 text-left transition-all"
                style={{
                  borderColor: selected
                    ? ACCENT
                    : "color-mix(in srgb, var(--color-white) 10%, transparent)",
                  backgroundColor: selected
                    ? `${ACCENT}14`
                    : "color-mix(in srgb, var(--color-white) 3%, transparent)",
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: selected
                      ? ACCENT
                      : "color-mix(in srgb, var(--color-white) 40%, transparent)",
                  }}
                  className="mb-2"
                />
                <p className="mb-1 text-sm font-bold text-white">{opt.label}</p>
                <p className="text-xs text-white/40">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        <FileUploader
          label="Proof of Funds (optional)"
          accept="image/*,application/pdf"
          private
          onUploadComplete={(id) => setProofFileId(id)}
        />
      </WizardStep>
    </ApplicationWizard>
  );
}
