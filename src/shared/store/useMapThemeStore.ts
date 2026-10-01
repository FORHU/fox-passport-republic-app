import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MapTheme } from "@/shared/lib/mapbox";

interface MapThemeState {
  theme: MapTheme;
  setTheme: (theme: MapTheme) => void;
  toggleTheme: () => void;
}

// A per-viewer display preference, so it lives in this browser only. Every
// map on screen subscribes to it (see MapThemeControl), which is what keeps
// two maps on the same page from showing different basemaps.
export const useMapThemeStore = create<MapThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "map-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
