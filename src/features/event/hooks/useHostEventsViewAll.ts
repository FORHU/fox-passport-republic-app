"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { fetchEventsByHostId } from "@/features/event/api/events";
import { mapBackendEventToEventItem } from "@/features/dashboard/mappers/hostDashboard";
import type { EventItem } from "@/features/dashboard/data/dashboardData";
import type { Id } from "@/shared/lib/api-types";

function belongsToHost(record: any, hostId: Id): boolean {
  const idStr = String(hostId);
  const candidates: unknown[] = [
    record?.organizerId,
    record?.organizer_id,
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

export function useHostEventsViewAll() {
  const user = useAuthStore((state) => state.user);
  const hostId = user?.id || user?.userId;

  const query = useQuery({
    queryKey: ["host-events-view-all", hostId],
    queryFn: async () => {
      if (!hostId) return [] as EventItem[];

      const raw = await fetchEventsByHostId(hostId);
      const filtered = raw.filter((ev) => belongsToHost(ev, hostId));
      return filtered.map(mapBackendEventToEventItem);
    },
    enabled: !!hostId,
    staleTime: 30_000,
  });

  const events = useMemo(() => query.data ?? [], [query.data]);

  return {
    events,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

