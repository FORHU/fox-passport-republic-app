import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIES } from "@/shared/auth/session-cookies";
import { indexingDisabled, isNonProductionHost } from "@/shared/lib/seo";

/**
 * Navigation guard. Runs before pages are rendered.
 *
 * Lives in `src/`, next to `app/`: Next only registers a proxy that sits at
 * the same level as the `app` directory. From 12 Sep to 20 Oct it was at the
 * project root and never ran (every protected route answered 200 to a
 * signed-out request); the build output's "ƒ Proxy (Middleware)" line is the
 * check that it is registered.
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
 * `app/admin/(console)/layout.tsx` - on fresher information than this file ever had.
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
  "/foxer",
  "/reviews",
  "/kyc",
  "/notifications",
  "/scanner",
  "/wishlists",
  "/match",
  "/venue-foxer",
  "/messages",
];

// Non-production answers `noindex`: a build with the flag set, or a known
// non-production host (see `shared/lib/seo.ts`).
export default async function proxy(request: NextRequest) {
  const response = await guard(request);
  if (indexingDisabled || isNonProductionHost(request.headers)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

// `/user/<id>` is a citizen's public profile, inside the otherwise signed-in
// `/user` tree. Only that one segment: `/user` itself, its fixed pages and
// `/user/<id>/connections` stay signed-in.
const USER_PAGES = new Set(["passport", "settings"]);
function isPublicCitizenProfile(pathname: string): boolean {
  const match = /^\/user\/([^/]+)\/?$/.exec(pathname);
  return !!match && !USER_PAGES.has(match[1]);
}

// `/foxer/<id>` is a Foxer's public profile, which robots.txt invites crawlers
// to index. Only that one segment: `/foxer` itself and its fixed pages (the
// application forms, studios and dashboards) stay signed-in, each guarded by
// its own page or layout.
const FOXER_PAGES = new Set([
  "affiliations",
  "apply",
  "apply-investor",
  "create-event",
  "create-investment",
  "create-listing",
  "create-service",
  "marketplace-requests",
  "resubmit",
]);
function isPublicFoxerProfile(pathname: string): boolean {
  const match = /^\/foxer\/([^/]+)\/?$/.exec(pathname);
  return !!match && !FOXER_PAGES.has(match[1]);
}

async function guard(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (
    !isProtectedRoute ||
    isPublicCitizenProfile(pathname) ||
    isPublicFoxerProfile(pathname)
  ) {
    return NextResponse.next();
  }

  // Presence only. The contents are not read, decoded, or trusted - an expired
  // or forged cookie gets past this line by design, and is refused by the API
  // and by the page's own `requireAuth`/`requireAdmin` a moment later.
  const hasSession = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );
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
     * - favicon.ico (favicon file)
     * `_next/image` is matched on purpose: optimized images need the
     * noindex header too. `guard()` passes them straight through.
     */
    "/((?!api|_next/static|favicon.ico).*)",
  ],
};
