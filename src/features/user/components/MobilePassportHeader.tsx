"use client";

import React from "react";
import PassportBookletCard from "./PassportBookletCard";

interface MobilePassportHeaderProps {
  user: any;
}

const STAMPS = [
  { icon: "location_city", label: "City", collected: true },
  { icon: "celebration", label: "Party", collected: true },
  { icon: "music_note", label: "Music", collected: false },
  { icon: "restaurant", label: "Dining", collected: false },
];

export default function MobilePassportHeader({
  user,
}: MobilePassportHeaderProps) {
  return (
    <div
      style={{
        background: "#050608",
        position: "relative",
        overflow: "hidden",
        paddingBottom: 24,
      }}
    >
      {/* Radial lime gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          background:
            "radial-gradient(circle at 30% 0%, rgba(204,255,0,0.10), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "60px 20px 20px" }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Passport
        </p>
        <button
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "50%",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            settings
          </span>
        </button>
      </div>

      {/* Booklet card */}
      <div style={{ padding: "0 20px 20px" }}>
        <PassportBookletCard
          user={user}
          citizenNo={user?.citizenId ?? undefined}
        />
      </div>

      {/* Stamps Collected label */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          padding: "0 20px 12px",
        }}
      >
        Stamps Collected
      </p>

      {/* Horizontal stamp scroll */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 20px 20px",
        }}
      >
        {STAMPS.map((stamp) => (
          <div
            key={stamp.label}
            style={{
              flexShrink: 0,
              width: 78,
              height: 78,
              borderRadius: "50%",
              border: stamp.collected
                ? "2px dashed #ccff00"
                : "2px dashed rgba(255,255,255,0.15)",
              background: stamp.collected
                ? "rgba(204,255,0,0.08)"
                : "rgba(255,255,255,0.03)",
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                color: stamp.collected ? "#ccff00" : "rgba(255,255,255,0.2)",
              }}
            >
              {stamp.icon}
            </span>
            <span
              style={{
                fontSize: 9,
                color: stamp.collected
                  ? "rgba(204,255,0,0.7)"
                  : "rgba(255,255,255,0.2)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
              }}
            >
              {stamp.label}
            </span>
          </div>
        ))}
      </div>

      {/* Next Badge section */}
      <div style={{ padding: "0 20px" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 10,
          }}
        >
          Next Badge
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 10 }}
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: "#ccff00" }}
              >
                nights_stay
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                Night Owl
              </span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              3 / 5 events
            </span>
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 5,
              borderRadius: 99,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "60%",
                borderRadius: 99,
                background: "#ccff00",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
