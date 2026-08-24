"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MobileFoxerProfileProps {
  foxer?: any;
}

const PORTFOLIO_CARDS = [
  { label: "Neon Nights" },
  { label: "Skyline Gala" },
  { label: "Garden Party" },
];

export default function MobileFoxerProfile({ foxer }: MobileFoxerProfileProps) {
  const router = useRouter();

  const name: string = foxer?.name ?? "Maria Santos";
  const role: string = foxer?.role ?? "Event Foxer";
  const rating: string = foxer?.rating ? `${foxer.rating}★` : "4.9★";
  const reviewCount: number = foxer?.reviewCount ?? 62;
  const initial: string = name.charAt(0).toUpperCase();

  return (
    <div
      className="pb-28"
      style={{
        background: "#050608",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Pink radial gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          background:
            "radial-gradient(circle at 50% 0%, rgba(219,39,119,0.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />

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
          Foxer Profile
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
            ios_share
          </span>
        </button>
      </div>

      {/* Profile section — starts below nav */}
      <div
        style={{
          padding: "126px 20px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            border: "3px solid #ccff00",
            overflow: "hidden",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {foxer?.avatar ? (
            <img
              src={foxer.avatar}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            /> // eslint-disable-line @next/next/no-img-element
          ) : (
            <div
              className="stripe"
              style={{
                width: "100%",
                height: "100%",
                background: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="font-display"
                style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}
              >
                {initial}
              </span>
            </div>
          )}
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          {name}
        </h1>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#ccff00",
          }}
        >
          {role} · {rating} ({reviewCount})
        </p>
      </div>

      {/* Action row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "0 20px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          style={{
            flex: 1,
            background: "#ccff00",
            color: "#000",
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 999,
            padding: "12px 0",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(204,255,0,0.3)",
          }}
        >
          Request Match
        </button>
        <button
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            chat_bubble
          </span>
        </button>
      </div>

      {/* Published Events */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          padding: "0 20px 12px",
          position: "relative",
          zIndex: 1,
        }}
      >
        Published Events
      </p>

      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 20px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {PORTFOLIO_CARDS.map((card, i) => (
          <div
            key={i}
            className="stripe"
            style={{
              flexShrink: 0,
              width: 130,
              height: 100,
              borderRadius: 14,
              background: "#111",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "flex-end",
              padding: 10,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#fff",
                position: "relative",
                zIndex: 1,
              }}
            >
              {card.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
