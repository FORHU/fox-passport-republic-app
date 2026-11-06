"use client";

import React from "react";
import Image from "next/image";
import { useFoxerScore } from "@/features/dashboard/hooks/useFoxerScore";

interface FoxerReputationCardProps {
  className?: string;
}

function getFoxerRankInfo(level: number): { title: string; rankNumber: number } {
  if (level >= 50) return { title: "Legend", rankNumber: 9 };
  if (level >= 40) return { title: "Sovereign", rankNumber: 8 };
  if (level >= 30) return { title: "Champion", rankNumber: 7 };
  if (level >= 20) return { title: "Grandmaster", rankNumber: 6 };
  if (level >= 15) return { title: "Master", rankNumber: 5 };
  if (level >= 10) return { title: "Expert", rankNumber: 4 };
  if (level >= 5) return { title: "Specialist", rankNumber: 3 };
  if (level >= 3) return { title: "Novice", rankNumber: 2 };
  return { title: "Rookie", rankNumber: 1 };
}

export function FoxerReputationCard({ className = "" }: FoxerReputationCardProps) {
  const { data: scoreData, isLoading, error } = useFoxerScore();

  if (isLoading) {
    return (
      <div className={`bg-surface border border-white/5 rounded-[2rem] p-6 relative overflow-hidden ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-12 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !scoreData) {
    return null;
  }

  const { foxerScore, breakdown, operationalMetrics } = scoreData;
  const level = operationalMetrics?.foxerLevel ?? 1;
  const { title: rankTitle, rankNumber } = getFoxerRankInfo(level);

  // Derive score tier color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-accent";
    if (score >= 60) return "text-sky-400";
    if (score >= 40) return "text-amber-400";
    return "text-white/60";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 75) return "bg-accent/10 text-accent border-accent/20";
    if (score >= 60) return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (score >= 40) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-white/10 text-white/60 border-white/10";
  };

  return (
    <div
      className={`bg-surface border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-white/3" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-xl">
              verified_user
            </span>
            <h3 className="font-display font-bold text-white text-base">
              Foxer Reputation
            </h3>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${getScoreBadgeColor(
              foxerScore,
            )}`}
          >
            {rankTitle}
          </span>
        </div>

        {/* Hero Score Display */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={`/badges/rank-${rankNumber}.svg`}
                alt={rankTitle}
                width={48}
                height={48}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to placeholder if SVG not yet loaded
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-mono">
                Composite Score
              </p>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-3xl font-display font-extrabold tracking-tight ${getScoreColor(
                    foxerScore,
                  )}`}
                >
                  {Math.round(foxerScore)}
                </span>
                <span className="text-xs text-white/40 font-mono">/ 100</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-mono">
              Provider Rank
            </p>
            <p className="text-sm font-display font-bold text-white">
              Level {level}
            </p>
          </div>
        </div>

        {/* 5-Factor Score Breakdown */}
        <div className="space-y-3 mb-5">
          {/* Rating (max 45) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Quality Rating</span>
              <span className="text-white font-mono font-medium">
                {breakdown.ratingScore.toFixed(1)} / 45
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (breakdown.ratingScore / 45) * 100)}%` }}
              />
            </div>
          </div>

          {/* Volume (max 20) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Booking Volume</span>
              <span className="text-white font-mono font-medium">
                {breakdown.volumeScore.toFixed(1)} / 20
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (breakdown.volumeScore / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Responsiveness (max 15) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">24h Responsiveness</span>
              <span className="text-white font-mono font-medium">
                {breakdown.responsivenessScore.toFixed(1)} / 15
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (breakdown.responsivenessScore / 15) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Reliability (max 15) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Reliability & Fulfillment</span>
              <span className="text-white font-mono font-medium">
                {breakdown.reliabilityScore.toFixed(1)} / 15
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (breakdown.reliabilityScore / 15) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Trust (max 5) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Verification & Trust</span>
              <span className="text-white font-mono font-medium">
                {breakdown.trustScore.toFixed(1)} / 5
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (breakdown.trustScore / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Operational Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 text-center">
          <div className="p-2.5 rounded-xl bg-white/3">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block">
              Response Rate
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {Math.round(operationalMetrics.responsivenessRate * 100)}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/3">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block">
              Cancellation Rate
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {(operationalMetrics.cancellationRate * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/3">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {operationalMetrics.completedBookings} bookings
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/3">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block">
              ID Verified
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {operationalMetrics.isIdentityVerified ? "Yes ✓" : "Pending"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
