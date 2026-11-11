import api from "@/shared/lib/axios";

export interface WalletHistoryItem {
  id: string;
  type: "EARNED" | "REVERSED" | "REDEMPTION" | "RELEASED" | "RETURNED";
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

/** One history row as `GET /rewards/me` sends it. */
interface ApiWalletHistoryItem {
  id: string;
  type: "grant" | "lifecycle";
  action?: string;
  lifecycleType?: string;
  coinsDelta: number;
  refType?: string;
  refId?: string;
  reason?: string | null;
  isPending?: boolean;
  createdAt: string;
}

const LIFECYCLE_TYPE: Record<string, WalletHistoryItem["type"]> = {
  RELEASE: "RELEASED",
  REDEMPTION: "REDEMPTION",
  REVERSAL: "REVERSED",
  VOUCHER_RETURN: "RETURNED",
};

/**
 * Maps an API history row onto the wallet's own shape: a grant is EARNED and
 * named by its action; a lifecycle row is named by its reason (a redemption's
 * reason carries its voucher code, which checkout reads).
 */
export function toWalletHistoryItem(
  h: ApiWalletHistoryItem,
): WalletHistoryItem {
  const isGrant = h.type === "grant";
  return {
    id: h.id,
    type: isGrant
      ? "EARNED"
      : (LIFECYCLE_TYPE[h.lifecycleType ?? ""] ?? "EARNED"),
    action: (isGrant ? h.action : (h.reason ?? h.lifecycleType)) ?? "",
    coins: h.coinsDelta,
    status: h.isPending ? "PENDING" : "COMPLETED",
    createdAt: h.createdAt,
    ...(h.refType && { metadata: { refType: h.refType, refId: h.refId } }),
  };
}

/**
 * Fetches the user's rewards wallet, balance, and ledger history.
 */
export async function getRewardsWallet(): Promise<RewardsWallet> {
  const res = await api.get("/rewards/me");
  const data = res.data.data;
  return {
    ...data,
    history: (data?.history ?? []).map(toWalletHistoryItem),
  };
}

/**
 * Fetches the active rewards catalog with affordability checks. There is no level lock.
 */
export async function getRewardsCatalog(
  audience?: string,
): Promise<RewardCatalogItem[]> {
  const url = audience
    ? `/rewards/catalog?audience=${audience}`
    : "/rewards/catalog";
  const res = await api.get(url);
  return res.data.data;
}

/**
 * Redeems Tokens (the `coins` ledger) for a specific catalog reward.
 */
export async function redeemReward(
  rewardId: string,
): Promise<RedeemRewardResult> {
  const res = await api.post("/rewards/redeem", { rewardId });
  return res.data.data;
}
