"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  foxer?: {
    name?: string;
    roleLabel?: string;
    specialization?: string;
    bio?: string;
    matchScore?: number;
    imgSrc?: string;
  };
};

const DEFAULT_FOXER = {
  name: "Maria Santos",
  roleLabel: "Event Foxer",
  specialization: "Weddings",
  bio: "Specializes in rooftop & garden receptions, 62 events curated",
  matchScore: 96,
};

export default function MobileFoxerMatch({ foxer }: Props) {
  const router = useRouter();

  const data = {
    name: foxer?.name ?? DEFAULT_FOXER.name,
    roleLabel: foxer?.roleLabel ?? DEFAULT_FOXER.roleLabel,
    specialization: foxer?.specialization ?? DEFAULT_FOXER.specialization,
    bio: foxer?.bio ?? DEFAULT_FOXER.bio,
    matchScore: foxer?.matchScore ?? DEFAULT_FOXER.matchScore,
    imgSrc: foxer?.imgSrc,
  };

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
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
          Find a Foxer
        </p>
      </div>

      {/* Card stack */}
      <div
        style={{
          marginTop: 144,
          padding: "0 24px",
          position: "relative",
          height: 398,
        }}
      >
        {/* Back card (depth shadow) */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 24,
            right: 8,
            bottom: 0,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 26,
          }}
        />

        {/* Front card */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 16,
            bottom: 20,
            background: "#101018",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Photo area — 60% */}
          <div
            className="stripe"
            style={{ height: "60%", flexShrink: 0, position: "relative" }}
          >
            {data.imgSrc && (
              <img
                src={data.imgSrc}
                alt={data.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              /> // eslint-disable-line @next/next/no-img-element
            )}
            {/* Match score badge */}
            <span
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(34,197,94,0.85)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                padding: "5px 10px",
                borderRadius: 999,
              }}
            >
              {data.matchScore}% Match
            </span>
          </div>

          {/* Info panel */}
          <div style={{ padding: 18, flex: 1 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 4px",
              }}
            >
              {data.name}
            </h3>
            <p
              style={{
                fontSize: 11,
                color: "#ccff00",
                fontWeight: 700,
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {data.roleLabel} · {data.specialization}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {data.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 16,
        }}
      >
        {/* Pass (X) */}
        <button
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#ef4444", fontSize: 24 }}
          >
            close
          </span>
        </button>

        {/* Like (heart) */}
        <button
          style={{
            width: 60,
            height: 60,
            borderRadius: 999,
            background: "#ccff00",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(204,255,0,0.35)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              color: "#0a0a0c",
              fontSize: 28,
              fontVariationSettings: "'FILL' 1",
            }}
          >
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}
