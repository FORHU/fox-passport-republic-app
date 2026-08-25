"use client";

import React from "react";
import Image from "next/image";
import MobileCreatorBottomNav from "./MobileCreatorBottomNav";

const PAYOUT_CHECKLIST = [
  {
    icon: "check_circle",
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.15)",
    title: "Valid Government ID",
    status: "VERIFIED",
    statusColor: "#22c55e",
  },
  {
    icon: "hourglass_top",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.15)",
    title: "Business Permit",
    status: "IN REVIEW",
    statusColor: "#f59e0b",
  },
  {
    icon: "account_balance",
    iconColor: "rgba(255,255,255,0.3)",
    iconBg: "rgba(255,255,255,0.06)",
    title: "Bank / Stripe Connect",
    status: "NOT LINKED",
    statusColor: "rgba(255,255,255,0.3)",
  },
];

const PAYOUTS = [
  { id: 1, name: "Skyline Loft booking", date: "Aug 2", amount: "15,300" },
  { id: 2, name: "Neon Nights event", date: "Jul 28", amount: "22,000" },
  { id: 3, name: "Garden Pavilion", date: "Jul 20", amount: "18,900" },
  { id: 4, name: "Weekend rental", date: "Jul 15", amount: "9,500" },
];

export default function MobileEarningsView() {
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
        {/* Available Balance card */}
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
            ₱64,200
          </p>
          <button
            style={{
              width: "100%",
              background: "#ccff00",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              border: "none",
              borderRadius: 16,
              padding: 14,
              cursor: "pointer",
            }}
          >
            Withdraw
          </button>
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
          {PAYOUT_CHECKLIST.map((item) => (
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
                  {item.status}
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PAYOUTS.map((payout, i) => (
            <div
              key={payout.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom:
                  i < PAYOUTS.length - 1
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
                  {payout.name}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                  }}
                >
                  {payout.date}
                </p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>
                +₱{payout.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <MobileCreatorBottomNav />
    </div>
  );
}
