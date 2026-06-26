// Gamification utility functions

import {
  PathProgress,
  UserPath,
  XP_PER_LEVEL,
  XP_MULTIPLIER,
  PATH_LABELS,
  PATH_COLORS,
} from '@/types/gamification';

/**
 * Calculate the XP required for a specific level
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;

  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, i - 1));
  }

  return totalXP;
}

/**
 * Calculate the XP required to reach the next level
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  return Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, currentLevel - 1));
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): {
  level: number;
  currentXP: number;
  requiredXP: number;
} {
  let level = 1;
  let xpForCurrentLevel = 0;

  while (totalXP >= xpForCurrentLevel + calculateXPForNextLevel(level)) {
    xpForCurrentLevel += calculateXPForNextLevel(level);
    level++;
  }

  const currentXP = totalXP - xpForCurrentLevel;
  const requiredXP = calculateXPForNextLevel(level);

  return { level, currentXP, requiredXP };
}

/**
 * Get progress percentage for current level
 */
export function getProgressPercentage(currentXP: number, requiredXP: number): number {
  if (requiredXP === 0) return 100;
  return Math.min(100, Math.round((currentXP / requiredXP) * 100));
}

/**
 * Get the label for a path based on level
 */
export function getPathLabel(path: UserPath, level: number): string {
  const labels = PATH_LABELS[path] as Record<number, string>;
  const levelThresholds = Object.keys(labels)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of levelThresholds) {
    if (level >= threshold) {
      return labels[threshold];
    }
  }

  return labels[1] || 'Beginner';
}

/**
 * Get the color for a path
 */
export function getPathColor(path: UserPath): string {
  return PATH_COLORS[path];
}

/**
 * Calculate total mastery level (average of all path levels weighted)
 */
export function calculateMasteryLevel(paths: PathProgress[]): number {
  if (paths.length === 0) return 1;

  const totalLevels = paths.reduce((sum, path) => sum + path.level, 0);
  return Math.floor(totalLevels / paths.length);
}

/**
 * Calculate total XP across all paths
 */
export function calculateTotalXP(paths: PathProgress[]): number {
  return paths.reduce((sum, path) => sum + path.totalXP, 0);
}

/**
 * Check if user qualifies for VIP status
 */
export function checkVIPStatus(paths: PathProgress[]): {
  isVip: boolean;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null;
} {
  const userPath = paths.find((p) => p.path === 'user');
  if (!userPath) return { isVip: false, tier: null };

  const level = userPath.level;

  if (level >= 25) return { isVip: true, tier: 'Platinum' };
  if (level >= 20) return { isVip: true, tier: 'Gold' };
  if (level >= 15) return { isVip: true, tier: 'Silver' };
  if (level >= 10) return { isVip: true, tier: 'Bronze' };

  return { isVip: false, tier: null };
}

/**
 * Award XP to a user path and calculate level changes
 */
export function awardXP(
  currentPath: PathProgress,
  xpAmount: number
): {
  updatedPath: PathProgress;
  leveledUp: boolean;
  levelsGained: number;
} {
  const newTotalXP = currentPath.totalXP + xpAmount;
  const { level: newLevel, currentXP, requiredXP } = calculateLevelFromXP(newTotalXP);

  const leveledUp = newLevel > currentPath.level;
  const levelsGained = newLevel - currentPath.level;

  const updatedPath: PathProgress = {
    ...currentPath,
    level: newLevel,
    currentXP,
    requiredXP,
    totalXP: newTotalXP,
    label: getPathLabel(currentPath.path, newLevel),
  };

  return {
    updatedPath,
    leveledUp,
    levelsGained,
  };
}

/**
 * Initialize a new path progress for a user
 */
export function initializePathProgress(path: UserPath): PathProgress {
  return {
    path,
    level: 1,
    currentXP: 0,
    requiredXP: calculateXPForNextLevel(1),
    totalXP: 0,
    label: getPathLabel(path, 1),
    color: getPathColor(path),
  };
}

/**
 * Format XP with commas for display
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get perks for VIP tier
 */
export function getVIPPerks(tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'): string[] {
  const perks: Record<string, string[]> = {
    Bronze: [
      'Early access to new events',
      '5% discount on bookings',
      'Bronze badge on profile',
    ],
    Silver: [
      'Priority customer support',
      '10% discount on bookings',
      'Access to exclusive events',
      'Silver badge on profile',
    ],
    Gold: [
      'VIP concierge service',
      '15% discount on bookings',
      'Skip the line at venues',
      'Gold badge on profile',
      'Complimentary upgrades',
    ],
    Platinum: [
      'Personal event planner',
      '25% discount on bookings',
      'Exclusive Platinum events',
      'Platinum badge on profile',
      'Premium venue access',
      'Lifetime VIP status',
    ],
  };

  return perks[tier] || [];
}
