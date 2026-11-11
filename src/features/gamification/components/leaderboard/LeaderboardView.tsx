"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFoxerLeaderboard } from "@/features/gamification/hooks/useLeaderboardData";
import type { FoxerLeaderboardTab } from "@/shared/api/leaderboard";

/** The Foxer leaderboard, the only one (rewards spec: the citizen board is retired). */
export const LeaderboardView: React.FC = () => {
  const [foxerTab, setFoxerTab] = useState<FoxerLeaderboardTab>("top_rated");
  const [foxerRole, setFoxerRole] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const foxerQuery = useFoxerLeaderboard(foxerTab, foxerRole, selectedCity);
  const { isLoading, isError, refetch } = foxerQuery;

  return (
    <div className="space-y-6">
      {/* Heading and city filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="material-symbols-outlined text-[20px] text-accent">
            workspace_premium
          </span>
          Top Foxers
        </h2>

        {/* City Filter Shortcut */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white/40 text-[18px]">
            location_on
          </span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-canvas">
              All Cities (Nationwide)
            </option>
            <option value="Manila" className="bg-canvas">
              Manila
            </option>
            <option value="Quezon City" className="bg-canvas">
              Quezon City
            </option>
            <option value="Makati" className="bg-canvas">
              Makati
            </option>
            <option value="Taguig" className="bg-canvas">
              Taguig (BGC)
            </option>
            <option value="Cebu" className="bg-canvas">
              Cebu
            </option>
            <option value="Davao" className="bg-canvas">
              Davao
            </option>
          </select>
        </div>
      </div>

      {/* Foxer sub-tabs and role filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "top_rated", label: "Top Rated" },
              { key: "most_booked", label: "Most Booked" },
              { key: "rising", label: "Rising Stars" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFoxerTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                foxerTab === t.key
                  ? "bg-accent/10 border-accent/40 text-accent"
                  : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Role:</span>
          <select
            value={foxerRole}
            onChange={(e) => setFoxerRole(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-canvas">
              All Roles
            </option>
            <option value="venueFoxer" className="bg-canvas">
              Venues
            </option>
            <option value="eventFoxer" className="bg-canvas">
              Event Foxers
            </option>
            <option value="providerFoxer" className="bg-canvas">
              Providers (Gear & Services)
            </option>
          </select>
        </div>
      </div>

      {/* Main Leaderboard List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-white/5 rounded-2xl border border-white/5"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-2">
            error
          </span>
          <h3 className="text-lg font-bold text-white mb-1">
            Failed to load leaderboard
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Could not retrieve ranking standings. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        /* Foxer Leaderboard List */
        <div className="space-y-2">
          {foxerQuery.data?.entries.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-12">
              No Foxers match the selected criteria yet.
            </p>
          ) : (
            foxerQuery.data?.entries.map((entry) => (
              <div
                key={entry.userId}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4"
              >
                {/* Left: Position & Profile */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-8 text-center shrink-0">
                    {entry.position === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : entry.position === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : entry.position === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="font-mono font-bold text-sm text-white/50">
                        #{entry.position}
                      </span>
                    )}
                  </div>

                  <div className="relative w-10 h-10 rounded-full bg-white/10 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {entry.avatarUrl ? (
                      <Image
                        src={entry.avatarUrl}
                        alt={entry.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white/60">
                        {entry.name?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">
                        {entry.name}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                        {entry.role}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 truncate">
                      {entry.city || "Republic"} · {entry.completedBookings}{" "}
                      bookings completed
                    </p>
                  </div>
                </div>

                {/* Right: Rating */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-[15px] text-amber-400">
                        star
                      </span>
                      <span className="text-sm font-bold font-mono text-white">
                        {entry.starRating > 0
                          ? entry.starRating.toFixed(1)
                          : "New"}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40">
                      {entry.reviewCount} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pinned Foxer Position */}
          {foxerQuery.data?.userPosition && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-2">
                Your Foxer Standing
              </p>
              <div className="p-4 rounded-2xl bg-accent/[0.08] border border-accent/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-accent">
                    #{foxerQuery.data.userPosition.position}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {foxerQuery.data.userPosition.name} (You)
                    </p>
                    <p className="text-xs text-white/40">
                      {foxerQuery.data.userPosition.completedBookings} bookings
                      completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;
