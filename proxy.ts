import { NextRequest, NextResponse } from "next/server";

/**
 * Navigation guard. Runs before pages are rendered.
 *
 * Renamed from `middleware.ts` 12 Sep: Next.js 16.3.4 deprecated the
 * `middleware` file convention in favor of `proxy` and, in this version,
 * doesn't just warn about it - a file still named `middleware.ts` never gets
 * registered at all (`.next/dev/server/middleware-manifest.json` stayed
 * `{ "middleware": {} }` regardless of location, project root or `src/`).
 * Found by testing every PROTECTED_ROUTES tree with plain `curl` and no
 * cookies: all of them returned 200 with real page markup instead of a
 * redirect. Not a data leak - each protected layout's own `requireAuth()`
 * still fires and the redirect is present in the streamed RSC payload
 * (`NEXT_REDIRECT;replace;/;307`) for any JS-executing client - but it meant
 * this file's fast, pre-render redirect had been silently dead code, and a
 * non-JS client (a bot, a crawler, a disabled-JS browser) saw an empty page
 * shell for every protected route instead of ever being redirected.
 *
 * This checks one thing: whether a session cookie is present. It is a redirect
 * for people who are not signed in, not an authorization boundary, and nothing
 * here should be read as proof of anything.
 *
 * It used to verify the JWT itself with `jwtVerify`, which meant this app held
 * a copy of the API's `ACCESS_TOKEN_SECRET`. HS256 is symmetric: the key that
 * checks a token also signs one, so verifying here gave the frontend the
 * ability to mint admin tokens for its own API. That capability is gone, and
 * the secret with it.
 *
 * What actually enforces access, unchanged:
 *   - the API verifies the token, checks expiry, loads the user and applies
 *     `requirePermission` per route, answering 401/403;
 *   - `requireAuth` / `requireAdmin` / `requireHost` in
 *     `shared/lib/server/auth.ts` redirect from the page itself, off a live
 *     `/profile` call rather than a cookie claim.
 *
 * So a present-but-expired cookie reaches the page and is turned away there,
 * and a non-admin reaching `/admin` is redirected by `requireAdmin()` in
 * `app/admin/page.tsx` - on fresher information than this file ever had.
 *
 * If cryptographic verification is ever wanted here, the way to get it is
 * RS256/ES256 signing in the API, so this app can hold a public key that
 * verifies without being able to sign. Not a change to make in passing.
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/user",
  "/creator-dashboard",
  "/admin",
  "/onboarding",
  "/progress",
  "/booking",
  "/checkout",
  "/mayor",
  "/foxer",
  "/reviews",
  "/kyc",
  "/notifications",
  "/scanner",
  "/wishlists",
  "/host",
  "/match",
  "/venue-foxer",
];

// Name of the cookie set by `setAuthCookies` in shared/lib/server/auth-actions.
// These must stay in sync — reading a different name here silently logs
// everyone out of every protected route.
const TOKEN_COOKIE = "fox_token";

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) return NextResponse.next();

  // Presence only. The contents are not read, decoded, or trusted - an expired
  // or forged cookie gets past this line by design, and is refused by the API
  // and by the page's own `requireAuth`/`requireAdmin` a moment later.
  const hasSession = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  if (!hasSession) return redirectToLogin(request);

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  // `?auth=required` rather than a response header: this redirect is a normal
  // browser navigation, and client JS on the destination page has no way to
  // read the headers of the response that produced it. A header here used to
  // be set and never read for exactly that reason. `SessionExpiredToast`
  // (mounted in the root layout) watches this query param the same way it
  // already watches `?auth=expired`, and strips it once shown.
  return NextResponse.redirect(new URL("/?auth=required", request.url));
}

// Configure which routes this proxy applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
