import { create } from "zustand";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  type Theme,
} from "@/shared/lib/theme";
import { useMapThemeStore } from "@/shared/store/useMapThemeStore";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Light or dark for the whole app. Starts from whatever the pre-paint script
 * already put on <html>, so the store and the page never disagree; saving is
 * a plain string (not zustand's persist format) because that script reads it
 * before any of this code loads.
 *
 * Choosing a theme also moves every map to match. A map can still be flipped
 * on its own afterwards with its control.
 */
export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: currentTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Private mode or blocked storage: the theme still applies for now.
    }
    useMapThemeStore.getState().setTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));
