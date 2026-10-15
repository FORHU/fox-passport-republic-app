"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAssetById } from "@/features/asset/api/assets";

export const assetQueryKey = (assetId: string) => ["asset", assetId] as const;

/**
 * One gear listing by id, cached — the detail page, the booking page and
 * anything else showing it share one entry, so moving between them (or
 * coming back) renders from cache instead of refetching behind a spinner.
 */
export function useAsset(assetId: string | undefined) {
  return useQuery({
    queryKey: assetQueryKey(assetId ?? ""),
    queryFn: () => fetchAssetById(assetId!),
    enabled: !!assetId,
  });
}
