"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  useCitizenLeaderboard,
  useFoxerLeaderboard,
} from "@/features/gamification/hooks/useLeaderboardData";
import { RankBadge } from "@/features/gamification/components/RankBadge";
import type {
  CitizenLeaderboardTab,
  FoxerLeaderboardTab,
} from "@/shared/api/leaderboard";

export const LeaderboardView: React.FC = () => {
  const [boardType, setBoardType] = useState<"citizens" | "foxers">("citizens");
  const [citizenTab, setCitizenTab] =
    useState<CitizenLeaderboardTab>("this_month");
  const [foxerTab, setFoxerTab] = useState<FoxerLeaderboardTab>("top_rated");
  const [foxerRole, setFoxerRole] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const citizenQuery = useCitizenLeaderboard(citizenTab, selectedCity);
  const foxerQuery = useFoxerLeaderboard(foxerTab, foxerRole, selectedCity);

  const isLoading =
    boardType === "citizens" ? citizenQuery.isLoading : foxerQuery.isLoading;
  const isError =
    boardType === "citizens" ? citizenQuery.isError : foxerQuery.isError;
  const refetch =
    boardType === "citizens" ? citizenQuery.refetch : foxerQuery.refetch;

  return (
    <div className="space-y-6">
      {/* Top Toggle: Top Citizens vs Top Foxers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setBoardType("citizens")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              boardType === "citizens"
                ? "bg-accent text-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              emoji_events
            </span>
            Top Citizens
          </button>
          <button
            type="button"
            onClick={() => setBoardType("foxers")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              boardType === "foxers"
                ? "bg-accent text-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              workspace_premium
            </span>
            Top Foxers
          </button>
        </div>

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

      {/* Secondary Filter Sub-tabs */}
      {boardType === "citizens" ? (
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "this_month", label: "This Month (Season)" },
              { key: "all_time", label: "All Time" },
              { key: "my_city", label: "My City" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setCitizenTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                citizenTab === t.key
                  ? "bg-accent/10 border-accent/40 text-accent"
                  : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
          {citizenQuery.data?.season && (
            <span className="ml-auto text-[11px] font-mono text-white/40">
              Season: {citizenQuery.data.season}
            </span>
          )}
        </div>
      ) : (
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
      )}

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
      ) : boardType === "citizens" ? (
        <div className="space-y-2">
          {citizenQuery.data?.entries.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-12">
              No citizen activity recorded for this criteria yet.
            </p>
          ) : (
            citizenQuery.data?.entries.map((entry) => (
              <div
                key={entry.userId}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  entry.position === 1
                    ? "bg-amber-500/[0.08] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                    : entry.position === 2
                      ? "bg-slate-300/[0.05] border-slate-300/20"
                      : entry.position === 3
                        ? "bg-amber-700/[0.05] border-amber-700/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                {/* Left: Position & Avatar & Name */}
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
                    <p className="text-sm font-bold text-white truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {entry.city || "Republic Citizen"}
                    </p>
                  </div>
                </div>

                {/* Right: RankBadge & Level Chip (XP remains strictly private per §8.1) */}
                <div className="flex items-center gap-3 shrink-0">
                  <RankBadge
                    level={entry.level}
                    size={26}
                    showTitle={true}
                    isCitizen={true}
                  />
                  <span className="text-[11px] font-mono font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-white/70">
                    LVL {entry.level}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Pinned User Position if outside top */}
          {citizenQuery.data?.userPosition && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-2">
                Your Citizen Standing
              </p>
              <div className="p-4 rounded-2xl bg-accent/[0.08] border border-accent/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-accent">
                    #{citizenQuery.data.userPosition.position}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {citizenQuery.data.userPosition.name} (You)
                    </p>
                    <p className="text-xs text-white/40">
                      {citizenQuery.data.userPosition.city || "Citizen"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RankBadge
                    level={citizenQuery.data.userPosition.level}
                    size={26}
                    showTitle={true}
                    isCitizen={true}
                  />
                  <span className="text-[11px] font-mono font-bold bg-accent/20 border border-accent/40 px-2.5 py-1 rounded-full text-accent">
                    LVL {citizenQuery.data.userPosition.level}
                  </span>
                </div>
              </div>
            </div>
          )}
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

                {/* Right: Rating & Foxer Rank */}
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

                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                    {entry.rankTitle}
                  </span>
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
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-accent/20 border border-accent/40 text-accent">
                  {foxerQuery.data.userPosition.rankTitle}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;
