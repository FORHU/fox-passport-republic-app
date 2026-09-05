/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { CATEGORY_EMOJI, STRIPE_BG } from "./constants";
import { SectionLabel } from "./SectionLabel";

interface MobileVibeStripProps {
  categories: any[];
}

export function MobileVibeStrip({ categories }: MobileVibeStripProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
      <SectionLabel>Browse by Vibe</SectionLabel>
      <div
        className="no-scrollbar"
        style={{ display: "flex", gap: 10, overflowX: "auto" }}
      >
        {categories.map((cat: any) => (
          <div
            key={cat.id}
            style={{
              flexShrink: 0,
              borderRadius: 16,
              overflow: "hidden",
              width: 130,
              height: 80,
              position: "relative",
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `${STRIPE_BG},#111318`,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom,transparent 20%,rgba(0,0,0,0.75) 100%)",
              }}
            />
            <p
              style={{
                position: "absolute",
                bottom: 8,
                left: 10,
                right: 10,
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {CATEGORY_EMOJI[cat.title?.toLowerCase()] ?? "✨"} {cat.title}
            </p>
          </div>
        ))}
        <div style={{ flexShrink: 0, width: 6 }} />
      </div>
    </div>
  );
}
