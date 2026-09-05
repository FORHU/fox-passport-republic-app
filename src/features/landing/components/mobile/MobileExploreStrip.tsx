"use client";

import React from "react";
import { FEATURE_CARDS, STRIPE_BG } from "./constants";
import { SectionLabel } from "./SectionLabel";

export function MobileExploreStrip() {
  return (
    <div style={{ position: "relative", zIndex: 1, padding: "0 0 36px" }}>
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <SectionLabel>Explore</SectionLabel>
      </div>
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingLeft: 20,
        }}
      >
        {FEATURE_CARDS.map((card, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: 190,
              height: 220,
              borderRadius: 22,
              position: "relative",
              overflow: "hidden",
              background: `${STRIPE_BG},linear-gradient(135deg,${card.accent}22 0%,#111318 100%)`,
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.85) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `${card.accent}33`,
                filter: "blur(16px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: card.tagBg,
                border: `1px solid ${card.tagColor}40`,
                borderRadius: 9999,
                padding: "4px 10px",
                fontSize: 10,
                fontWeight: 700,
                color: card.tagColor,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {card.tag}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 14,
                right: 14,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 4px",
                  lineHeight: 1.2,
                }}
              >
                {card.name}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                {card.meta}
              </p>
            </div>
          </div>
        ))}
        <div style={{ flexShrink: 0, width: 6 }} />
      </div>
    </div>
  );
}
