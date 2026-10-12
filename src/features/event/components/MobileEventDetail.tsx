"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Money } from "@/shared/components/ui/Money";

interface MobileEventDetailProps {
  event?: any;
  isPreview?: boolean;
  onShareClick?: () => void;
}

const CATEGORY_PILL: Record<string, { bg: string; color: string }> = {
  Wedding: { bg: "rgba(219,39,119,0.15)", color: "color-mix(in srgb, #db2777 55%, var(--color-white))" },
  Corporate: { bg: "rgba(59,130,246,0.15)", color: "color-mix(in srgb, #3b82f6 55%, var(--color-white))" },
  Birthday: { bg: "rgba(249,115,22,0.15)", color: "color-mix(in srgb, #f97316 55%, var(--color-white))" },
  Social: { bg: "rgba(34,197,94,0.15)", color: "color-mix(in srgb, #22c55e 55%, var(--color-white))" },
  Other: { bg: "rgba(168,85,247,0.15)", color: "color-mix(in srgb, #a855f7 55%, var(--color-white))" },
};

const AVATAR_COLORS = ["#7c3aed", "#db2777", "#f97316", "#3b82f6"];

export default function MobileEventDetail({
  event,
  isPreview,
  onShareClick,
}: MobileEventDetailProps) {
  const router = useRouter();

  // No invented details: anything the template lacks is simply left out.
  const name = event?.name || "Untitled event";
  const category = event?.category || "Other";
  const locationText: string = event?.targetCity || "";
  const maxAttendees: number | null = event?.maxAttendees ?? null;
  const price: number | null = event?.estimatedTotal ?? null;
  const detailLine = [
    locationText,
    maxAttendees ? `Up to ${maxAttendees} guests` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  // The API sends categories lowercase ("birthday"); the colour map is keyed
  // by display name ("Birthday").
  const categoryKey = category.charAt(0).toUpperCase() + category.slice(1);
  const pill = CATEGORY_PILL[categoryKey] ?? CATEGORY_PILL["Other"];

  return (
    <div
      className="relative overflow-hidden pb-28"
      style={{ background: "var(--canvas)", minHeight: "100vh" }}
    >
      {/* Hero — pink gradient + hero image / stripe placeholder */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 420,
          background:
            "linear-gradient(180deg, rgba(219,39,119,0.2) 0%, color-mix(in srgb, var(--canvas) 30%, transparent) 70%, var(--canvas) 100%)",
          pointerEvents: "none",
        }}
      />

      {event?.images?.[0]?.url ? (
        <img
          src={event.images[0].url}
          alt={name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 420,
            width: "100%",
            objectFit: "cover",
            opacity: 0.6,
          }}
        />
      ) : (
        <div className="stripe" style={{ height: 420, width: "100%" }} />
      )}

      {/* Nav bar — transparent overlay, buttons have backdrop blur */}
      <div
        style={{
          position: "absolute",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
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
          style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
        />
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background:
              "color-mix(in srgb, var(--color-black) 40%, transparent)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "var(--color-white)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
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
            color: "var(--color-white)",
          }}
        >
          Event
        </p>
        <button
          onClick={onShareClick}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background:
              "color-mix(in srgb, var(--color-black) 40%, transparent)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "var(--color-white)",
          }}
          aria-label="Share event"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            share
          </span>
        </button>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background:
              "color-mix(in srgb, var(--color-black) 40%, transparent)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "var(--color-white)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            favorite_border
          </span>
        </button>
      </div>

      {/* Glassmorphic info card */}
      <div
        className="absolute inset-x-5"
        style={{
          top: 402,
          background: "color-mix(in srgb, var(--surface) 92%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--color-white) 10%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {/* Category pill */}
        <span
          style={{
            display: "inline-block",
            background: pill.bg,
            color: pill.color,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderRadius: 999,
            padding: "4px 10px",
            marginBottom: 10,
          }}
        >
          {category}
        </span>

        {/* Event name */}
        <h1
          className="font-display"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--color-white)",
            lineHeight: 1.1,
            marginBottom: 6,
          }}
        >
          {name}
        </h1>

        {/* Location */}
        <div
          className="flex items-center gap-1"
          style={{
            color: "color-mix(in srgb, var(--color-white) 50%, transparent)",
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            location_on
          </span>
          <span>{detailLine || "Details coming soon"}</span>
        </div>

        {/* Avatar stack */}
        <div className="flex items-center" style={{ gap: 8, marginBottom: 18 }}>
          <div style={{ display: "flex" }}>
            {AVATAR_COLORS.map((color, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid var(--surface)",
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: 4 - i,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, color: "var(--color-white)" }}
                >
                  person
                </span>
              </div>
            ))}
          </div>
          <span
            style={{
              color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
              fontSize: 11,
            }}
          >
            +42 curated
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p
              style={{
                fontSize: 10,
                color:
                  "color-mix(in srgb, var(--color-white) 40%, transparent)",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              Est. total
            </p>
            <p
              className="font-display"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--accent-text)",
                margin: "2px 0 0",
              }}
            >
              {price ? <Money amount={price} /> : "Price on request"}
            </p>
          </div>
          <button
            disabled={isPreview}
            onClick={() => {
              if (isPreview || !event?.id) return;
              router.push(`/booking/config?templateId=${event.id}`);
            }}
            style={{
              background: isPreview ? "rgba(204,255,0,0.3)" : "#ccff00",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              borderRadius: 999,
              padding: "14px 28px",
              border: "none",
              cursor: isPreview ? "not-allowed" : "pointer",
              boxShadow: isPreview ? "none" : "0 4px 16px rgba(204,255,0,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {isPreview ? "Preview only" : "Reserve"}
          </button>
        </div>
      </div>

      {/* Spacer so scrollable content shows beneath card */}
      <div style={{ marginTop: 402, paddingTop: 280 }} />
    </div>
  );
}
