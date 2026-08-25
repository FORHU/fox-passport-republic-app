"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NotificationItem {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    icon: "calendar_month",
    iconBg: "rgba(34,197,94,0.15)",
    iconColor: "#22c55e",
    title: "Booking confirmed",
    body: "Neon Nights Reception on Aug 14",
    time: "2h",
  },
  {
    icon: "manage_accounts",
    iconBg: "rgba(124,58,237,0.15)",
    iconColor: "#7c3aed",
    title: "Role approved",
    body: "You're now a Venue Foxer",
    time: "1d",
  },
  {
    icon: "star",
    iconBg: "rgba(236,72,153,0.15)",
    iconColor: "#ec4899",
    title: "New review",
    body: "Skyline Loft received 5 stars",
    time: "2d",
  },
  {
    icon: "payments",
    iconBg: "rgba(34,197,94,0.15)",
    iconColor: "#22c55e",
    title: "Payout sent",
    body: "₱18,000 transferred to your bank",
    time: "3d",
  },
  {
    icon: "campaign",
    iconBg: "rgba(59,130,246,0.15)",
    iconColor: "#3b82f6",
    title: "Platform update",
    body: "New Map View is live on Search",
    time: "5d",
  },
];

export default function MobileNotificationList() {
  const router = useRouter();

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Nav bar */}
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
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
            arrow_back
          </span>
        </button>
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Notifications
        </p>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            check
          </span>
        </button>
      </div>

      {/* Notification list */}
      <div style={{ padding: "142px 20px 112px" }}>
        {NOTIFICATIONS.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              paddingTop: 16,
              paddingBottom: 16,
              borderBottom:
                i < NOTIFICATIONS.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: item.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: item.iconColor }}
              >
                {item.icon}
              </span>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
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
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </div>

            {/* Time */}
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                paddingTop: 2,
                fontWeight: 700,
              }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
