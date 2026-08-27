/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MobileEventDetailProps {
  event?: any;
  isPreview?: boolean;
}

const CATEGORY_PILL: Record<string, { bg: string; color: string }> = {
  Wedding: { bg: "rgba(219,39,119,0.15)", color: "#f472b6" },
  Corporate: { bg: "rgba(59,130,246,0.15)", color: "#93c5fd" },
  Birthday: { bg: "rgba(249,115,22,0.15)", color: "#fdba74" },
  Social: { bg: "rgba(34,197,94,0.15)", color: "#86efac" },
  Other: { bg: "rgba(168,85,247,0.15)", color: "#d8b4fe" },
};

const AVATAR_COLORS = ["#7c3aed", "#db2777", "#f97316", "#3b82f6"];

export default function MobileEventDetail({
  event,
  isPreview,
}: MobileEventDetailProps) {
  const router = useRouter();

  const name = event?.name ?? "Neon Nights: Rooftop Reception";
  const category = event?.category ?? "Wedding";
  const locationText = event?.targetCity ?? "Baguio City";
  const maxAttendees = event?.maxAttendees ?? 120;
  const price = event?.estimatedTotal ?? 48500;

  const pill = CATEGORY_PILL[category] ?? CATEGORY_PILL["Other"];

  return (
    <div
      className="relative overflow-hidden pb-28"
      style={{ background: "#050608", minHeight: "100vh" }}
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
            "linear-gradient(180deg, rgba(219,39,119,0.2) 0%, rgba(5,6,8,0.3) 70%, #050608 100%)",
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
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "#fff",
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
            color: "#fff",
          }}
        >
          Event
        </p>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            color: "#fff",
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
          background: "rgba(18,18,24,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
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
            color: "#fff",
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
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            location_on
          </span>
          <span>
            {locationText} · Up to {maxAttendees} guests
          </span>
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
                  border: "2px solid rgba(18,18,24,0.9)",
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
                  style={{ fontSize: 14, color: "#fff" }}
                >
                  person
                </span>
              </div>
            ))}
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
            +42 curated
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
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
                color: "#ccff00",
                margin: "2px 0 0",
              }}
            >
              ₱{price.toLocaleString()}
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
              boxShadow: isPreview
                ? "none"
                : "0 4px 16px rgba(204,255,0,0.35)",
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
