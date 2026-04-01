"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchServicesByHostId } from "@/lib/api/services";
import { mapBackendServiceToServiceItem } from "@/lib/mappers/listings";
import type { ServiceItem } from "@/data/dashboardData";
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

export function useHostServicesViewAll() {
  const user = useAuthStore((state) => state.user);
  const hostId = (user as any)?.id || (user as any)?.userId;

  const query = useQuery({
    queryKey: ["host-services-view-all", hostId],
    queryFn: async () => {
      if (!hostId) return [] as ServiceItem[];

      const raw = await fetchServicesByHostId(hostId);
      const filtered = raw.filter((s) => belongsToHost(s, hostId));
      return filtered.map(mapBackendServiceToServiceItem);
    },
    enabled: !!hostId,
    staleTime: 30_000,
  });

  const services = useMemo(() => query.data ?? [], [query.data]);

  return {
    services,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

