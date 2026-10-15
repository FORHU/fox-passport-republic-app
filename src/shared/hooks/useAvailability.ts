"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAssetAvailability,
  fetchServiceAvailability,
  fetchTemplateAvailability,
} from "@/shared/api/availability";

const AVAILABILITY_OPTIONS = { staleTime: 0 } as const;

export function useAssetAvailability(assetId: string | undefined) {
  return useQuery({
    queryKey: ["availability", "asset", assetId],
    queryFn: () => fetchAssetAvailability(assetId!),
    enabled: !!assetId,
    ...AVAILABILITY_OPTIONS,
  });
}

export function useServiceAvailability(
  serviceId: string | undefined,
  location?: string,
) {
  return useQuery({
    queryKey: ["availability", "service", serviceId, location ?? ""],
    queryFn: () => fetchServiceAvailability(serviceId!, location),
    placeholderData: (previous) => previous,
    enabled: !!serviceId,
    ...AVAILABILITY_OPTIONS,
  });
}

export function useTemplateAvailability(templateId: string | undefined) {
  return useQuery({
    queryKey: ["availability", "template", templateId],
    queryFn: () => fetchTemplateAvailability(templateId!),
    enabled: !!templateId,
    ...AVAILABILITY_OPTIONS,
  });
}
