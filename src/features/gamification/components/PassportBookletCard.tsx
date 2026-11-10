"use client";

import React from "react";
import { getPathLabel } from "@/features/gamification/lib/gamification";
import { RankBadge } from "@/features/gamification/components/RankBadge";
import { Skeleton, SkeletonGroup } from "@/shared/components/ui/skeleton";

interface PassportBookletCardProps {
  user: any;
  level?: number;
  citizenNo?: string;
  /** The level isn't known yet: draw its place instead of a default Lvl 1. */
  loading?: boolean;
}

export default function PassportBookletCard({
  user,
  level = 1,
  citizenNo,
  loading = false,
}: PassportBookletCardProps) {
  const name: string = user?.name ?? "Juan Dela Cruz";
  const tierLabel = getPathLabel("user", level);
  const initial: string = name.charAt(0).toUpperCase();

  return (
    <div
      style={{
        borderRadius: 22,
        background: "linear-gradient(135deg, #14161B 0%, var(--canvas) 100%)",
        border: "1px solid rgba(196,232,90,0.25)",
        padding: 22,
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle lime glow top-right */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(196,232,90,0.07)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Top row */}
      <div
        className="flex items-start justify-between"
        style={{ marginBottom: 12 }}
      >
        <div>
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-text)",
              marginBottom: 2,
            }}
          >
            Republic of
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-white)",
              lineHeight: 1,
            }}
          >
            Fox Passport
          </h2>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#5C62D6",
            border: "2px solid color-mix(in srgb, var(--color-white) 10%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {user?.imgId ? (
            <img
              src={user.imgId}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span
              className="font-display"
              style={{ fontSize: 18, fontWeight: 700, color: "var(--color-white)" }}
            >
              {initial}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <p
        style={{
          fontSize: 13,
          color: "color-mix(in srgb, var(--color-white) 60%, transparent)",
          marginBottom: 4,
        }}
      >
        {name}
      </p>

      {/* Citizen No */}
      <p
        style={{
          fontSize: 10,
          color: "color-mix(in srgb, var(--color-white) 30%, transparent)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {citizenNo ? `Citizen No. ${citizenNo}` : " "}
      </p>

      {/* Bottom right: level + role */}
      <div className="flex items-end justify-between">
        <div
          style={{
            height: 1,
            flex: 1,
            marginRight: 12,
            background: "color-mix(in srgb, var(--color-white) 6%, transparent)",
          }}
        />
        {loading ? (
          <SkeletonGroup
            label="Loading level"
            className="flex items-center gap-3"
          >
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </SkeletonGroup>
        ) : (
          <div className="flex items-center gap-3">
            <RankBadge level={level} size={36} isCitizen={true} />
            <div className="flex flex-col items-end">
              <span
                className="font-display"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--accent-text)",
                  lineHeight: 1,
                }}
              >
                Lvl {level}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color:
                    "color-mix(in srgb, var(--color-white) 35%, transparent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 2,
                }}
              >
                {tierLabel}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
