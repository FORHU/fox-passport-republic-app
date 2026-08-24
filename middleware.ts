import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

/**
 * Proxy for authentication and authorization checks
 * Runs before pages/API routes are accessed
 *
 * Handles:
 * - Auth token validation
 * - Protected route access
 * - Admin route restriction
 *
 * Only `/admin` is gated on role here. Every other role check is deferred to
 * server components so they read live API data — a cookie issued before a role
 * was approved would otherwise lock the user out until it expired.
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
];

// Name of the cookie set by `setAuthCookies` in shared/lib/server/auth-actions.
// These must stay in sync — reading a different name here silently logs
// everyone out of every protected route.
const TOKEN_COOKIE = "fox_token";

// No development fallback: a hardcoded default would let anyone forge an
// admin token signed with a value that is public in this repo. If the secret
// is missing we fail closed instead.
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

interface SessionUser {
  userId: string;
  email?: string;
  systemRole: string;
}

function toSessionUser(payload: JWTPayload): SessionUser | null {
  const userId = payload.userId ?? payload.sub;
  if (typeof userId !== "string") return null;

  const systemRole =
    typeof payload.systemRole === "string" ? payload.systemRole : "user";

  return {
    userId,
    email: typeof payload.email === "string" ? payload.email : undefined,
    systemRole,
  };
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) return NextResponse.next();

  if (!ACCESS_TOKEN_SECRET) {
    console.error(
      "[Proxy] ACCESS_TOKEN_SECRET is not set — refusing access to protected routes. " +
        "Set it to the same value the API signs tokens with.",
    );
    return redirectToLogin(request);
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return redirectToLogin(request);

  let user: SessionUser | null = null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(ACCESS_TOKEN_SECRET),
      { algorithms: ["HS256"] },
    );
    user = toSessionUser(payload);
  } catch {
    // Expired or tampered token — treated the same as no token.
    user = null;
  }

  if (!user) return redirectToLogin(request);

  if (pathname.startsWith("/admin") && user.systemRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  // Signals the client to open the login modal.
  response.headers.set("x-auth-required", "true");
  return response;
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
