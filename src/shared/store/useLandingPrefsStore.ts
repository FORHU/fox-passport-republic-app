import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LandingPrefsState {
  /** The landing page's event grid (the Reserve cards) is shown. */
  showEvents: boolean;
  setShowEvents: (showEvents: boolean) => void;
}

// A per-visitor display preference, so it lives in this browser only (app#380).
// The header's switch writes it; the landing page reads it. skipHydration keeps
// the server render and the first client render identical (grid shown); the
// landing page rehydrates from storage once it has mounted.
export const useLandingPrefsStore = create<LandingPrefsState>()(
  persist(
    (set) => ({
      showEvents: true,
      setShowEvents: (showEvents) => set({ showEvents }),
    }),
    {
      name: "landing-prefs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ showEvents: state.showEvents }),
      skipHydration: true,
    },
  ),
);
