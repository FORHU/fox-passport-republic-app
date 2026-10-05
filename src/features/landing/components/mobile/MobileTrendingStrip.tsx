"use client";

import React from "react";
import { EventTemplate } from "@/shared/api/event-templates";
import { CATEGORY_EMOJI, STRIPE_BG } from "./constants";
import { SectionLabel } from "./SectionLabel";
import { useCurrency } from "@/shared/providers/CurrencyProvider";

interface MobileTrendingStripProps {
  trending: EventTemplate[];
}

function SkeletonCard({
  width = 200,
  height = 120,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        width,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid color-mix(in srgb, var(--color-white) 7%, transparent)",
        background: "var(--surface)",
      }}
    >
      <div style={{ height, background: "color-mix(in srgb, var(--color-white) 4%, transparent)" }} />
      <div style={{ padding: "12px 14px" }}>
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: "color-mix(in srgb, var(--color-white) 7%, transparent)",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 10,
            width: "60%",
            borderRadius: 6,
            background: "color-mix(in srgb, var(--color-white) 4%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

function TemplateCard({ t }: { t: EventTemplate }) {
  const { format } = useCurrency();
  const city = t.templateVenues?.[0]?.venue?.city ?? t.targetCity;
  const price = t.estimatedTotal ?? t.templateVenues?.[0]?.venue?.price;
  const img = t.images?.[0]?.url;

  return (
    <div
      style={{
        flexShrink: 0,
        width: 200,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid color-mix(in srgb, var(--color-white) 7%, transparent)",
        background: "var(--surface)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: 120,
          background: img
            ? undefined
            : `${STRIPE_BG}, linear-gradient(135deg,rgba(124,58,237,0.15) 0%,#111318 100%)`,
          position: "relative",
        }}
      >
        {img && (
          <img
            src={img}
            alt={t.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {t.category && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "color-mix(in srgb, var(--color-black) 55%, transparent)",
              backdropFilter: "blur(8px)",
              borderRadius: 999,
              padding: "3px 9px",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-white)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {CATEGORY_EMOJI[t.category] ?? "✨"} {t.category}
          </span>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--color-white)",
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {t.name}
        </p>
        <p style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-white) 40%, transparent)", margin: 0 }}>
          {[city, price ? format(Number(price)) : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}

export function MobileTrendingStrip({ trending }: MobileTrendingStripProps) {
  return (
    <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
      <SectionLabel>Trending This Week</SectionLabel>
      <div
        className="no-scrollbar"
        style={{ display: "flex", gap: 14, overflowX: "auto" }}
      >
        {trending.length === 0
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          : trending.map((t) => <TemplateCard key={t.id} t={t} />)}
        <div style={{ flexShrink: 0, width: 6 }} />
      </div>
    </div>
  );
}
