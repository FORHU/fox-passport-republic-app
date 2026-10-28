/**
 * The cookies that carry a Better Auth session. The `__Secure-` name is the
 * one used on https; the plain one on http (local development).
 *
 * One list for every place that asks "is there a session?" — the route guard
 * (`proxy.ts`), the API proxy, server-side fetches and the home redirect. When
 * those kept separate lists they drifted, and the guard bounced every signed-in
 * user (20 Oct).
 */
export const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;
