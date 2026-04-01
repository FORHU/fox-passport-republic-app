"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchAssetsByHostId } from "@/lib/api/assets";
import { mapBackendAssetToInventoryItem } from "@/lib/mappers/listings";
import type { InventoryItem } from "@/data/dashboardData";
import type { Id } from "@/lib/api/types";

function belongsToHost(record: any, hostId: Id): boolean {
  const idStr = String(hostId);
  const candidates: unknown[] = [
    record?.hostId,
    record?.host_id,
    record?.ownerId,
    record?.owner_id,
    record?.userId,
    record?.user_id,
    record?.creatorId,
    record?.createdBy,
    record?.createdById,
    record?.creator_id,
    record?.creator?.id,
    record?.host?.id,
    record?.owner?.id,
  ];
  return candidates.some((c) => c != null && String(c) === idStr);
}

export function useHostAssetsViewAll() {
  const user = useAuthStore((state) => state.user);
  const hostId = (user as any)?.id || (user as any)?.userId;

  const query = useQuery({
    queryKey: ["host-assets-view-all", hostId],
    queryFn: async () => {
      if (!hostId) return [] as InventoryItem[];

      const raw = await fetchAssetsByHostId(hostId);
      const filtered = raw.filter((a) => belongsToHost(a, hostId));
      return filtered.map(mapBackendAssetToInventoryItem);
    },
    enabled: !!hostId,
    staleTime: 30_000,
  });

  const inventory = useMemo(() => query.data ?? [], [query.data]);

  return {
    inventory,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

