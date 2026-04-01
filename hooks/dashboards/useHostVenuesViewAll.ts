"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchVenuesByHostId } from "@/lib/api/venues";
import { mapBackendVenueToVenueItem } from "@/lib/mappers/hostDashboard";
import type { VenueItem } from "@/data/dashboardData";
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
    record?.created_by,
    record?.creator_id,
    record?.createdById,
    record?.creator?.id,
    record?.host?.id,
    record?.organizer?.id,
    record?.owner?.id,
  ];

  return candidates.some((c) => c != null && String(c) === idStr);
}

export function useHostVenuesViewAll() {
  const user = useAuthStore((state) => state.user);
  const hostId = (user as any)?.id || (user as any)?.userId;

  const query = useQuery({
    queryKey: ["host-venues-view-all", hostId],
    queryFn: async () => {
      if (!hostId) return [] as VenueItem[];

      const raw = await fetchVenuesByHostId(hostId);
      const filtered = raw.filter((vn) => belongsToHost(vn, hostId));
      return filtered.map(mapBackendVenueToVenueItem);
    },
    enabled: !!hostId,
    staleTime: 30_000,
  });

  const venues = useMemo(() => query.data ?? [], [query.data]);

  return {
    venues,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

