import React from "react";
import Image from "next/image";
import { getRankInfo } from "@/features/gamification/types/gamification";

interface RankBadgeProps {
  level: number;
  size?: number;
  isCitizen?: boolean;
  showTitle?: boolean;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  level,
  size = 24,
  isCitizen = true,
  showTitle = false,
  className = "",
}) => {
  const rank = getRankInfo(level, isCitizen);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
        title={`${rank.title} · Level ${level} (${rank.rarity})`}
      >
        <Image
          src={rank.svgPath}
          alt={`${rank.title} badge`}
          width={size}
          height={size}
          className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        />
      </div>
      {showTitle && (
        <span
          className="font-semibold text-xs tracking-wide uppercase"
          style={{ color: rank.color }}
        >
          {rank.title} · Lvl {level}
        </span>
      )}
    </div>
  );
};

export default RankBadge;

