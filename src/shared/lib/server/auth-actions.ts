"use server";

import { cookies } from "next/headers";
import axios from "axios";
import { config as appConfig } from "@/shared/lib/config";

/**
 * What remains of the app's cookie handling.
 *
 * `setAuthCookies`, `refreshUserSession` and `completeGoogleAuth` used to live
 * here. Each one re-composed the session cookies from a JSON body - names,
 * flags, and a `SESSION_MAX_AGE` that had to be kept equal by hand to
 * `REFRESH_TOKEN_EXPIRY` in the API's environment. The API emits its own
 * `Set-Cookie` now and the proxy relays it, so the two paths that needed those
 * headers to reach the browser go through the proxy instead
 * (`shared/auth/session-api.ts`).
 *
 * Clearing stays a Server Action. It is the one operation that does not need
 * relaying: this runs on the Next server, where the httpOnly refresh token is
 * readable, and it can delete the cookies directly. Routing it through the
 * proxy would mean the API needing to read cookies to find the token to revoke,
 * which is the dependency this whole arrangement avoids.
 */

/**
 * Server action to clear authentication cookies on logout
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("fox_refresh_token")?.value;

  // Revoke server-side before dropping the cookie. Logging out used to delete
  // cookies and nothing else - the API's /auth/logout was never called by
  // anything - so the refresh token stayed valid for its full lifetime and a
  // copy of it could keep minting access tokens after the user had "logged
  // out". This is the only place that still holds the token, since it is
  // httpOnly and the browser cannot read it.
  if (refreshToken) {
    try {
      await axios.post(`${appConfig.apiUrl}/auth/logout`, { refreshToken });
    } catch {
      // Never block logout on the network. The cookies are cleared regardless,
      // so the session ends locally either way; the token simply expires on its
      // own if the call did not land.
    }
  }

  cookieStore.delete("fox_token");
  cookieStore.delete("fox_refresh_token");
  cookieStore.delete("fox_user");

  return true;
}
