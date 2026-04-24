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
  "/onboarding",
  "/progress",
  "/booking",
  "/checkout",
  "/mayor",
  "/foxer",
  "/reviews",
];

// Role-based route restrictions
const ROLE_ROUTES: Record<string, string[]> = {
  host: ["/host", "/mayor/create-venue"],
  admin: ["/admin"],
  mayor: ["/mayor/create-venue"],
};

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get auth tokens from cookies (set by auth interceptor)
  const token = request.cookies.get("fox_token")?.value;
  const userStr = request.cookies.get("fox_user")?.value;

  // Parse user from cookie
  let user = null;
  if (userStr) {
    try {
      // Decode URI component in case it's encoded
      const decodedUser = decodeURIComponent(userStr);
      user = JSON.parse(decodedUser);
    } catch (e) {
      try {
        // Fallback to raw parse if decoding fails
        user = JSON.parse(userStr);
      } catch (e2) {
        console.warn("[Proxy] Failed to parse user cookie:", e2);
      }
    }
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    console.log(`[Proxy] Checking protected route: ${pathname}`);
    
    // No token = redirect to home + show login
    if (!token || !user) {
      console.log(`[Proxy] Redirecting to home: Missing token (${!!token}) or user (${!!user})`);
      const response = NextResponse.redirect(new URL("/", request.url));
      // Add header to signal client to open login modal
      response.headers.set("x-auth-required", "true");
      return response;
    }

    console.log(`[Proxy] Authenticated user: ${user.email}, Role: ${user.systemRole}`);

    // Only enforce admin routes at the proxy level.
    // Host/mayor/foxer role checks are deferred to server components
    // so they always use live API data (handles stale cookies after role approval).
    const sysRole = (user.systemRole || user.role || "").toLowerCase();
    const isAdmin = sysRole === "admin" || sysRole === "super_admin";

    if (pathname.startsWith("/admin") && !isAdmin) {
      console.log(`[Proxy] Redirecting: Admin role required for ${pathname}`);
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
