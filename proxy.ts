import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for authentication and authorization checks
 * Runs before pages/API routes are accessed
 *
 * Handles:
 * - Auth token validation
 * - Role-based redirects
 * - Protected route access
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/user",
  "/host",
  "/admin",
  "/mayor/create-venue",
  "/foxer/create-event",
  "/foxer/create-listing",
  "/reviews/write",
];

// Role-based route restrictions
const ROLE_ROUTES: Record<string, string[]> = {
  host: ["/host", "/mayor/create-venue"],
  admin: ["/admin"],
  mayor: ["/mayor/create-venue"],
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get auth tokens from cookies (set by auth interceptor)
  const token = request.cookies.get("fox_token")?.value;
  const userStr = request.cookies.get("fox_user")?.value;

  // Parse user from cookie
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // Invalid user data, treat as unauthenticated
      console.warn("Failed to parse user cookie:", e);
    }
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // No token = redirect to home + show login
    if (!token || !user) {
      const response = NextResponse.redirect(new URL("/", request.url));
      // Add header to signal client to open login modal
      response.headers.set("x-auth-required", "true");
      return response;
    }

    // Check role-based access
    const userRole = user.role?.toLowerCase();
    const isHostUser =
      user.isHost ||
      ["host", "mayor", "admin", "super_admin"].includes(userRole);

    // Route requires host role but user isn't one
    if (
      (pathname.startsWith("/host") ||
        pathname.startsWith("/mayor/create-venue")) &&
      !isHostUser
    ) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("x-auth-required", "true");
      response.headers.set("x-role-required", "host");
      return response;
    }

    // Route requires admin role
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
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
