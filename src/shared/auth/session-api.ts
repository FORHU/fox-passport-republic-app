"use client";

import api from "@/shared/lib/axios";
import { authClient } from "@/shared/auth/auth-client";
import type { User } from "@/shared/auth/types";

/**
 * Session calls. Sessions are Better Auth's (docs/BETTER-AUTH-CONSOLIDATION.md
 * in the API repo): it sets its own cookie, so nothing here reads or writes
 * one, and there is no token pair to rotate.
 */

/**
 * The signed-in user as the API sees them right now, permissions included.
 * Better Auth reads the user fresh on every request, so this is also how a
 * role granted mid-session is picked up. `null` when signed out.
 */
export async function refreshSession(): Promise<User | null> {
  try {
    const { data } = await api.get("/profile");
    return ((data?.data ?? data) as User) || null;
  } catch {
    return null;
  }
}

export type SocialProvider = "google" | "facebook";

/**
 * Sends the browser to Google or Facebook through Better Auth. It comes back to
 * `/auth/<provider>/callback`, with `?new=1` for a first sign-in and
 * `?error=...` if it failed — the session cookie is already set by then.
 */
export async function startSocialSignIn(provider: SocialProvider) {
  const back = `${window.location.origin}/auth/${provider}/callback`;
  await authClient.signIn.social({
    provider,
    callbackURL: back,
    newUserCallbackURL: `${back}?new=1`,
    errorCallbackURL: back,
  });
}
