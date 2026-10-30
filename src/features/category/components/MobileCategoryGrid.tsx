"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LOGO_SRC } from "@/shared/lib/assets";
import { BackButton } from "@/shared/components/ui/BackButton";

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

const CATEGORIES = [
  {
    label: "Weddings",
    icon: "diamond",
    color: "var(--color-white)",
    gradient: "rgba(255,255,255,0.05)",
  },
  {
    label: "Corporate",
    icon: "business_center",
    color: "var(--color-white)",
    gradient: "rgba(255,255,255,0.05)",
  },
  {
    label: "Birthdays",
    icon: "cake",
    color: "var(--color-white)",
    gradient: "rgba(255,255,255,0.05)",
  },
  {
    label: "Social",
    icon: "people",
    color: "var(--color-white)",
    gradient: "rgba(255,255,255,0.05)",
  },
  {
    label: "Nightlife",
    icon: "nightlife",
    color: "var(--color-white)",
    gradient: "rgba(255,255,255,0.05)",
  },
  {
    label: "Outdoor",
    icon: "park",
    color: "var(--color-white)",
    gradient: "rgba(255,255,255,0.05)",
  },
];

export default function MobileCategoryGrid() {
  const router = useRouter();

  return (
    <div
      className="lg:hidden"
      style={{
        background: "var(--canvas)",
        minHeight: "100svh",
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        color: "var(--color-white)",
        paddingBottom: 112,
        position: "relative",
      }}
    >
      {/* Nav bar */}
      <div
        style={{
          position: "absolute",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
          background: "color-mix(in srgb, var(--canvas) 90%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid color-mix(in srgb, var(--color-white) 8%, transparent)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Image
          src={LOGO_SRC}
          alt="FoxPassport"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <BackButton onClick={() => router.back()} />
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Browse by Vibe
        </p>
      </div>

      {/* Subtitle */}
      <div style={{ padding: "142px 20px 12px" }}>
        <p style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-white) 40%, transparent)", margin: 0 }}>
          Find exactly the kind of night you want
        </p>
      </div>

      {/* 2-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "0 20px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            style={{
              position: "relative",
              height: 120,
              borderRadius: 20,
              overflow: "hidden",
              background: `${STRIPE_BG}, var(--canvas)`,
              border: "1px solid color-mix(in srgb, var(--color-white) 7%, transparent)",
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(160deg, ${cat.gradient} 0%, transparent 70%)`,
              }}
            />
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                fontSize: 22,
                color: cat.color,
              }}
            >
              {cat.icon}
            </span>
            <span
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-white)",
              }}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
