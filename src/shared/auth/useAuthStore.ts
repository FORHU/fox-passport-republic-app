import { create } from "zustand";
import { User, LoginResponse } from "@/shared/auth/types";

type AuthView =
  "login" | "signup" | "forgot-password" | "reset-password" | "verify-email";

const PENDING_VERIFICATION_EMAIL_KEY = "fp_pending_verification_email";

// Written by the old custom sign-in and never by anything now, but browsers
// from that time still carry it, naming whoever signed in back then.
const dropLegacyUserCookie = () => {
  document.cookie = "fox_user=; path=/; max-age=0";
};

/** The package a signed-out visitor is reserving, shown beside the sign-up form. */
export interface BookingSummary {
  title: string;
  image?: string;
  place?: string;
  date?: string;
  price?: number;
}

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
  bookingSummary: BookingSummary | null;
  /**
   * Changes on every login and logout. A profile request that started under
   * one session and answers under the next is the previous account's, and
   * `fetchProfile` drops it rather than writing it into the store.
   */
  sessionEpoch: number;

  // Actions
  initialize: () => void;
  openLogin: () => void;
  openSignup: () => void;
  /** Sign-up at the moment of booking: the same form, with the package beside it. */
  openSignupFor: (summary: BookingSummary) => void;
  setView: (view: AuthView) => void;
  setPendingEmail: (email: string) => void;
  setPendingVerificationEmail: (email: string) => void;
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
  bookingSummary: null,
  sessionEpoch: 0,

  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      // The session lives in an httpOnly cookie, deliberately unreadable here.
      // `fox_user` in localStorage is profile display data only, so a stored
      // user rehydrates the UI optimistically; the first proxied request
      // settles whether the session is still valid.
      const storedUser = localStorage.getItem("fox_user");
      const pendingVerificationEmail = localStorage.getItem(
        PENDING_VERIFICATION_EMAIL_KEY,
      );

      if (storedUser) {
        set({
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (pendingVerificationEmail) {
        set({
          isOpen: true,
          view: "verify-email",
          pendingEmail: pendingVerificationEmail,
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
  openSignupFor: (summary) =>
    set({ isOpen: true, view: "signup", bookingSummary: summary }),
  setView: (view) => set({ view }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
  setPendingVerificationEmail: (email) => {
    if (email) {
      localStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
    }
    set({ pendingEmail: email });
  },
  close: () => set({ isOpen: false, bookingSummary: null }),
  toggleView: () =>
    set((state) => ({
      view: state.view === "login" ? "signup" : "login",
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  // `fox_user` holds profile data only. The session is an httpOnly cookie;
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
    dropLegacyUserCookie();

    set((state) => ({
      isAuthenticated: true,
      user,
      isOpen: false,
      isLoading: false,
      bookingSummary: null,
      sessionEpoch: state.sessionEpoch + 1,
    }));
  },

  logout: () => {
    // Client state only. Cookies are the server action's job — call
    // `endSession` rather than this directly, so the two cannot drift.
    localStorage.removeItem("fox_user");
    dropLegacyUserCookie();
    set((state) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionEpoch: state.sessionEpoch + 1,
    }));
  },
}));

/**
 * Runs `reset` whenever the signed-in account changes: someone else signing in
 * without logging out first, a sign-out, or a stored profile replaced by the
 * session's real user. Not on the first hydrate, so a reload keeps the user's
 * own state. Stores holding one account's data reset themselves with this, so
 * the next account never sees it (BUG-07).
 */
export function onAccountChange(reset: () => void) {
  return useAuthStore.subscribe((state, prev) => {
    const before = prev.user?.id;
    if (before && state.user?.id !== before) reset();
  });
}

// Per-account state kept in sessionStorage: the checkout and item-booking
// stores (contact details, booking ids, Stripe client secrets) and the
// investment wizard's draft. Removed by name, because a store whose module
// hasn't loaded yet would otherwise rehydrate the previous account's copy.
const ACCOUNT_SESSION_KEYS = [
  "foxpassport-checkout",
  "foxpassport-item-booking",
  "foxpassport_draft_investment_wizard",
];

onAccountChange(() => {
  if (typeof window === "undefined") return;
  for (const key of ACCOUNT_SESSION_KEYS) sessionStorage.removeItem(key);
});

// --- SELECTORS (Hooks for clean usage) ---
export const useAuthStatus = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthActions = () => {
  const { openLogin, openSignup, logout, setLoading, login, initialize } =
    useAuthStore();
  return { openLogin, openSignup, logout, setLoading, login, initialize };
};
