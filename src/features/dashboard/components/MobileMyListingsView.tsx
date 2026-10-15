"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileCreatorBottomNav from "./MobileCreatorBottomNav";

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

// This page lists venues; the other kinds of listing each have their own
// dashboard page, so the tabs go there rather than filtering in place.
const FILTER_TABS = [
  { label: "Venues", href: "/creator-dashboard/venues" },
  { label: "Events", href: "/creator-dashboard/events" },
  { label: "Assets", href: "/creator-dashboard/assets" },
  { label: "Services", href: "/creator-dashboard/services" },
] as const;

// The API's VenueStatus values.
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  available: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
  pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
  archived: {
    bg: "color-mix(in srgb, var(--color-white) 7%, transparent)",
    color: "color-mix(in srgb, var(--color-white) 35%, transparent)",
  },
  draft: {
    bg: "color-mix(in srgb, var(--color-white) 7%, transparent)",
    color: "color-mix(in srgb, var(--color-white) 35%, transparent)",
  },
};

interface VenueRow {
  id: string;
  title: string;
  type?: string;
  city?: string;
  status?: string;
  images?: string[];
}

export default function MobileMyListingsView({
  venues,
}: {
  venues: VenueRow[];
}) {
  const router = useRouter();

  return (
    <div
      style={{
        background: "var(--canvas)",
        minHeight: "100svh",
        color: "var(--color-white)",
      }}
    >
      {/* Standard nav bar */}
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
        <Image
          src="/foxonlylogo.png"
          alt="FoxPassport"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          My Listings
        </p>
        <button
          type="button"
          aria-label="Add a venue"
          onClick={() => router.push("/venue-foxer/create-venue")}
          className="bg-accent"
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 20,
              color: "#000",
              fontVariationSettings: "'wght' 700",
            }}
          >
            add
          </span>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "142px 20px 112px" }}>
        {/* Listing type tabs */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            marginBottom: 20,
            paddingBottom: 2,
          }}
        >
          {FILTER_TABS.map((tab) => {
            const active = tab.label === "Venues";
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => !active && router.push(tab.href)}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "bg-accent text-black"
                    : "bg-white/5 border border-white/10 text-white/55"
                }
                style={{
                  flexShrink: 0,
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {venues.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              borderRadius: 20,
              border:
                "1px dashed color-mix(in srgb, var(--color-white) 12%, transparent)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 36,
                color:
                  "color-mix(in srgb, var(--color-white) 30%, transparent)",
              }}
            >
              storefront
            </span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "10px 0 4px" }}>
              No venues yet
            </p>
            <p
              style={{
                fontSize: 12,
                color:
                  "color-mix(in srgb, var(--color-white) 45%, transparent)",
                margin: "0 0 18px",
              }}
            >
              List your first space so people can book it.
            </p>
            <button
              type="button"
              onClick={() => router.push("/venue-foxer/create-venue")}
              className="bg-accent text-black"
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Add a venue
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {venues.map((venue) => {
              const status = (venue.status || "draft").toLowerCase();
              const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
              const thumb = venue.images?.[0];
              return (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() =>
                    router.push(`/creator-dashboard/venues/${venue.id}/edit`)
                  }
                  style={{
                    width: "100%",
                    background:
                      "color-mix(in srgb, var(--color-white) 4%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-white) 7%, transparent)",
                    borderRadius: 16,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Thumbnail — striped placeholder until a photo is added */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      flexShrink: 0,
                      overflow: "hidden",
                      background: STRIPE_BG,
                      border:
                        "1px solid color-mix(in srgb, var(--color-white) 7%, transparent)",
                    }}
                  >
                    {thumb && (
                      <img
                        src={thumb}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-white)",
                        margin: "0 0 3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {venue.title}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color:
                          "color-mix(in srgb, var(--color-white) 40%, transparent)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {[venue.type || "Venue", venue.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: s.bg,
                        color: s.color,
                        textTransform: "uppercase",
                      }}
                    >
                      {status}
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 16,
                        color:
                          "color-mix(in srgb, var(--color-white) 25%, transparent)",
                      }}
                    >
                      chevron_right
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <MobileCreatorBottomNav />
    </div>
  );
}
