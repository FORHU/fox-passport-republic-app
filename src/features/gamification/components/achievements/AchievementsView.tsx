"use client";

import React, { useState } from "react";
import { useAchievements } from "@/features/gamification/hooks/useAchievements";
import type {
  AchievementProgress,
  AchievementTier,
} from "@/shared/api/achievements";

export const AchievementsView: React.FC = () => {
  const { data, isLoading, isError, refetch } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<"citizen" | "foxer">(
    "citizen",
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-white/5 rounded-2xl border border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-2">
          error
        </span>
        <h3 className="text-lg font-bold text-white mb-1">
          Failed to load achievements
        </h3>
        <p className="text-white/60 text-sm mb-4">
          Could not retrieve your achievement milestones. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const list =
    selectedCategory === "citizen"
      ? data.citizenAchievements
      : data.foxerAchievements;

  const totalPossible =
    data.citizenAchievements.length + data.foxerAchievements.length;

  return (
    <div className="space-y-6">
      {/* Overview Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-accent">
              military_tech
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">
              Completed
            </p>
            <p className="text-2xl font-bold font-mono text-white">
              {data.completedAchievements}{" "}
              <span className="text-sm font-normal text-white/40">
                / {totalPossible}
              </span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-cyan-400">
              stars
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">
              Unlocked Tiers
            </p>
            <p className="text-2xl font-bold font-mono text-white">
              {data.totalUnlockedTiers}{" "}
              <span className="text-sm font-normal text-white/40">
                / {totalPossible * 3}
              </span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-purple-400">
              social_distance
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">
              Active Category
            </p>
            <p className="text-lg font-bold text-white capitalize">
              {selectedCategory === "citizen" ? "Citizen Path" : "Foxer Supply"}
            </p>
          </div>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("citizen")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            selectedCategory === "citizen"
              ? "border-accent text-accent"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          Citizen Achievements ({data.citizenAchievements.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("foxer")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            selectedCategory === "foxer"
              ? "border-accent text-accent"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            storefront
          </span>
          Foxer Achievements ({data.foxerAchievements.length})
        </button>
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((ach) => (
          <AchievementCard key={ach.key} achievement={ach} />
        ))}
      </div>
    </div>
  );
};

const AchievementCard: React.FC<{ achievement: AchievementProgress }> = ({
  achievement,
}) => {
  const isAllCoinsZero = achievement.tiers.every((t) => t.coins === 0);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        achievement.isCompleted
          ? "bg-accent/[0.04] border-accent/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]"
          : "bg-white/[0.02] border-white/10 hover:border-white/20"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-wide">
              {achievement.name}
            </h4>
            {achievement.isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/30">
                <span className="material-symbols-outlined text-[12px]">
                  verified
                </span>
                Completed
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            {achievement.description}
          </p>
        </div>

        {/* Current Tier Badge */}
        <div className="shrink-0 text-right">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              achievement.currentTier > 0
                ? "bg-white/10 border-white/20 text-accent"
                : "bg-white/5 border-white/5 text-white/40"
            }`}
          >
            {achievement.currentTier === 0
              ? "TIER 0"
              : `TIER ${achievement.currentTier}`}
          </span>
        </div>
      </div>

      {/* Progress Bar & Counters */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/60">
            {achievement.isCompleted
              ? "All Tiers Completed"
              : `Next Goal: Tier ${achievement.nextTier}`}
          </span>
          <span className="font-mono text-white font-bold">
            {achievement.currentCount}{" "}
            <span className="text-white/40">
              / {achievement.targetCount || achievement.currentCount}
            </span>
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-700 ${
              achievement.isCompleted
                ? "bg-accent"
                : "bg-gradient-to-r from-accent/70 to-accent"
            }`}
            style={{ width: `${achievement.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3-Tier Step Track */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
        {achievement.tiers.map((t) => (
          <TierPip
            key={t.tier}
            tier={t}
            isUnlocked={t.isUnlocked}
            isSocialOnly={isAllCoinsZero}
          />
        ))}
      </div>

      {/* Social Guardrail Note if applicable */}
      {isAllCoinsZero && (
        <p className="text-[10px] text-white/30 italic mt-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">info</span>
          Social milestone: awards XP & badges only (§6.2).
        </p>
      )}
    </div>
  );
};

const TierPip: React.FC<{
  tier: AchievementTier;
  isUnlocked: boolean;
  isSocialOnly: boolean;
}> = ({ tier, isUnlocked }) => {
  return (
    <div
      className={`p-2 rounded-xl border text-center transition-all ${
        isUnlocked
          ? "bg-accent/10 border-accent/30 text-white"
          : "bg-white/[0.02] border-white/5 text-white/40"
      }`}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        <span
          className={`material-symbols-outlined text-[14px] ${
            isUnlocked ? "text-accent" : "text-white/30"
          }`}
        >
          {isUnlocked ? "check_circle" : "lock"}
        </span>
        <span className="text-[11px] font-bold font-mono">
          Tier {tier.tier === 1 ? "I" : tier.tier === 2 ? "II" : "III"}
        </span>
      </div>

      <p className="text-[10px] font-mono text-white/70 mb-1.5">
        {tier.target} req.
      </p>

      {/* Rewards indicators */}
      <div className="flex flex-wrap items-center justify-center gap-1">
        <span
          className={`text-[9px] font-mono px-1 py-0.5 rounded ${
            isUnlocked
              ? "bg-accent/20 text-accent font-bold"
              : "bg-white/5 text-white/40"
          }`}
        >
          +{tier.xp} XP
        </span>
        {tier.coins > 0 && (
          <span
            className={`text-[9px] font-mono px-1 py-0.5 rounded ${
              isUnlocked
                ? "bg-yellow-400/20 text-yellow-300 font-bold"
                : "bg-white/5 text-white/40"
            }`}
          >
            +{tier.coins} C
          </span>
        )}
      </div>

      {tier.badgeName && (
        <div className="mt-1.5 pt-1 border-t border-white/5">
          <span
            className={`text-[9px] block truncate font-medium ${
              isUnlocked ? "text-accent font-bold" : "text-white/30"
            }`}
            title={`Badge: ${tier.badgeName}`}
          >
            🏅 {tier.badgeName}
          </span>
        </div>
      )}
    </div>
  );
};

export default AchievementsView;
