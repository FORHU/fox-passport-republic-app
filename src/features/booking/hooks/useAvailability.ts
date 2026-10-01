"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAssetAvailability,
  fetchServiceAvailability,
  fetchTemplateAvailability,
} from "@/features/booking/api/bookings";

// Availability changes whenever anyone books, so these are always treated as
// stale: a revisit paints the cached calendar at once (no spinner) and
// refetches behind it, rather than trusting a 30s-old copy to pick dates from.
const AVAILABILITY_OPTIONS = { staleTime: 0 } as const;

export function useAssetAvailability(assetId: string | undefined) {
  return useQuery({
    queryKey: ["availability", "asset", assetId],
    queryFn: () => fetchAssetAvailability(assetId!),
    enabled: !!assetId,
    ...AVAILABILITY_OPTIONS,
  });
}

/** `location` (where the citizen's event is) decides which of the
 * provider's travel days still apply — see fetchServiceAvailability. */
export function useServiceAvailability(
  serviceId: string | undefined,
  location?: string,
) {
  return useQuery({
    queryKey: ["availability", "service", serviceId, location ?? ""],
    queryFn: () => fetchServiceAvailability(serviceId!, location),
    // A new location shouldn't blank the calendar while it refetches.
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
