"use server";

import { cookies } from "next/headers";
import axios from "axios";
import { config as appConfig } from "@/shared/lib/config";
import { LoginResponse } from "@/features/auth/types/auth";

/**
 * Server action to set authentication cookies
 * Called after successful login from client
 */
/**
 * Cookie lifetimes are derived from the tokens they carry, not picked
 * independently. They used to disagree - the access cookie lived 7 days while
 * its JWT expired in 15 minutes, and the refresh cookie lived 30 days while its
 * JWT lasted 7 - which left the browser holding credentials the server had
 * already stopped honouring.
 *
 * The refresh cookie is the one that defines how long a session survives; the
 * access cookie matches it because the proxy silently refreshes an expired
 * access token, so there is no value in expiring the cookie sooner.
 */
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // must match REFRESH_TOKEN_EXPIRY

export async function setAuthCookies(loginResponse: LoginResponse) {
  const cookieStore = await cookies();

  const { accessToken, refreshToken, user } = loginResponse;

  // Set token cookie (accessible to middleware)
  cookieStore.set("fox_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  // Set refresh token
  if (refreshToken) {
    cookieStore.set("fox_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  }

  // Set user info (not HTTP-only so the client can read it for display).
  // The access token is deliberately NOT included: this cookie is readable by
  // any script on the page, so embedding the token here would undo the
  // httpOnly protection on `fox_token` and hand it to any XSS.
  cookieStore.set("fox_user", JSON.stringify(user), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return true;
}

/**
 * Server action to refresh the JWT and fetch the latest profile.
 * Uses the refresh token to issue a new access token so the backend
 * sees the updated roleType (e.g. after a mayor/host application is approved).
 * Returns the updated user object, or null if tokens are missing/expired.
 */
export async function refreshUserSession(): Promise<Record<
  string,
  any
> | null> {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("fox_refresh_token")?.value;
  if (!refreshToken) return null;

  try {
    // Step 1: get a brand-new access token that reflects current DB roles
    const { data: tokenData } = await axios.post(
      `${appConfig.apiUrl}/auth/refresh-token`,
      { refreshToken },
    );
    const newAccessToken: string = tokenData.accessToken;
    if (!newAccessToken) return null;

    // Step 2: update fox_token cookie with the new JWT
    cookieStore.set("fox_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    // Step 3: fetch fresh profile using the new token
    const { data: profileData } = await axios.get(
      `${appConfig.apiUrl}/profile`,
      {
        headers: { Authorization: `Bearer ${newAccessToken}` },
      },
    );
    const freshUser = profileData?.data || profileData;
    if (!freshUser) return null;

    // Profile data only — see the note in `setAuthCookies` about keeping the
    // access token out of this browser-readable cookie.
    cookieStore.set("fox_user", JSON.stringify(freshUser), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return freshUser;
  } catch {
    return null;
  }
}

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
