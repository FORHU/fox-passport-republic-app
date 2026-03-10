import { create } from "zustand";
import api from "@/lib/axios";
import {
  EventItem,
  VenueItem,
  InventoryItem,
  ServiceItem,
  INITIAL_EVENTS,
  INITIAL_VENUES,
  INITIAL_INVENTORY,
  INITIAL_SERVICES,
} from "@/data/dashboardData";

interface DashboardState {
  // Data
  events: EventItem[];
  venues: VenueItem[];
  inventory: InventoryItem[];
  services: ServiceItem[];
  isLoadingInventory: boolean;

  // UI State
  isCalendarOpen: boolean;
  isCreateMenuOpen: boolean;

  // Actions - Data Updates
  updateEventStatus: (id: number, status: string) => void;
  updateVenueStatus: (id: number, status: string) => void;
  updateInventoryStatus: (id: number, status: string) => void;
  updateServiceStatus: (id: number, status: string) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  addInventoryItem: (item: InventoryItem) => void;
  setIsLoadingInventory: (loading: boolean) => void;
  refetchInventory: () => Promise<void>;

  // Actions - UI State
  setCalendarOpen: (open: boolean) => void;
  setCreateMenuOpen: (open: boolean) => void;

  // Actions - Reset
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial Data
  events: INITIAL_EVENTS,
  venues: INITIAL_VENUES,
  inventory: INITIAL_INVENTORY,
  services: INITIAL_SERVICES,
  isLoadingInventory: false,

  // Initial UI State
  isCalendarOpen: false,
  isCreateMenuOpen: false,

  // Data Update Actions
  updateEventStatus: (id, status) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, status } : e)),
    })),

  updateVenueStatus: (id, status) =>
    set((state) => ({
      venues: state.venues.map((v) => (v.id === id ? { ...v, status } : v)),
    })),

  updateInventoryStatus: (id, status) =>
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === id ? { ...i, status } : i
      ),
    })),

  updateServiceStatus: (id, status) =>
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, status } : s)),
    })),

  // Set inventory from API
  setInventory: (inventory) => set({ inventory }),

  // Add a single inventory item
  addInventoryItem: (item) =>
    set((state) => ({
      inventory: [item, ...state.inventory],
    })),

  // Set loading state
  setIsLoadingInventory: (loading) => set({ isLoadingInventory: loading }),

  // Refetch inventory from API
  refetchInventory: async () => {
    try {
      const state = useDashboardStore.getState();
      state.setIsLoadingInventory(true);

      const storedUser = localStorage.getItem("fox_user");
      if (!storedUser) {
        state.setIsLoadingInventory(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user.id || user.userId;

      if (!userId) {
        state.setIsLoadingInventory(false);
        return;
      }

      const response = await api.get("/v1/assets", {
        params: { ownerId: userId },
      });

      if (response.data?.assets) {
        const inventoryItems: InventoryItem[] = response.data.assets.map(
          (asset: any) => ({
            id: asset.id,
            name: asset.name,
            category:
              asset.category?.name || asset.category?.slug ||
              (asset.categoryId != null ? String(asset.categoryId) : null) ||
              "Uncategorized",
            status: "active",
            img: asset.assetImages?.[0]?.url || "/placeholder-inventory.jpg",
          })
        );

        state.setInventory(inventoryItems);
      }

      state.setIsLoadingInventory(false);
    } catch (error) {
      console.error("[Dashboard] Error refetching inventory:", error);
      useDashboardStore.getState().setIsLoadingInventory(false);
    }
  },


  setCalendarOpen: (open) => set({ isCalendarOpen: open }),
  setCreateMenuOpen: (open) => set({ isCreateMenuOpen: open }),

  // Reset
  reset: () =>
    set({
      events: INITIAL_EVENTS,
      venues: INITIAL_VENUES,
      inventory: INITIAL_INVENTORY,
      services: INITIAL_SERVICES,
      isLoadingInventory: false,
      isCalendarOpen: false,
      isCreateMenuOpen: false,
    }),
}));

// Selectors
export const useDashboardData = () =>
  useDashboardStore((state) => ({
    events: state.events,
    venues: state.venues,
    inventory: state.inventory,
    services: state.services,
  }));

export const useDashboardUI = () =>
  useDashboardStore((state) => ({
    isCalendarOpen: state.isCalendarOpen,
    isCreateMenuOpen: state.isCreateMenuOpen,
  }));
