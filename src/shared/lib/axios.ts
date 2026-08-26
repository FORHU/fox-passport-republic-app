// src/lib/axios.ts
import axios from "axios";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // The proxy already tried a refresh. A 401 reaching here means the refresh
    // cookie is gone or expired, so the session is genuinely over.
    const url: string = error.config?.url ?? "";
    if (
      error.response?.status === 401 &&
      !url.includes("/auth/refresh-token") &&
      !url.includes("/auth/login") &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/?auth=expired")
    ) {
      // Profile display data only; the tokens live in httpOnly cookies and are
      // cleared by the logout server action.
      localStorage.removeItem("fox_user");
      window.location.href = "/?auth=expired";
    }
    return Promise.reject(error);
  },
);

export default api;
