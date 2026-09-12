/**
 * Auth endpoints that run before a session exists.
 *
 * A 401 from any of these means "those credentials are wrong", never "your
 * session ended" - there is no session yet. Two places have to know the
 * difference, and both get it wrong in a way that is invisible until it bites:
 *
 *  - **the proxy** refreshes and replays on any 401. On a wrong password that
 *    would spend a single-use refresh token and submit the same failed login a
 *    second time, which the API's per-account rate limit counts as two attempts
 *    for one click.
 *  - **the axios interceptor** treats a 401 as a dead session and hard-redirects
 *    to `/?auth=expired`. On a wrong password that throws the user out of the
 *    login modal instead of showing them the error.
 *
 * `/auth/logout` and `/auth/socket-ticket` are deliberately absent: both are
 * authenticated, so a 401 from either really does mean the session is gone.
 */
export const PRE_SESSION_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification-otp",
  "/auth/refresh-token",
  "/auth/google/exchange",
] as const;

/**
 * Accepts either form a caller has to hand: the proxy joins path segments
 * without a leading slash, axios carries the request path with one.
 */
export function isPreSessionAuthPath(path: string): boolean {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return PRE_SESSION_AUTH_PATHS.some(
    (p) => normalised === p || normalised.startsWith(`${p}?`),
  );
}
