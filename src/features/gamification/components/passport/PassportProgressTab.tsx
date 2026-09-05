"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import CircularProgress from "@/features/gamification/components/CircularProgress";
import { BadgeGrid } from "@/features/gamification/components/BadgeCard";
import {
  PathProgress,
  UserPath,
  XP_REWARDS,
  Badge,
} from "@/features/gamification/types/gamification";
import { formatXP } from "@/features/gamification/lib/gamification";

export interface PassportProgressTabProps {
  filteredPaths: PathProgress[];
  activePathTypes: UserPath[];
  displayBadges: Badge[];
  earnedBadges: Badge[];
  finalLockedIds: string[];
  onBadgeClick: (badge: Badge) => void;
}

export function PassportProgressTab({
  filteredPaths,
  activePathTypes,
  displayBadges,
  earnedBadges,
  finalLockedIds,
  onBadgeClick,
}: PassportProgressTabProps) {
  const [showAllBadges, setShowAllBadges] = useState(false);

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative z-20 space-y-12"
    >
      {/* Path Cards Grid */}
      <div
        className={`grid ${
          filteredPaths.length > 1
            ? "grid-cols-2"
            : "grid-cols-1 max-w-sm mx-auto w-full"
        } gap-3`}
      >
        {filteredPaths.map((path) => {
          const pathName =
            path.path === "user"
              ? "Citizen"
              : path.path === "gearFoxer"
                ? "Gear Foxer"
                : path.path === "serviceFoxer"
                  ? "Service Foxer"
                  : path.path === "eventFoxer"
                    ? "Event Foxer"
                    : path.path === "venueFoxer"
                      ? "Venue Foxer"
                      : path.path;
          const pct = Math.min(
            100,
            Math.round((path.currentXP / path.requiredXP) * 100),
          );
          return (
            <div
              key={path.path}
              className="relative flex flex-col items-center text-center rounded-3xl overflow-hidden p-5 gap-3"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${path.color}18 0%, transparent 70%), rgba(255,255,255,0.03)`,
                border: `1px solid ${path.color}22`,
              }}
            >
              {/* Glow orb */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{ backgroundColor: path.color }}
              />

              {/* Circular progress */}
              <CircularProgress
                level={path.level}
                currentXP={path.currentXP}
                requiredXP={path.requiredXP}
                color={path.color}
                size={96}
                strokeWidth={7}
              />

              {/* Path name + tier */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-black text-white tracking-tight leading-none">
                  {pathName}
                </p>
                <p
                  className="text-[8px] font-black uppercase tracking-[0.2em]"
                  style={{ color: path.color }}
                >
                  {path.label}
                </p>
              </div>

              {/* XP bar */}
              <div className="w-full space-y-1.5">
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: path.color,
                      boxShadow: `0 0 6px ${path.color}80`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono text-white/30">
                    {formatXP(path.currentXP)} XP
                  </span>
                  <span
                    className="text-[8px] font-black"
                    style={{ color: path.color }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges Collection Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ccff00]">
              award_star
            </span>{" "}
            Collection
          </h3>
          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setShowAllBadges(false)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                !showAllBadges
                  ? "bg-[#ccff00] text-black shadow-glow-accent"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Owned
            </button>
            <button
              onClick={() => setShowAllBadges(true)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                showAllBadges
                  ? "bg-[#ccff00] text-black shadow-glow-accent"
                  : "text-white/40 hover:text-white"
              }`}
            >
              All
            </button>
          </div>
        </div>
        <div className="bg-white/2 border border-white/5 rounded-[3rem] p-8">
          <BadgeGrid
            badges={showAllBadges ? displayBadges : earnedBadges}
            maxDisplay={
              showAllBadges ? displayBadges.length : earnedBadges.length
            }
            className={showAllBadges ? "lg:grid-cols-6" : "lg:grid-cols-4"}
            onBadgeClick={onBadgeClick}
            lockedBadges={finalLockedIds}
          />
        </div>
      </section>

      {/* Mastery Guides Section */}
      <section className="bg-gradient-to-br from-[#ccff00]/10 to-transparent border border-[#ccff00]/10 rounded-[3rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ccff00]/5 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:bg-[#ccff00]/10 transition-all duration-700"></div>
        <h3 className="text-lg font-display font-bold text-white mb-8 relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ccff00]">
            auto_awesome
          </span>{" "}
          Mastery Guides
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* User Path Guide - Always shown */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest opacity-60">
              Citizen Activities
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ccff00] text-sm">
                    confirmation_number
                  </span>
                  <span className="text-sm text-white/70">
                    Book an Experience
                  </span>
                </div>
                <span className="font-mono text-sm text-[#ccff00] font-bold">
                  +{XP_REWARDS.bookEvent} XP
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ccff00] text-sm">
                    local_activity
                  </span>
                  <span className="text-sm text-white/70">
                    Attend an Event
                  </span>
                </div>
                <span className="font-mono text-sm text-[#ccff00] font-bold">
                  +{XP_REWARDS.attendEvent} XP
                </span>
              </div>
            </div>
          </div>

          {/* Foxer Path Guide */}
          {(activePathTypes.includes("gearFoxer") ||
            activePathTypes.includes("serviceFoxer")) && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest opacity-60">
                Foxer Career
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f97316] text-sm">
                      add_box
                    </span>
                    <span className="text-sm text-white/70">
                      Create a Listing
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#f97316] font-bold">
                    +{XP_REWARDS.createListing} XP
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f97316] text-sm">
                      task_alt
                    </span>
                    <span className="text-sm text-white/70">
                      Complete Event
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#f97316] font-bold">
                    +{XP_REWARDS.completeEvent} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Event Foxer Path Guide */}
          {activePathTypes.includes("eventFoxer") && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest opacity-60">
                Event Foxer Career
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#3b82f6] text-sm">
                      celebration
                    </span>
                    <span className="text-sm text-white/70">
                      Complete an Event
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#3b82f6] font-bold">
                    +{XP_REWARDS.completeEvent} XP
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#3b82f6] text-sm">
                      star_rate
                    </span>
                    <span className="text-sm text-white/70">
                      Earn a 5-Star Review
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#3b82f6] font-bold">
                    +{XP_REWARDS.receive5StarReview} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Venue Foxer Path Guide */}
          {activePathTypes.includes("venueFoxer") && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest opacity-60">
                Venue Foxer Career
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a855f7] text-sm">
                      domain_add
                    </span>
                    <span className="text-sm text-white/70">
                      List a Venue
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#a855f7] font-bold">
                    +{XP_REWARDS.uploadVenue} XP
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a855f7] text-sm">
                      assured_workload
                    </span>
                    <span className="text-sm text-white/70">
                      Venue Approved
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#a855f7] font-bold">
                    +{XP_REWARDS.venueApproved} XP
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a855f7] text-sm">
                      star_rate
                    </span>
                    <span className="text-sm text-white/70">
                      Venue Featured
                    </span>
                  </div>
                  <span className="font-mono text-sm text-[#a855f7] font-bold">
                    +{XP_REWARDS.venueFeatured} XP
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
