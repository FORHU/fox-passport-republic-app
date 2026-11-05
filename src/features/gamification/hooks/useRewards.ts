"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRewardsWallet,
  getRewardsCatalog,
  redeemReward,
  type RewardsWallet,
  type RewardCatalogItem,
  type RedeemRewardResult,
} from "../api/rewards";

export function useRewardsWallet() {
  return useQuery<RewardsWallet>({
    queryKey: ["rewards", "wallet"],
    queryFn: getRewardsWallet,
    staleTime: 1000 * 30, // 30s
  });
}

export function useRewardsCatalog(audience?: string) {
  return useQuery<RewardCatalogItem[]>({
    queryKey: ["rewards", "catalog", audience ?? "citizen"],
    queryFn: () => getRewardsCatalog(audience),
    staleTime: 1000 * 60, // 1m
  });
}

export function useRedeemRewardMutation() {
  const queryClient = useQueryClient();

  return useMutation<RedeemRewardResult, Error, string>({
    mutationFn: (rewardId: string) => redeemReward(rewardId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rewards", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "catalog"] });
      queryClient.invalidateQueries({ queryKey: ["passport", "me"] });
      toast.success(
        `Reward redeemed! Voucher code: ${data.voucher.code}`,
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to redeem reward.";
      toast.error(msg);
    },
  });
}

