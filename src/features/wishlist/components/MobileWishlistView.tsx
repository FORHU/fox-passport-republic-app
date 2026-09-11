/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/shared/hooks/useFavorites";
import type { Favorite } from "@/shared/api/favorites";

function formatPrice(favorite: Favorite): string {
  const target = favorite.venue ?? favorite.event;
  if (!target || target.price == null) return "Inquire for price";
  const amount = Number(target.price);
  if (Number.isNaN(amount)) return "Inquire for price";
  const suffix =
    favorite.type === "venue"
      ? favorite.venue?.billingRate === "hourly"
        ? "/hour"
        : "/night"
      : "/event";
  return `₱${amount.toLocaleString()}${suffix}`;
}

function imageOf(favorite: Favorite): string | undefined {
  const images = favorite.venue?.images ?? favorite.event?.images;
  const img = images?.find((i) => i.isPrimary) ?? images?.[0];
  return img?.imageUrl ?? img?.url;
}

export default function MobileWishlistView() {
  const router = useRouter();
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Nav bar */}
      <div
        style={{
          position: "fixed",
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
          Saved
        </p>
      </div>

      {isLoading ? (
        <p
          style={{
            padding: "142px 16px 0",
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
          }}
        >
          Loading…
        </p>
      ) : favorites.length === 0 ? (
        <div
          style={{
            padding: "180px 20px 0",
            textAlign: "center",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <p style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            Nothing saved yet
          </p>
          <p style={{ fontSize: 13 }}>
            Bookmark venues and events to see them here.
          </p>
        </div>
      ) : (
        /* 2-column grid */
        <div
          style={{
            padding: "142px 16px 112px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {favorites.map((favorite) => {
            const target = favorite.venue ?? favorite.event;
            const name = target?.name ?? "Saved item";
            const image = imageOf(favorite);
            const href =
              favorite.type === "venue"
                ? `/venues/${favorite.targetId}`
                : `/event/${favorite.targetId}`;

            return (
              <button
                key={favorite.id}
                onClick={() => router.push(href)}
                style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  aspectRatio: "4/5",
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                  display: "block",
                  width: "100%",
                }}
              >
                {/* Stripe / image background */}
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="stripe"
                    style={{ position: "absolute", inset: 0 }}
                  />
                )}

                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.72) 35%, transparent 70%)",
                  }}
                />

                {/* Heart icon */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(favorite.targetId);
                  }}
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    fontSize: 20,
                    color: "#f472b6",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  favorite
                </span>

                {/* Name + price */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 12,
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 3px",
                      lineHeight: 1.2,
                    }}
                  >
                    {name}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#ccff00",
                      margin: 0,
                    }}
                  >
                    {formatPrice(favorite)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
