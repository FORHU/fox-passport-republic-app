// Gamification system types

export type UserPath =
  | "user"
  | "eventFoxer"
  | "venueFoxer"
  | "investor"
  | "organizer"
  | "providerFoxer";

export type BadgeRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

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
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    perks: string[];
  };
}

// Level curve (requirements/xp-and-coins.md, section 4.1)
export const XP_PER_LEVEL = 250;
export const XP_MULTIPLIER = 1.12;
export const XP_COST_CAP_LEVEL = 25;

export interface RankInfo {
  tier: number;
  level: number;
  citizenTitle: string;
  foxerTitle: string;
  rarity: BadgeRarity;
  color: string;
  svgPath: string;
}

export const RANK_LADDER: readonly RankInfo[] = [
  {
    tier: 1,
    level: 1,
    citizenTitle: "Newcomer",
    foxerTitle: "Rookie",
    rarity: "Common",
    color: "#A9ADBA",
    svgPath: "/badges/rank-1-newcomer.svg",
  },
  {
    tier: 2,
    level: 3,
    citizenTitle: "Wanderer",
    foxerTitle: "Regular",
    rarity: "Common",
    color: "#A9ADBA",
    svgPath: "/badges/rank-2-wanderer.svg",
  },
  {
    tier: 3,
    level: 5,
    citizenTitle: "Explorer",
    foxerTitle: "Pro",
    rarity: "Uncommon",
    color: "#4ADE80",
    svgPath: "/badges/rank-3-explorer.svg",
  },
  {
    tier: 4,
    level: 10,
    citizenTitle: "Trailblazer",
    foxerTitle: "Veteran",
    rarity: "Uncommon",
    color: "#4ADE80",
    svgPath: "/badges/rank-4-trailblazer.svg",
  },
  {
    tier: 5,
    level: 15,
    citizenTitle: "Voyager",
    foxerTitle: "Headliner",
    rarity: "Rare",
    color: "#00D2FF",
    svgPath: "/badges/rank-5-voyager.svg",
  },
  {
    tier: 6,
    level: 20,
    citizenTitle: "Adventurer",
    foxerTitle: "Maestro",
    rarity: "Rare",
    color: "#00D2FF",
    svgPath: "/badges/rank-6-adventurer.svg",
  },
  {
    tier: 7,
    level: 30,
    citizenTitle: "Pioneer",
    foxerTitle: "Icon",
    rarity: "Epic",
    color: "#E879F9",
    svgPath: "/badges/rank-7-pioneer.svg",
  },
  {
    tier: 8,
    level: 40,
    citizenTitle: "Vanguard",
    foxerTitle: "Luminary",
    rarity: "Epic",
    color: "#E879F9",
    svgPath: "/badges/rank-8-vanguard.svg",
  },
  {
    tier: 9,
    level: 50,
    citizenTitle: "Legend",
    foxerTitle: "Legend",
    rarity: "Legendary",
    color: "#CCFF00",
    svgPath: "/badges/rank-9-legend.svg",
  },
] as const;

export function getRankInfo(
  level: number,
  isCitizen = true,
): RankInfo & { title: string } {
  let matched = RANK_LADDER[0];
  for (const r of RANK_LADDER) {
    if (level >= r.level) {
      matched = r;
    } else {
      break;
    }
  }
  return {
    ...matched,
    title: isCitizen ? matched.citizenTitle : matched.foxerTitle,
  };
}

// Path level labels based on level ranges
export const PATH_LABELS = {
  user: {
    1: "Newcomer",
    5: "Explorer",
    10: "Adventurer",
    15: "Trailblazer",
    20: "VIP Explorer",
  },
  providerFoxer: {
    1: "Starter Foxer",
    5: "Social Butterfly",
    10: "Event Curator",
    15: "Master Foxer",
    20: "Elite Foxer",
  },
  eventFoxer: {
    1: "Event Starter",
    3: "Event Planner",
    7: "Event Pro",
    12: "Premium Creator",
    18: "Super Creator",
  },
  venueFoxer: {
    1: "Ward Officer",
    3: "District Head",
    7: "City Planner",
    12: "City Leader",
    18: "Grand Foxer",
  },
  investor: {
    1: "Seed Funder",
    3: "Angel Investor",
    6: "Venture Partner",
    10: "Major Stakeholder",
    15: "Elite Investor",
  },
  // Earned helping run other people's Venues and Events (the API's ADR 0005).
  organizer: {
    1: "Crew Member",
    3: "Stage Manager",
    7: "Floor Lead",
    12: "Production Chief",
    18: "Master Organizer",
  },
};

// Badge colors by rarity
export const BADGE_COLORS: Record<BadgeRarity, string> = {
  Common: "#A9AFBB", // Slate
  Uncommon: "#ADD13F", // Green
  Rare: "#5C62D6", // Blue
  Epic: "#A3A8F5", // Purple
  Legendary: "#D99A26", // Amber
};

// Path colors
export const PATH_COLORS: Record<UserPath, string> = {
  user: "#ADD13F", // Green
  providerFoxer: "#D99A26", // Orange
  eventFoxer: "#5C62D6", // Blue
  venueFoxer: "#A3A8F5", // Purple
  investor: "#E8B54D", // Yellow
  organizer: "#A3A8F5", // Fuchsia
};

// XP rewards for different actions
export const XP_REWARDS = {
  // User path
  bookEvent: 50,
  attendEvent: 100,
  leaveReview: 25,
  shareEvent: 15,
  referFriend: 200,

  // GearFoxer / ServiceFoxer / PerformerFoxer path
  createListing: 100,
  listingBooked: 150,
  completeEvent: 200,
  receive5StarReview: 50,

  // Organizer path: mirrors ORGANIZER_XP in the API's organizer-xp.service.ts
  organizerEventCompleted: 150,
  organizerGuestCheckedIn: 5,
  organizerCheckInCapPerEvent: 100,

  // VenueFoxer path
  uploadVenue: 75,
  venueBooked: 100,
  venueFeatured: 500,
  venueApproved: 200,
  venueFeaturedPremium: 750,
  cityInitiativeApproved: 500,

  // Investor path
  makeInvestment: 300,
  investmentReturn: 200,
  portfolioMilestone: 1000,
};
