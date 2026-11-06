import api from "../lib/axios";

export interface AchievementTier {
  tier: 1 | 2 | 3;
  target: number;
  xp: number;
  coins: number;
  badgeName?: string;
  isUnlocked: boolean;
}

export interface AchievementProgress {
  key: string;
  name: string;
  description: string;
  category: "citizen" | "foxer";
  currentCount: number;
  currentTier: 0 | 1 | 2 | 3;
  nextTier: 1 | 2 | 3 | null;
  targetCount: number;
  progressPercentage: number;
  isCompleted: boolean;
  tiers: AchievementTier[];
}

export interface UserAchievementsResponse {
  citizenAchievements: AchievementProgress[];
  foxerAchievements: AchievementProgress[];
  totalUnlockedTiers: number;
  completedAchievements: number;
}

/**
 * Fetches the authenticated user's achievement milestones, progression, and unlocked tiers.
 */
export async function getMyAchievements(): Promise<UserAchievementsResponse> {
  const res = await api.get("/achievements/me");
  return (
    res.data?.data ?? {
      citizenAchievements: [],
      foxerAchievements: [],
      totalUnlockedTiers: 0,
      completedAchievements: 0,
    }
  );
}

