"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchServiceById } from "@/features/service/api/services";

export const serviceQueryKey = (serviceId: string) =>
  ["service", serviceId] as const;

/** One service listing by id, cached and shared across the pages showing it. */
export function useService(serviceId: string | undefined) {
  return useQuery({
    queryKey: serviceQueryKey(serviceId ?? ""),
    queryFn: () => fetchServiceById(serviceId!),
    enabled: !!serviceId,
  });
}
