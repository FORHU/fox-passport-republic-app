"use client";

import React from "react";
import { useStripeConnect } from "@/hooks/dashboards/useStripeConnect";
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

function StatusBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <CheckCircle size={14} className="text-[#ccff00]" />
      ) : (
        <AlertCircle size={14} className="text-white/30" />
      )}
      <span className={`text-xs ${enabled ? "text-white" : "text-white/40"}`}>{label}</span>
    </div>
  );
}

export default function StripeConnectSection() {
  const { status, loading, onboarding, error, startOnboarding } = useStripeConnect();

  const isComplete = status?.stripeOnboardingComplete &&
    status?.stripeChargesEnabled &&
    status?.stripePayoutsEnabled;

  const router = useRouter();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#635bff]/20 border border-[#635bff]/30 flex items-center justify-center">
            <span className="text-lg">💳</span>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Stripe Payouts</h3>
            <p className="text-xs text-white/40">Receive payments directly to your bank</p>
          </div>
        </div>

        {/* Overall status pill */}
        {!loading && status && (
          <span
            className={`text-xs px-3 py-1 rounded-full border font-medium ${
              isComplete
                ? "text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/20"
                : status.hasStripeAccount
                ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                : "text-white/40 bg-white/5 border-white/10"
            }`}
          >
            {isComplete ? "Active" : status.hasStripeAccount ? "Pending" : "Not Connected"}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-white/40 text-sm py-2">
          <Loader2 size={14} className="animate-spin" />
          Checking status...
        </div>
      )}

      {/* Status breakdown */}
      {!loading && status && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-3">
            <StatusBadge enabled={status.hasStripeAccount} label="Account" />
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <StatusBadge enabled={status.stripeChargesEnabled} label="Charges" />
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <StatusBadge enabled={status.stripePayoutsEnabled} label="Payouts" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-4 text-xs">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* CTA */}
      {!loading && (
        <>
          {!isComplete ? (
            <button
              onClick={() => router.push("/host/stripe-onboard")}
              disabled={onboarding}
              className="w-full flex items-center justify-center gap-2 bg-[#635bff] hover:bg-[#5b53f5] text-white text-sm font-semibold py-2.5 rounded-full transition disabled:opacity-50"
            >
              {onboarding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ExternalLink size={14} />
              )}
              {status?.hasStripeAccount ? "Continue Onboarding" : "Connect Stripe"}
            </button>
          ) : (
            <button
              onClick={() => router.push("/host/stripe-dashboard")}
              className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-black text-sm font-semibold py-2.5 rounded-full hover:bg-[#b8e600] transition"
            >
              <CheckCircle size={14} />
              View Payout Dashboard
            </button>
          )}
        </>
      )}
    </div>
  );
}