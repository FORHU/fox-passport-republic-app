"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import PassportBookletCard from "./PassportBookletCard";
import { useMyPassport } from "../hooks/usePassport";

interface Props {
  user?: any;
}

export default function MobilePassportView({ user }: Props) {
  // The same passport the desktop PassportClient reads.
  const { paths, stamps, badges, isLoading } = useMyPassport();
  const level =
    paths.find((p) => p.path === "user")?.level ??
    Math.max(1, ...paths.map((p) => p.level));
  const citizenNo = user?.id
    ? `FP-${String(user.id).slice(0, 8).toUpperCase()}`
    : undefined;
  const nextBadge = badges.find((b) => !b.earnedAt);

  return (
    <div
      style={{
        background: "var(--canvas)",
        minHeight: "100svh",
        position: "relative",
        color: "var(--color-white)",
      }}
    >
      {/* Lime radial glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          background:
            "radial-gradient(circle at 30% 0%, rgba(204,255,0,0.1), transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Nav bar */}
      <div
        style={{
          position: "fixed",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
          background: "color-mix(in srgb, var(--canvas) 90%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom:
            "1px solid color-mix(in srgb, var(--color-white) 8%, transparent)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Link
          href="/user"
          aria-label="Back to profile"
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Image
            src="/foxonlylogo.png"
            alt="FoxPassport"
            width={22}
            height={22}
            style={{ objectFit: "contain" }}
          />
        </Link>
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Passport
        </p>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background:
              "color-mix(in srgb, var(--color-white) 10%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-white) 15%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            settings
          </span>
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className="no-scrollbar"
        style={{
          position: "relative",
          zIndex: 1,
          overflowY: "auto",
          padding: "142px 20px 112px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Passport booklet card */}
        <PassportBookletCard user={user} level={level} citizenNo={citizenNo} />

        {/* Stamps Collected */}
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "color-mix(in srgb, var(--color-white) 35%, transparent)",
              margin: "0 0 12px",
            }}
          >
            Stamps Collected
          </p>
          {isLoading ? (
            <div style={{ display: "flex", gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: "50%",
                    background:
                      "color-mix(in srgb, var(--color-white) 6%, transparent)",
                  }}
                />
              ))}
            </div>
          ) : stamps.length === 0 ? (
            <div
              style={{
                borderRadius: 18,
                border:
                  "1px dashed color-mix(in srgb, var(--color-white) 12%, transparent)",
                padding: "18px 16px",
                fontSize: 12,
                color:
                  "color-mix(in srgb, var(--color-white) 50%, transparent)",
              }}
            >
              No stamps yet — attend your first event to earn one.{" "}
              <Link href="/search" className="text-accent font-bold">
                Find an event
              </Link>
            </div>
          ) : (
            <div
              className="no-scrollbar"
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  style={{ flexShrink: 0, width: 78, textAlign: "center" }}
                >
                  <div
                    style={{
                      width: 78,
                      height: 78,
                      borderRadius: "50%",
                      border: "2px dashed var(--accent-text)",
                      background: "rgba(204,255,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {stamp.imageUrl ? (
                      <img
                        src={stamp.imageUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 26, color: "var(--accent-text)" }}
                      >
                        approval
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 10,
                      margin: "6px 0 0",
                      color:
                        "color-mix(in srgb, var(--color-white) 55%, transparent)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stamp.eventTitle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Badge — the first one not yet earned */}
        {nextBadge && (
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color:
                  "color-mix(in srgb, var(--color-white) 35%, transparent)",
                margin: "0 0 12px",
              }}
            >
              Next Badge
            </p>
            <div
              style={{
                background:
                  "color-mix(in srgb, var(--color-white) 4%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-white) 8%, transparent)",
                borderRadius: 18,
                padding: 16,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: nextBadge.color }}
              >
                {nextBadge.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    margin: "0 0 2px",
                    color: "var(--color-white)",
                  }}
                >
                  {nextBadge.name}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    margin: 0,
                    color:
                      "color-mix(in srgb, var(--color-white) 45%, transparent)",
                  }}
                >
                  {nextBadge.description}
                </p>
                {nextBadge.maxProgress ? (
                  <div
                    style={{
                      height: 6,
                      borderRadius: 6,
                      marginTop: 10,
                      background:
                        "color-mix(in srgb, var(--color-white) 10%, transparent)",
                    }}
                  >
                    <div
                      className="bg-accent"
                      style={{
                        width: `${Math.min(100, ((nextBadge.progress ?? 0) / nextBadge.maxProgress) * 100)}%`,
                        height: "100%",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
