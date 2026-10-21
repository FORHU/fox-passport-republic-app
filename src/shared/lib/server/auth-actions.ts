"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIES } from "@/shared/auth/session-cookies";

/**
 * Server action to clear the session cookie on logout.
 *
 * `authClient.signOut()` (see `endSession`) revokes the Better Auth session on
 * the API and clears the cookie in the normal case. This is the backstop for
 * when that call does not land: the cookie is httpOnly, so only the server can
 * delete it, and leaving it would let the next page load look signed in.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  for (const name of SESSION_COOKIES) cookieStore.delete(name);
  return true;
}
