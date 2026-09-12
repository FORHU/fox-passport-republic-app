"use client";

import { clearAuthCookies } from "@/shared/lib/server/auth-actions";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/**
 * The single way a session ends on the client.
 *
 * There used to be four of these — the axios 401 interceptor, the session
 * manager's idle logout, the timeout modal, and `useLogout` — each with its own
 * hand-written clear-then-logout sequence. Three of them cleared cookies; the
 * interceptor did not, which left the httpOnly cookies (and the refresh token
 * inside them) alive on a session the UI had already shown the door to. That
 * surviving `fox_user` cookie then rehydrated the store as signed-in on the
 * page the interceptor had just redirected to.
 *
 * `clearAuthCookies` is always awaited. Every caller navigates immediately
 * after — most of them with `window.location.href`, which unloads the page and
 * can abort an in-flight fire-and-forget request before the server action's own
 * POST to /auth/logout completes.
 *
 * Navigation is deliberately left to the caller: where each path sends the user
 * differs (`/?auth=expired` for a session that died, `/` for a deliberate sign
 * out), as does whether it wants a hard load or a client-side push.
 */
export async function endSession(): Promise<void> {
  // Never block the sign-out on the network: the cookies are deleted either
  // way, and a token whose revocation call did not land expires on its own.
  await clearAuthCookies().catch(() => {});
  useAuthStore.getState().logout();
}
