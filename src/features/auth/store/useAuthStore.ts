import { create } from "zustand";
import { User, LoginResponse } from "@/features/auth/types/auth";

type AuthView =
  "login" | "signup" | "forgot-password" | "reset-password" | "verify-email";

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isOpen: boolean;
  view: AuthView;
  pendingEmail: string | null;

  // Actions
  initialize: () => void;
  openLogin: () => void;
  openSignup: () => void;
  setView: (view: AuthView) => void;
  setPendingEmail: (email: string) => void;
  close: () => void;
  toggleView: () => void;
  setLoading: (loading: boolean) => void;
  /**
   * Takes the login response but reads only `user` from it: the tokens in that
   * payload are persisted as httpOnly cookies by the `setAuthCookies` server
   * action, never client-side. Accepting `{ user }` alone also lets a rehydrate
   * path pass a stored profile without inventing fake tokens.
   */
  login: (loginResponse: Pick<LoginResponse, "user">) => void;
  setUser: (user: User) => void;
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
  pendingEmail: null,

  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      // Tokens live in httpOnly cookies and are deliberately unreadable here.
      // `fox_user` is profile display data only, so presence of a stored user
      // is what rehydrates the session optimistically; the first proxied
      // request settles whether the cookie is still valid.
      const storedUser = localStorage.getItem("fox_user");

      if (storedUser) {
        set({
          user: JSON.parse(storedUser),
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
  setView: (view) => set({ view }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
  close: () => set({ isOpen: false }),
  toggleView: () =>
    set((state) => ({
      view: state.view === "login" ? "signup" : "login",
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  // `fox_user` holds profile data only. The token lives under `fox_token`;
  // duplicating it inside the user object just widened its exposure.
  setUser: (user) => {
    localStorage.setItem("fox_user", JSON.stringify(user));
    set({ user });
  },

  login: (loginResponse) => {
    const { user } = loginResponse;

    // Only profile data. The access and refresh tokens are written as httpOnly
    // cookies by the `setAuthCookies` server action - putting copies here is
    // what previously handed the whole session to any XSS on the page.
    localStorage.setItem("fox_user", JSON.stringify(user));

    set({
      isAuthenticated: true,
      user,
      isOpen: false,
      isLoading: false,
    });
  },

  logout: () => {
    // Cookies are cleared by the `clearAuthCookies` server action.
    localStorage.removeItem("fox_user");
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));

// --- SELECTORS (Hooks for clean usage) ---
export const useAuthStatus = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthActions = () => {
  const { openLogin, openSignup, logout, setLoading, login, initialize } =
    useAuthStore();
  return { openLogin, openSignup, logout, setLoading, login, initialize };
};
