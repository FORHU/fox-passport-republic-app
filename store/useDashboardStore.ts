import { create } from "zustand";

interface DashboardState {
  // UI State only (DB data moved to server components)
  isCalendarOpen: boolean;
  isCreateMenuOpen: boolean;

  // Actions - UI State
  setCalendarOpen: (open: boolean) => void;
  setCreateMenuOpen: (open: boolean) => void;

  // Actions - Status Updates (for optimistic UI updates)
  updateEventStatus: (id: number | string, status: string) => void;
  updateVenueStatus: (id: number | string, status: string) => void;
  updateInventoryStatus: (id: number | string, status: string) => void;
  updateServiceStatus: (id: number | string, status: string) => void;

  // Actions - Reset
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial UI State
  isCalendarOpen: false,
  isCreateMenuOpen: false,

  // UI State Actions
  setCalendarOpen: (open) => set({ isCalendarOpen: open }),
  setCreateMenuOpen: (open) => set({ isCreateMenuOpen: open }),

  // Status Update Actions (for optimistic updates - data is server-managed)
  updateEventStatus: () => {
    // Status updates now handled server-side
    // This can be used for optimistic UI updates if needed
  },
  updateVenueStatus: () => {
    // Status updates now handled server-side
  },
  updateInventoryStatus: () => {
    // Status updates now handled server-side
  },
  updateServiceStatus: () => {
    // Status updates now handled server-side
  },

  // Reset Action
  reset: () => set({
    isCalendarOpen: false,
    isCreateMenuOpen: false,
  }),
}));


// Selectors
export const useDashboardData = () =>
  useDashboardStore((state) => ({
    // Only UI state is available in the store
    isCalendarOpen: state.isCalendarOpen,
    isCreateMenuOpen: state.isCreateMenuOpen,
  }));

export const useDashboardUI = () =>
  useDashboardStore((state) => ({
    isCalendarOpen: state.isCalendarOpen,
    isCreateMenuOpen: state.isCreateMenuOpen,
  }));
