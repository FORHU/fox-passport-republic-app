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
import { fetchAssetsByHostId } from "@/lib/api/assets";
import { fetchServicesByHostId } from "@/lib/api/services";
import {
  mapBackendAssetToInventoryItem,
  mapBackendServiceToServiceItem,
} from "@/lib/mappers/listings";

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

  // Actions - Set Data
  setEvents: (events: EventItem[]) => void;
  setVenues: (venues: VenueItem[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setIsLoadingInventory: (loading: boolean) => void;

  // Actions - Data Updates
  updateEventStatus: (id: number | string, status: string) => void;
  updateVenueStatus: (id: number | string, status: string) => void;
  updateInventoryStatus: (id: number | string, status: string) => void;
  updateServiceStatus: (id: number | string, status: string) => void;

  // Actions - Fetching
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

  // Data Set Actions
  setEvents: (events) => set({ events }),
  setVenues: (venues) => set({ venues }),
  setInventory: (inventory) => set({ inventory }),
  setIsLoadingInventory: (loading) => set({ isLoadingInventory: loading }),

  // Fetching Actions
  refetchInventory: async () => {
    set({ isLoadingInventory: true });
    try {
      const stored = localStorage.getItem("fox_user");
      if (!stored) {
        set({ isLoadingInventory: false });
        return;
      }
      const user = JSON.parse(stored);
      const userId = user.userId || user.id;
      if (!userId) {
        set({ isLoadingInventory: false });
        return;
      }

      console.log("[DashboardStore] Fetching listings for user:", userId);

      const [assets, services] = await Promise.all([
        fetchAssetsByHostId(userId),
        fetchServicesByHostId(userId),
      ]);

      const inventoryItems: InventoryItem[] = assets.slice(0, 2).map(mapBackendAssetToInventoryItem);
      const serviceItems: ServiceItem[] = services.slice(0, 2).map(mapBackendServiceToServiceItem);

      console.log("[DashboardStore] Final count (limited to latest 2):", {
        inventory: inventoryItems.length,
        services: serviceItems.length,
      });

      set({ inventory: inventoryItems, services: serviceItems });
    } catch (error) {
      console.error("[DashboardStore] Error refetching inventory:", error);
    } finally {
      set({ isLoadingInventory: false });
    }
  },

  // UI State Actions
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
