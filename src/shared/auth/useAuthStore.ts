import { create } from "zustand";
import { User, LoginResponse } from "@/shared/auth/types";

/**
 * Reads the `fox_user` cookie `setAuthCookies` sets alongside the httpOnly
 * token cookies. Non-httpOnly by design (see `setAuthCookies`), carrying
 * profile data and no token.
 *
 * The cookie exists for the server, not for this: `getUser` in
 * `shared/lib/server/auth.ts` parses it when the API is unreachable, and
 * localStorage is invisible from there. Here it is only the fallback — see
 * `initialize`.
 */
function readFoxUserCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )fox_user=([^;]*)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

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
      //
      // localStorage first, cookie second, because localStorage is the fresher
      // of the two: `setUser` rewrites it on every profile fetch, while the
      // `fox_user` cookie is only written at login and by `refreshUserSession`
      // — the proxy's silent refresh does not touch it. Reading the cookie
      // first served a stale name, avatar and `roleType` (which gates UI) on
      // every reload until the next poll landed.
      //
      // The cookie remains the fallback for the case localStorage cannot
      // cover: site storage cleared while cookies survive, e.g. by a privacy
      // tool, where the session is still live and dropping to "logged out"
      // would be wrong.
      const storedUser =
        localStorage.getItem("fox_user") ?? readFoxUserCookie();

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
    // Client state only. Cookies are the server action's job — call
    // `endSession` rather than this directly, so the two cannot drift.
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
