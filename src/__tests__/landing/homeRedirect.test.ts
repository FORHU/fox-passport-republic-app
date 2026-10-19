import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * "/" is the public landing page; signed-in visitors are sent to the app (/search).
 *
 * Every auth flow (proxy, requireAuth, session expiry, logout, OAuth errors)
 * lands on "/" and relies on it rendering, so these pin the cases where it
 * must NOT redirect, as well as the cost rule: no /profile call without a
 * session cookie.
 */

const mocks = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  getUser: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      mocks.cookies.has(name) ? { value: mocks.cookies.get(name) } : undefined,
  }),
}));
vi.mock("@/shared/lib/server/auth", () => ({ getUser: mocks.getUser }));

import { getSignedInRedirect } from "@/shared/lib/server/home-redirect";

beforeEach(() => {
  mocks.cookies.clear();
  mocks.getUser.mockReset();
});

describe("getSignedInRedirect", () => {
  it("renders the landing for visitors without a session cookie, without calling /profile", async () => {
    expect(await getSignedInRedirect({})).toBeNull();
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it.each(["better-auth.session_token", "__Secure-better-auth.session_token", "fox_token"])(
    "sends a confirmed user with %s to the app",
    async (cookie) => {
      mocks.cookies.set(cookie, "token");
      mocks.getUser.mockResolvedValue({ id: "user-1" });
      expect(await getSignedInRedirect({})).toBe("/search");
    },
  );

  it("renders the landing when the cookie is stale (no live user)", async () => {
    mocks.cookies.set("fox_token", "expired");
    mocks.getUser.mockResolvedValue(null);
    expect(await getSignedInRedirect({})).toBeNull();
  });

  it.each([
    ["auth", "required"],
    ["auth", "expired"],
    ["googleAuthError", "1"],
    ["facebookAuthError", "1"],
    ["location", "Manila"],
    ["category", "wedding"],
  ])("leaves / alone when ?%s= is present", async (key, value) => {
    mocks.cookies.set("fox_token", "token");
    mocks.getUser.mockResolvedValue({ id: "user-1" });
    expect(await getSignedInRedirect({ [key]: value })).toBeNull();
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
});
