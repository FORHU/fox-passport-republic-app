"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const STUDIO_TABS = [
  "Space Types",
  "Tech & AV",
  "Amenities",
  "Staffing",
] as const;
type StudioTab = (typeof STUDIO_TABS)[number];

const SPACE_TYPES: { icon: string; label: string }[] = [
  { icon: "rooftop", label: "Rooftop" },
  { icon: "yard", label: "Garden" },
  { icon: "celebration", label: "Ballroom" },
  { icon: "pool", label: "Poolside" },
  { icon: "warehouse", label: "Warehouse" },
  { icon: "beach_access", label: "Beachfront" },
  { icon: "radio", label: "Studio" },
  { icon: "local_bar", label: "Rooftop Bar" },
];

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

interface Props {
  venueId?: string;
}

export default function MobileVenueStudio({}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StudioTab>("Space Types");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["Rooftop", "Poolside"]),
  );

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
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
          Venue Studio
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

      {/* Section tabs */}
      <div
        className="no-scrollbar"
        style={{
          position: "fixed",
          top: 126,
          left: 0,
          right: 0,
          zIndex: 4,
          background: "rgba(5,6,8,0.95)",
          display: "flex",
          overflowX: "auto",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {STUDIO_TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0,
                padding: "10px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                color: active ? "#ccff00" : "rgba(255,255,255,0.4)",
                borderBottom: active
                  ? "2px solid #ccff00"
                  : "2px solid transparent",
                marginLeft: tab === "Space Types" ? 12 : 0,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "180px 20px 100px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {SPACE_TYPES.map((item) => {
          const active = selected.has(item.label);
          return (
            <button
              key={item.label}
              onClick={() => toggle(item.label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1.5px solid ${active ? "rgba(204,255,0,0.5)" : "rgba(255,255,255,0.09)"}`,
                background: active
                  ? `${STRIPE_BG}, rgba(204,255,0,0.06)`
                  : "rgba(255,255,255,0.03)",
                borderRadius: 14,
                padding: 12,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  color: active ? "#ccff00" : "rgba(255,255,255,0.35)",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sticky footer CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          padding: "16px 20px 30px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(5,6,8,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <button
          style={{
            width: "100%",
            background: "#ccff00",
            color: "#000",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            borderRadius: 16,
            padding: 16,
            cursor: "pointer",
          }}
        >
          Save &amp; Submit for Review
        </button>
      </div>
    </div>
  );
}
