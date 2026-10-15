import { describe, it, expect } from "vitest";
import {
  isPreSessionAuthPath,
  PRE_SESSION_AUTH_PATHS,
} from "@/shared/auth/public-endpoints";

/**
 * Routing sign-in through the proxy put it behind machinery built for
 * authenticated traffic. Both consumers of this list fail quietly if it is
 * wrong: the proxy would spend a refresh token and replay a failed sign-in,
 * and the interceptor would redirect out of the login modal on a wrong
 * password. Neither throws, so nothing but a test notices.
 */

describe("isPreSessionAuthPath", () => {
  it("matches every listed endpoint, with or without a leading slash", () => {
    for (const path of PRE_SESSION_AUTH_PATHS) {
      expect(isPreSessionAuthPath(path)).toBe(true);
      // The proxy joins path segments without one.
      expect(isPreSessionAuthPath(path.replace(/^\//, ""))).toBe(true);
    }
  });

  it("matches a path carrying a query string", () => {
    expect(isPreSessionAuthPath("/auth/login?redirect=%2Fadmin")).toBe(true);
  });

  it("does not match the authenticated auth routes", () => {
    // A 401 from either of these really does mean the session is gone, so they
    // must keep their refresh-and-replay and their session-expired redirect.
    expect(isPreSessionAuthPath("/auth/logout")).toBe(false);
    expect(isPreSessionAuthPath("/auth/socket-ticket")).toBe(false);
  });

  it("does not match ordinary data routes", () => {
    expect(isPreSessionAuthPath("/profile")).toBe(false);
    expect(isPreSessionAuthPath("/bookings")).toBe(false);
    expect(isPreSessionAuthPath("/venues/123")).toBe(false);
  });

  it("does not match on a substring that merely contains a listed path", () => {
    // Guards against a looser `includes` check: these are different endpoints
    // and must keep normal session handling.
    expect(isPreSessionAuthPath("/admin/auth/login-audit")).toBe(false);
    expect(isPreSessionAuthPath("/auth/login-history")).toBe(false);
  });
});
