"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { useCurrency } from "@/shared/providers/CurrencyProvider";
import {
  favoriteHref,
  favoriteImage,
  favoriteName,
  favoriteSubline,
} from "@/features/wishlist/helpers/favoriteCard";

export default function MobileWishlistView() {
  const { format } = useCurrency();
  const router = useRouter();
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  return (
    <div
      style={{
        background: "var(--canvas)",
        minHeight: "100svh",
        position: "relative",
        color: "var(--color-white)",
        // Clears the fixed shared header (56px) above, like /booking's pt-24.
        paddingTop: 96,
      }}
    >
      <h1 className="font-landing-display text-5xl leading-[0.9] text-white px-4 mb-6">
        Wishlists
      </h1>

      {isLoading ? (
        <p
          style={{
            padding: "0 16px",
            color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
            fontSize: 13,
          }}
        >
          Loading…
        </p>
      ) : favorites.length === 0 ? (
        <div
          style={{
            padding: "48px 20px 0",
            textAlign: "center",
            color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
          }}
        >
          <p style={{ fontWeight: 700, color: "var(--color-white)", marginBottom: 4 }}>
            Your wishlist is empty
          </p>
          <p style={{ fontSize: 13 }}>
            Tap the heart on a venue, event or Foxer to add it to your wishlist.
          </p>
        </div>
      ) : (
        /* 2-column grid */
        <div
          style={{
            padding: "0 16px 112px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {favorites.map((favorite) => {
            const name = favoriteName(favorite);
            const image = favoriteImage(favorite);
            const href = favoriteHref(favorite);

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
                    toggleFavorite(favorite.targetId, { type: favorite.type });
                  }}
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    fontSize: 20,
                    color: "var(--periwinkle)",
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
                      color: "var(--color-white)",
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
                      color: "var(--accent-text)",
                      margin: 0,
                    }}
                  >
                    {favoriteSubline(favorite, format)}
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
