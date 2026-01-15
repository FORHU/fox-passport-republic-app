import { create } from "zustand";
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

  // UI State
  isCalendarOpen: boolean;
  isCreateMenuOpen: boolean;

  // Actions - Data Updates
  updateEventStatus: (id: number, status: string) => void;
  updateVenueStatus: (id: number, status: string) => void;
  updateInventoryStatus: (id: number, status: string) => void;
  updateServiceStatus: (id: number, status: string) => void;

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
