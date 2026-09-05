/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Foxer } from "@/shared/api/foxers";
import { ROLE_LABELS } from "./constants";
import { SectionLabel } from "./SectionLabel";

interface MobileFoxersStripProps {
  foxers: Foxer[];
}

function FoxerCard({ f }: { f: Foxer }) {
  const role = f.roleType?.[0];
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : "Foxer";
  const rating = f.avgRating ? f.avgRating.toFixed(1) : null;
  const initial = f.name.charAt(0).toUpperCase();
  const imgSrc = f.imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${f.imgId}`
    : null;

  return (
    <div
      style={{
        flexShrink: 0,
        width: 130,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#111318",
        padding: "14px 12px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "2px solid rgba(204,255,0,0.3)",
          overflow: "hidden",
          margin: "0 auto 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7c3aed",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={f.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
            {initial}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 3,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {f.name}
      </p>
      <p
        style={{
          fontSize: 10,
          color: "#ccff00",
          fontWeight: 600,
          marginBottom: rating ? 4 : 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {roleLabel}
      </p>
      {rating && (
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          ★ {rating}
        </p>
      )}
    </div>
  );
}

export function MobileFoxersStrip({ foxers }: MobileFoxersStripProps) {
  return (
    <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
      <SectionLabel>Who&apos;s Vibe Matches Yours?</SectionLabel>
      <div
        className="no-scrollbar"
        style={{ display: "flex", gap: 12, overflowX: "auto" }}
      >
        {foxers.length === 0
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: 130,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "#111318",
                  padding: "14px 12px",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    margin: "0 auto 10px",
                  }}
                />
                <div
                  style={{
                    height: 10,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    height: 9,
                    width: "60%",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    margin: "0 auto",
                  }}
                />
              </div>
            ))
          : foxers.map((f) => <FoxerCard key={f.id} f={f} />)}
        <div style={{ flexShrink: 0, width: 6 }} />
      </div>
    </div>
  );
}
