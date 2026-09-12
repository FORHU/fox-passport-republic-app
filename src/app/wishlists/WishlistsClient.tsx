"use client";

import React from "react";
import Link from "next/link";
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

export default function WishlistsClient() {
  const router = useRouter();
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  return (
    <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 h-20 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-display font-bold">Saved</h1>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <p className="text-zinc-500 text-sm">Loading…</p>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-zinc-800 rounded-[2rem]">
              <span className="material-symbols-outlined text-4xl text-zinc-700 mb-3">
                favorite_border
              </span>
              <p className="font-bold text-white mb-1">Nothing saved yet</p>
              <p className="text-sm text-zinc-500">
                Bookmark venues and events to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((favorite) => {
                const target = favorite.venue ?? favorite.event;
                const name = target?.name ?? "Saved item";
                const href =
                  favorite.type === "venue"
                    ? `/venues/${favorite.targetId}`
                    : `/event/${favorite.targetId}`;
                const image = imageOf(favorite);

                return (
                  <Link
                    key={favorite.id}
                    href={href}
                    className="group block rounded-2xl overflow-hidden border border-[#1f2229] bg-[#111318] hover:border-[#2a2e38] transition-colors"
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative h-28 ${image ? "bg-cover bg-center" : "stripe"}`}
                      style={
                        image ? { backgroundImage: `url(${image})` } : undefined
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(favorite.targetId);
                        }}
                        aria-label="Remove from saved"
                        className="absolute top-2 right-2 leading-none"
                      >
                        <span
                          className="material-symbols-outlined text-pink-500 text-[22px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <p className="text-xs font-bold text-white truncate">
                        {name}
                      </p>
                      <p className="text-[11px] font-bold text-[#ccff00] mt-1">
                        {formatPrice(favorite)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
