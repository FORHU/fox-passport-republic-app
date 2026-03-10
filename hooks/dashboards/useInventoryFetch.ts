import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import api from "@/lib/axios";
import { InventoryItem } from "@/data/dashboardData";

/**
 * Hook to fetch user's inventory (assets) from the API
 * Stores results in dashboard store
 */
export function useInventoryFetch() {
  const setInventory = useDashboardStore((state) => state.setInventory);
  const setIsLoadingInventory = useDashboardStore(
    (state) => state.setIsLoadingInventory
  );

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoadingInventory(true);
        // Get user ID from localStorage
        const storedUser = localStorage.getItem("fox_user");
        if (!storedUser) {
          console.warn("[useInventoryFetch] No user found in localStorage");
          setIsLoadingInventory(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const userId = user.id || user.userId;

        if (!userId) {
          console.warn("[useInventoryFetch] No userId in stored user");
          setIsLoadingInventory(false);
          return;
        }

        // Fetch assets for this user
        const response = await api.get("/v1/assets", {
          params: { ownerId: userId },
        });

        if (response.data?.assets) {
          // Transform API assets to InventoryItem format
          const inventoryItems: InventoryItem[] = response.data.assets.map(
            (asset: any) => ({
              id: asset.id,
              name: asset.name,
              category:
                asset.category?.name || asset.category?.slug ||
                (asset.categoryId != null ? String(asset.categoryId) : null) ||
                "Uncategorized",
              // status must be one of the options defined in STATUS_OPTIONS.inventory
              // the server currently doesn't track state, so default to Available
              status: "Available",
              img:
                asset.assetImages?.[0]?.url || "/placeholder-inventory.jpg",
            })
          );

          setInventory(inventoryItems);
          console.log(
            "[useInventoryFetch] Loaded",
            inventoryItems.length,
            "assets"
          );
        }
      } catch (error) {
        console.error("[useInventoryFetch] Error fetching inventory:", error);
      } finally {
        setIsLoadingInventory(false);
      }
    };

    fetchInventory();
  }, [setInventory, setIsLoadingInventory]);
}
