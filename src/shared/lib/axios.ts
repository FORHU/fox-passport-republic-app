// src/lib/axios.ts
import axios from "axios";
import { isPreSessionAuthPath } from "@/shared/auth/public-endpoints";
import { endSession } from "@/shared/auth/endSession";

/**
 * Client-side API access.
 *
 * Requests go to the Next proxy (`src/app/api/proxy/[...path]/route.ts`), not
 * to the backend directly. The proxy reads the httpOnly `fox_token` cookie and
 * adds the Authorization header server-side, which is why there is no request
 * interceptor here and no token in `localStorage`.
 *
 * That removes three problems at once:
 *  - the access and refresh tokens are no longer readable by any script on the
 *    page, so `fox_token` being httpOnly is worth something again;
 *  - there is one token store instead of two that drifted apart on every
 *    client-side refresh;
 *  - refreshing is handled in one place that can actually persist the result,
 *    so there is no 401 stampede to serialise.
 *
 * Same-origin, so `withCredentials` is unnecessary — cookies are sent anyway.
 */
const api = axios.create({
  baseURL: "/api/proxy",
});

/**
 * One session-end per page, however many requests 401 at once.
 *
 * A dashboard fires several queries in parallel; when the session dies they all
 * come back 401 together. Without this every one of them would run its own
 * `endSession` (each with its own POST to /auth/logout) and set
 * `location.href` again. The previous guard - `location.pathname.startsWith(
 * "/?auth=expired")` - could never be true, because `pathname` is "/" and never
 * carries the query string.
 */
let sessionEnding = false;

export async function handleAuthError(error: unknown) {
  const err = error as {
    config?: { url?: string };
    response?: { status?: number };
  };

  // The proxy already tried a refresh. A 401 reaching here means the refresh
  // cookie is gone or expired, so the session is genuinely over.
  const url = err.config?.url ?? "";
  if (
    err.response?.status === 401 &&
    // Sign-in and the rest of the pre-session surface come through here too. A
    // 401 from those is a wrong password, not a dead session; reading it as one
    // would throw the user out of the login modal rather than show the error.
    // One shared list rather than a hand-rolled pair of `includes` checks - the
    // proxy consults the same one, and they must not drift.
    !isPreSessionAuthPath(url) &&
    typeof window !== "undefined" &&
    !sessionEnding
  ) {
    sessionEnding = true;
    // Awaited before navigating. `location.href` unloads the page, which aborts
    // an in-flight server action - and this used to clear `fox_user` from
    // localStorage and nothing else, leaving the httpOnly cookies alive. The
    // landing page then read the surviving `fox_user` cookie and rehydrated as
    // signed-in on a dead session, whose next request 401'd and redirected
    // here again.
    await endSession();
    window.location.href = "/?auth=expired";
  }
  return Promise.reject(error);
}

api.interceptors.response.use((response) => response, handleAuthError);

export default api;
