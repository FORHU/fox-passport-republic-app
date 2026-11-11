"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { BadgeGrid } from "@/features/gamification/components/BadgeCard";
import { Badge } from "@/features/gamification/types/gamification";

export interface PassportBadgesTabProps {
  displayBadges: Badge[];
  earnedBadges: Badge[];
  finalLockedIds: string[];
  onBadgeClick: (badge: Badge) => void;
}

/** The passport's badge collection: owned, or all with the locked ones. */
export function PassportBadgesTab({
  displayBadges,
  earnedBadges,
  finalLockedIds,
  onBadgeClick,
}: PassportBadgesTabProps) {
  const [showAllBadges, setShowAllBadges] = useState(false);

  return (
    <motion.div
      key="badges"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative z-20 space-y-12"
    >
      {/* Badges Collection Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">
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
                  ? "bg-accent text-black shadow-glow-accent"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Owned
            </button>
            <button
              onClick={() => setShowAllBadges(true)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                showAllBadges
                  ? "bg-accent text-black shadow-glow-accent"
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
    </motion.div>
  );
}
