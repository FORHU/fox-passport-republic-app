import { useAuthStore, type BookingSummary } from "@/shared/auth/useAuthStore";
import { APP_HOME } from "@/shared/lib/dashboard-path";

// sessionStorage, not state: Google/Facebook sign-in leaves the site and comes
// back on a fresh page load, in the same tab.
const KEY = "fox_return_to";

/** Remember where a signed-out user was headed, then open sign-in. */
export function signInThen(path: string) {
  sessionStorage.setItem(KEY, path);
  useAuthStore.getState().openLogin();
}

/**
 * Reserving while signed out: remember the booking, then open the sign-up form
 * (the same Create Account form) with the package shown beside it.
 */
export function signUpThen(path: string, summary: BookingSummary) {
  sessionStorage.setItem(KEY, path);
  useAuthStore.getState().openSignupFor(summary);
}

/** Where to go after authenticating: the remembered path (once), else the app home. */
export function takeReturnTo(): string {
  const path = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  // Same-origin paths only, so this can never become an open redirect.
  return path?.startsWith("/") && !path.startsWith("//") ? path : APP_HOME;
}
