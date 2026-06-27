"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadConnectAndInitialize,
  StripeConnectInstance,
} from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectBalances,
  ConnectPayments,
  ConnectPayouts,
  ConnectNotificationBanner,
  ConnectAccountManagement,
} from "@stripe/react-connect-js";
import api from "@/shared/lib/axios";
import { Loader2, ArrowLeft } from "lucide-react";

export default function StripeDashboardClient() {
  const router = useRouter();
  const [stripeConnectInstance, setStripeConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"balances" | "payments" | "payouts" | "account">("balances");

  useEffect(() => {
    async function initStripe() {
      try {
        setLoading(true);
        setError(null);

        const instance = loadConnectAndInitialize({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          fetchClientSecret: async () => {
            const res = await api.post("/stripe-connect/session");
            const secret = res.data?.data?.clientSecret ?? res.data?.clientSecret;
            if (!secret) throw new Error("No client secret returned");
            return secret;
          },
          appearance: {
            overlays: "dialog",
            variables: {
              colorPrimary: "#ccff00",
              colorBackground: "#02040a",
              colorText: "#ffffff",
              borderRadius: "12px",
              fontFamily: "inherit",
            },
          },
        });

        setStripeConnectInstance(instance);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to initialize Stripe";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    initStripe();
  }, []);

  const tabs = [
    { id: "balances", label: "Balances", icon: "💵" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "payouts", label: "Payouts", icon: "📤" },
    { id: "account", label: "Account", icon: "⚙️" },
  ] as const;

  return (
    <div
      className="bg-[#02040a] text-white min-h-screen font-body antialiased"
      style={{
        background:
          "radial-gradient(circle at 15% 50%, rgba(124,58,237,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(219,39,119,0.1) 0%, transparent 40%), #02040a",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-12">
        <button
          onClick={() => router.push("/creator-dashboard")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#635bff]/20 border border-[#635bff]/30 flex items-center justify-center">
              <span className="text-lg">💳</span>
            </div>
            <h1 className="text-2xl font-display font-bold">Payouts Dashboard</h1>
          </div>
          <p className="text-white/50 text-sm">
            Manage your balances, payments, and payouts.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#ccff00]" size={32} />
          </div>
        )}

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && stripeConnectInstance && (
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <div className="mb-6">
              <ConnectNotificationBanner />
            </div>

            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-full w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-[#ccff00] text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-4">
              {activeTab === "balances" && <ConnectBalances />}
              {activeTab === "payments" && <ConnectPayments />}
              {activeTab === "payouts" && <ConnectPayouts />}
              {activeTab === "account" && <ConnectAccountManagement />}
            </div>
          </ConnectComponentsProvider>
        )}
      </div>
    </div>
  );
}
