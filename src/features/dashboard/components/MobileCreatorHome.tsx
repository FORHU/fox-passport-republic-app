"use client";

import React from "react";
import MobileCreatorBottomNav from "./MobileCreatorBottomNav";
import { DashboardHeader } from "./DashboardHeader";

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

const KPI_CARDS = [
  {
    label: "REVENUE",
    value: "₱82k",
    icon: "payments",
    iconColor: "#ccff00",
    iconBg: "rgba(204,255,0,0.12)",
  },
  {
    label: "BOOKINGS",
    value: "14",
    icon: "calendar_month",
    iconColor: "#f472b6",
    iconBg: "rgba(244,114,182,0.12)",
  },
];

const PENDING = [
  { id: 1, name: "Skyline Loft", subtitle: "Venue booking request · 2h ago" },
  { id: 2, name: "DJ Marco", subtitle: "Event crew inquiry · 5h ago" },
];

interface MobileCreatorHomeProps {
  user: any;
}

export default function MobileCreatorHome({ user }: MobileCreatorHomeProps) {
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Creator";

  return (
    <div
      className="lg:hidden"
      style={{ background: "#050608", minHeight: "100svh", color: "#fff" }}
    >
      {/* Same DashboardHeader the desktop creator dashboard uses — MobileCreatorHome
          used to draw its own bespoke top bar here, which meant "Creator Studio"
          looked like a different app depending on screen size. Bottom nav comes
          from MobileCreatorBottomNav below instead, since it has a different tab
          set than DashboardHeader's own. */}
      <DashboardHeader hideMobileBottomNav />

      {/* Scrollable content */}
      <div style={{ padding: "80px 20px 112px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
              fontSize: 26,
              fontWeight: 700,
              margin: "0 0 4px",
              lineHeight: 1.2,
            }}
          >
            Good morning, <span style={{ color: "#ccff00" }}>{firstName}.</span>
          </p>
          <p
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}
          >
            Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* KPI cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {KPI_CARDS.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: "16px 14px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: kpi.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, color: kpi.iconColor }}
                >
                  {kpi.icon}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 2px",
                }}
              >
                {kpi.value}
              </p>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                }}
              >
                {kpi.label}
              </p>
            </div>
          ))}
        </div>

        {/* Pending Requests */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                margin: 0,
              }}
            >
              Pending Requests
            </p>
            <span style={{ fontSize: 11, color: "#ccff00", fontWeight: 600 }}>
              {PENDING.length} new
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PENDING.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Stripe thumbnail */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    overflow: "hidden",
                    background: STRIPE_BG,
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                />
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      margin: "0 0 2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      margin: 0,
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>
                {/* Glass Review button */}
                <button
                  style={{
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 9999,
                    padding: "7px 14px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              margin: "0 0 14px",
            }}
          >
            Quick Actions
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              { icon: "add_circle", label: "New Event", color: "#ccff00" },
              { icon: "apartment", label: "Add Venue", color: "#c4b5fd" },
              { icon: "inventory_2", label: "Add Gear", color: "#93c5fd" },
              {
                icon: "design_services",
                label: "Add Service",
                color: "#fcd34d",
              },
            ].map((action) => (
              <button
                key={action.label}
                style={{
                  background: `${STRIPE_BG}, rgba(255,255,255,0.03)`,
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "16px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, color: action.color }}
                >
                  {action.icon}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <MobileCreatorBottomNav />
    </div>
  );
}
