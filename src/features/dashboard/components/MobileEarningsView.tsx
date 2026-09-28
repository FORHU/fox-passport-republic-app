"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileCreatorBottomNav from "./MobileCreatorBottomNav";
import { useStripeConnect } from "../hooks/useStripeConnect";
import {
  fetchMyPayouts,
  PAYOUT_SOURCE_LABEL,
  type Payout,
} from "../api/payouts";
import { formatCurrency } from "@/shared/lib/currency";

const DONE = {
  icon: "check_circle",
  iconColor: "#22c55e",
  iconBg: "rgba(34,197,94,0.15)",
  statusColor: "#22c55e",
};
const WAITING = {
  icon: "hourglass_top",
  iconColor: "#f59e0b",
  iconBg: "rgba(245,158,11,0.15)",
  statusColor: "#f59e0b",
};
const TODO = {
  icon: "account_balance",
  iconColor: "rgba(255,255,255,0.3)",
  iconBg: "rgba(255,255,255,0.06)",
  statusColor: "rgba(255,255,255,0.3)",
};

export default function MobileEarningsView() {
  const { status, loading: stripeLoading } = useStripeConnect();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totals, setTotals] = useState({ paid: 0, pending: 0 });
  const [payoutsLoading, setPayoutsLoading] = useState(true);

  useEffect(() => {
    fetchMyPayouts(1, 10)
      .then((r) => {
        setPayouts(r.payouts);
        setTotals(r.totals);
      })
      .catch(() => {})
      .finally(() => setPayoutsLoading(false));
  }, []);

  const checklist = stripeLoading
    ? []
    : [
        {
          title: "Payout account created",
          ...(status?.hasStripeAccount ? DONE : TODO),
          label: status?.hasStripeAccount ? "DONE" : "NOT STARTED",
        },
        {
          title: "Identity & bank details",
          ...(status?.stripeOnboardingComplete
            ? DONE
            : status?.hasStripeAccount
              ? WAITING
              : TODO),
          label: status?.stripeOnboardingComplete
            ? "COMPLETE"
            : status?.hasStripeAccount
              ? "INCOMPLETE"
              : "NOT STARTED",
        },
        {
          title: "Payouts enabled",
          ...(status?.stripePayoutsEnabled
            ? DONE
            : status?.stripeOnboardingComplete
              ? WAITING
              : TODO),
          label: status?.stripePayoutsEnabled
            ? "ENABLED"
            : status?.stripeOnboardingComplete
              ? "IN REVIEW"
              : "NOT YET",
        },
      ];
  const payoutsReady = !!status?.stripePayoutsEnabled;

  return (
    <div
      className="lg:hidden"
      style={{ background: "#050608", minHeight: "100svh", color: "#fff" }}
    >
      {/* Standard nav bar */}
      <div
        style={{
          position: "fixed",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
          background: "rgba(5,6,8,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Image
          src="/foxonlylogo.png"
          alt="FoxPassport"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Earnings
        </p>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: "142px 20px 100px" }}>
        {/* Pending Payouts card */}
        <div
          style={{
            background: "linear-gradient(135deg,#161616,#0a0a0a)",
            border: "1px solid rgba(204,255,0,0.2)",
            borderRadius: 22,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              margin: "0 0 6px",
            }}
          >
            Available Balance
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
              fontSize: 30,
              fontWeight: 700,
              color: "#ccff00",
              margin: "0 0 16px",
              lineHeight: 1,
            }}
          >
            {payoutsLoading ? "—" : formatCurrency(totals.pending)}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              margin: "0 0 12px",
            }}
          >
            Paid out so far: {payoutsLoading ? "—" : formatCurrency(totals.paid)}
          </p>
          {!payoutsReady && (
            <Link
              href="/creator-dashboard/stripe-onboard"
              style={{
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                width: "100%",
                background: "#ccff00",
                color: "#000",
                fontWeight: 800,
                fontSize: 13,
                borderRadius: 16,
                padding: 14,
              }}
            >
              {status?.hasStripeAccount ? "Finish Payout Setup" : "Connect Bank"}
            </Link>
          )}
        </div>

        {/* Payout Setup */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            margin: "0 0 10px",
          }}
        >
          Payout Setup
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {checklist.map((item) => (
            <div
              key={item.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: item.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    color: item.iconColor,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 2px",
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: item.statusColor,
                    margin: 0,
                  }}
                >
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Payouts */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            margin: "0 0 10px",
          }}
        >
          Recent Payouts
        </p>
        {payoutsLoading ? (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Loading…</p>
        ) : payouts.length === 0 ? (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            No payouts yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {payouts.map((payout, i) => (
              <div
                key={payout.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    i < payouts.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 2px",
                    }}
                  >
                    {PAYOUT_SOURCE_LABEL[payout.sourceType] ?? payout.sourceType}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                      margin: 0,
                    }}
                  >
                    {new Date(payout.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {payout.status}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: payout.status === "failed" ? "#f87171" : "#22c55e",
                  }}
                >
                  {formatCurrency(payout.payoutAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileCreatorBottomNav />
    </div>
  );
}
