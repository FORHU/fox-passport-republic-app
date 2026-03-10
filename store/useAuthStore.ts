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
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
  toggleView: () => void;
  setLoading: (loading: boolean) => void;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  isOpen: false,
  view: "login",

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

    // store tokens separately (used by interceptor) and also embed into the
    // serialized user so legacy code that inspects fox_user still picks them up
    const storedUser = { ...user, accessToken };

    // Save both user and tokens to local storage
    localStorage.setItem("fox_user", JSON.stringify(storedUser));
    localStorage.setItem("fox_token", accessToken);
    localStorage.setItem("fox_refresh_token", refreshToken);

    set({
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
      isOpen: false
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
  const { openLogin, openSignup, logout, setLoading, login } = useAuthStore();
  return { openLogin, openSignup, logout, setLoading, login };
};
