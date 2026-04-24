import { create } from "zustand";
import { User, LoginResponse } from "@/types/auth";

type AuthView = "login" | "signup";

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isOpen: boolean;
  view: AuthView;

  // Actions
  initialize: () => void;
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
  toggleView: () => void;
  setLoading: (loading: boolean) => void;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true, // Start as true to prevent hydration mismatch
  user: null,
  accessToken: null,
  refreshToken: null,
  isOpen: false,
  view: "login",

  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = localStorage.getItem("fox_user");
      const initialToken = localStorage.getItem("fox_token");
      const initialRefresh = localStorage.getItem("fox_refresh_token");
      
      if (storedUser && initialToken) {
        set({
          user: JSON.parse(storedUser),
          accessToken: initialToken,
          refreshToken: initialRefresh,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error("Failed to hydrate auth store:", e);
      set({ isLoading: false });
    }
  },

  openLogin: () => set({ isOpen: true, view: "login" }),
  openSignup: () => set({ isOpen: true, view: "signup" }),
  close: () => set({ isOpen: false }),
  toggleView: () =>
    set((state) => ({
      view: state.view === "login" ? "signup" : "login",
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  login: (loginResponse) => {
    const { accessToken, refreshToken, user } = loginResponse;
    const storedUser = { ...user, accessToken };

    localStorage.setItem("fox_user", JSON.stringify(storedUser));
    localStorage.setItem("fox_token", accessToken);
    localStorage.setItem("fox_refresh_token", refreshToken);

    set({
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
      isOpen: false,
      isLoading: false
    });
  },

  logout: () => {
    localStorage.removeItem("fox_user");
    localStorage.removeItem("fox_token");
    localStorage.removeItem("fox_refresh_token");
    set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null });
  },
}));

// --- SELECTORS (Hooks for clean usage) ---
export const useAuthStatus = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthActions = () => {
  const { openLogin, openSignup, logout, setLoading, login, initialize } = useAuthStore();
  return { openLogin, openSignup, logout, setLoading, login, initialize };
};
