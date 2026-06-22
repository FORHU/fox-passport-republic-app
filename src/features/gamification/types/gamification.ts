// Gamification system types

export type UserPath = 'user' | 'foxer' | 'host' | 'mayor' | 'investor';

export type BadgeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string;
  color: string;
  path?: UserPath; // NEW: associate badge with a specific path
  earnedAt?: Date;
  progress?: number; // For badges with progress requirements
  maxProgress?: number;
}

export interface PathProgress {
  path: UserPath;
  level: number;
  currentXP: number;
  requiredXP: number;
  totalXP: number;
  label: string; // e.g., "Social Butterfly", "Venue Curator"
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  path: UserPath;
  icon: string;
  unlockedAt?: Date;
}

export interface Milestone {
  id: string;
  path: UserPath;
  level: number;
  title: string;
  description: string;
  rewards: {
    xp?: number;
    badges?: string[]; // Badge IDs
    perks?: string[]; // Perk descriptions
  };
  isUnlocked: boolean;
}

export interface PassportStamp {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  location: string;
  xpEarned: number;
  badgesEarned?: Badge[];
  imageUrl?: string;
}

export interface UserGamification {
  userId: string;
  paths: PathProgress[];
  totalLevel: number; // Combined level across all paths
  badges: Badge[];
  achievements: Achievement[];
  passportStamps: PassportStamp[];
  vipStatus?: {
    isVip: boolean;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    perks: string[];
  };
}

// XP calculation constants
export const XP_PER_LEVEL = 1000;
export const XP_MULTIPLIER = 1.15; // XP required increases by 15% per level

// Path level labels based on level ranges
export const PATH_LABELS = {
  user: {
    1: 'Newcomer',
    5: 'Explorer',
    10: 'Adventurer',
    15: 'Trailblazer',
    20: 'VIP Explorer',
  },
  foxer: {
    1: 'Starter Foxer',
    5: 'Social Butterfly',
    10: 'Event Curator',
    15: 'Master Foxer',
    20: 'Elite Foxer',
  },
  host: {
    1: 'New Host',
    3: 'Venue Curator',
    7: 'Established Host',
    12: 'Premium Host',
    18: 'Super Host',
  },
  mayor: {
    1: 'Ward Officer',
    3: 'District Head',
    7: 'City Planner',
    12: 'City Mayor',
    18: 'Grand Mayor',
  },
  investor: {
    1: 'Seed Funder',
    3: 'Angel Investor',
    6: 'Venture Partner',
    10: 'Major Stakeholder',
    15: 'Elite Investor',
  },
};

// Badge colors by rarity
export const BADGE_COLORS: Record<BadgeRarity, string> = {
  Common: '#94a3b8', // Slate
  Uncommon: '#22c55e', // Green
  Rare: '#3b82f6', // Blue
  Epic: '#a855f7', // Purple
  Legendary: '#f59e0b', // Amber
};

// Path colors
export const PATH_COLORS: Record<UserPath, string> = {
  user: '#22c55e', // Green
  foxer: '#f97316', // Orange
  host: '#3b82f6', // Blue
  mayor: '#a855f7', // Purple
  investor: '#eab308', // Yellow
};

// XP rewards for different actions
export const XP_REWARDS = {
  // User path
  bookEvent: 50,
  attendEvent: 100,
  leaveReview: 25,
  shareEvent: 15,
  referFriend: 200,

  // Foxer path
  createListing: 100,
  listingBooked: 150,
  completeEvent: 200,
  receive5StarReview: 50,

  // Host path
  uploadVenue: 75,
  venueBooked: 100,
  venueFeatured: 500,

  // Mayor path
  uploadMayorVenue: 100,
  mayorVenueApproved: 200,
  mayorVenueFeatured: 750,
  cityInitiativeApproved: 500,

  // Investor path
  makeInvestment: 300,
  investmentReturn: 200,
  portfolioMilestone: 1000,
};
