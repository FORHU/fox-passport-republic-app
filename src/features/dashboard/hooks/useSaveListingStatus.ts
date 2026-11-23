"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import {
  ASSET_STATUS_TO_API,
  SERVICE_STATUS_TO_API,
} from "@/shared/data/listingBuilderData";

export type ListingKind = "asset" | "service";

const STATUS_TO_API: Record<ListingKind, Record<string, string>> = {
  asset: ASSET_STATUS_TO_API,
  service: SERVICE_STATUS_TO_API,
};

/**
 * Saves the status an owner picks from a listing card's badge.
 *
 * Calls the API through shared axios rather than `updateAsset` /
 * `updateService`: the dashboard feature may not import other features
 * (tools/validate-architecture.mjs).
 *
 * Resolves to the status the API now has, or null when the save failed (a
 * toast has then said why), so the caller changes the badge only on success.
 */
export function useSaveListingStatus() {
  const queryClient = useQueryClient();

  return useCallback(
    async (
      kind: ListingKind,
      id: number | string,
      uiStatus: string,
    ): Promise<string | null> => {
      const status = STATUS_TO_API[kind][uiStatus] ?? uiStatus;
      try {
        await api.put(`/${kind}/${id}`, { status });
        // The dashboard overview's lists, and the detail and booking pages
        // (assetQueryKey / serviceQueryKey build the same key).
        queryClient.invalidateQueries({
          queryKey: ["host-data", kind === "asset" ? "assets" : "services"],
        });
        queryClient.invalidateQueries({ queryKey: [kind, String(id)] });
        toast.success("Status updated");
        return status;
      } catch (err: any) {
        console.error(
          "[useSaveListingStatus]",
          err?.response?.status,
          err?.response?.data,
        );
        toast.error(err?.response?.data?.message ?? "Failed to update status");
        return null;
      }
    },
    [queryClient],
  );
}
