import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

/**
 * Hook to fetch user's inventory (assets) from the API
 * Uses the refetchInventory action from the dashboard store
 */
export function useInventoryFetch() {
  const refetchInventory = useDashboardStore((state) => state.refetchInventory);

  useEffect(() => {
    refetchInventory();
  }, [refetchInventory]);
}
