"use client";

import React from "react";
import { FEATURES } from "./constants";
import { SectionLabel } from "./SectionLabel";

export function MobileWhySection() {
  return (
    <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
      <SectionLabel>Why FoxPassport?</SectionLabel>
      <div
        className="no-scrollbar"
        style={{ display: "flex", gap: 12, overflowX: "auto" }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: 180,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "#111318",
              padding: "18px 16px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: f.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 22, color: f.color }}
              >
                {f.icon}
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {f.title}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
        <div style={{ flexShrink: 0, width: 6 }} />
      </div>
    </div>
  );
}
