"use client";

import api from "@/shared/lib/axios";
import type { User } from "@/shared/auth/types";

/**
 * Session calls that need the API's cookies to reach the browser.
 *
 * These were Server Actions. A Server Action runs on the Next server and its
 * fetch to the API receives the `Set-Cookie` headers there - the browser never
 * sees them - so each action had to re-compose the cookies itself from the JSON
 * body, restating names, flags and a lifetime the API owns.
 *
 * Going through the proxy instead means the API's own headers are relayed the
 * whole way. Nothing here reads or writes a cookie; the tokens stay as
 * unreachable from this file as they are from any other client module.
 */

interface RefreshResponse {
  user?: User;
}

/**
 * Trades the current refresh token for a new pair and returns the profile that
 * comes back with it. Used to pick up a role granted mid-session.
 *
 * No argument: the refresh token is httpOnly and unreadable here. The proxy
 * holds it and fills it in - see the explicit-refresh branch in its handler.
 */
export async function refreshSession(): Promise<User | null> {
  try {
    const { data } = await api.post<RefreshResponse>("/auth/refresh-token");
    return data?.user ?? null;
  } catch {
    // A dead or already-rotated token answers 401. The caller treats that as
    // "could not sync" rather than ending the session, because the access
    // token in hand may still be perfectly good.
    return null;
  }
}

interface GoogleExchangeResponse {
  data?: {
    user?: User;
    isNewUser?: boolean;
  };
}

/**
 * Redeems the opaque single-use code the API put on the redirect back here.
 *
 * The code is worthless to anyone who intercepts it a minute later, which is
 * why it - and not the tokens - is what travels in the URL.
 */
export async function completeGoogleAuth(
  exchangeCode: string,
): Promise<{ user: User; isNewUser: boolean } | null> {
  try {
    const { data } = await api.post<GoogleExchangeResponse>(
      "/auth/google/exchange",
      { code: exchangeCode },
    );

    const session = data?.data;
    if (!session?.user) return null;

    return { user: session.user, isNewUser: Boolean(session.isNewUser) };
  } catch {
    return null;
  }
}
