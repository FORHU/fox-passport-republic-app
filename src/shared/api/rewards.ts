import api from "@/shared/lib/axios";

export interface WalletHistoryItem {
  id: string;
  type: "EARNED" | "REVERSED" | "REDEMPTION" | "RELEASED";
  action: string;
  coins: number;
  status: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface RewardsWallet {
  coins: number;
  pendingCoins: number;
  totalEarnedCoins: number;
  history: WalletHistoryItem[];
}

export interface RewardCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  coinCost: number;
  rewardType: "booking_voucher" | "cosmetic" | "perk";
  targetAudience: "all" | "citizen" | "foxer";
  discountPhp: number | null;
  discountPercentage: number | null;
  active: boolean;
  canAfford?: boolean;
  minSubtotal?: number;
}

export interface RedeemRewardResult {
  redemption: {
    id: string;
    rewardId: string;
    coinsSpent: number;
    createdAt: string;
  };
  voucher: {
    id: string;
    code: string;
    discountPhp: number | null;
    discountPercentage: number | null;
    expiresAt: string;
  };
}

/**
 * Fetches the user's rewards wallet, balance, and ledger history.
 */
export async function getRewardsWallet(): Promise<RewardsWallet> {
  const res = await api.get("/rewards/me");
  return res.data.data;
}

/**
 * Fetches the active rewards catalog with affordability checks. There is no level lock.
 */
export async function getRewardsCatalog(
  audience?: string,
): Promise<RewardCatalogItem[]> {
  const url = audience ? `/rewards/catalog?audience=${audience}` : "/rewards/catalog";
  const res = await api.get(url);
  return res.data.data;
}

/**
 * Redeems Tokens (the `coins` ledger) for a specific catalog reward.
 */
export async function redeemReward(rewardId: string): Promise<RedeemRewardResult> {
  const res = await api.post("/rewards/redeem", { rewardId });
  return res.data.data;
}

