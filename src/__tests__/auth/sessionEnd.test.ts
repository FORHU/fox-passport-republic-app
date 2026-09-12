import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Guards the two halves of the expired-session path.
 *
 * The regression these cover: the 401 interceptor cleared `fox_user` from
 * localStorage and hard-navigated without clearing the cookies, while
 * `initialize` had started reading the `fox_user` cookie first. The landing
 * page then rehydrated as signed-in on a dead session, whose next request
 * 401'd and redirected again.
 */

const clearAuthCookies = vi.fn(async () => true);

vi.mock("@/shared/lib/server/auth-actions", () => ({
  clearAuthCookies: () => clearAuthCookies(),
}));

const USER_A = { id: "a", name: "Fresh from localStorage" };
const USER_B = { id: "b", name: "Stale from cookie" };

function setCookieUser(user: unknown) {
  document.cookie = `fox_user=${encodeURIComponent(JSON.stringify(user))}; path=/`;
}

function clearCookieUser() {
  document.cookie = "fox_user=; path=/; max-age=0";
}

beforeEach(() => {
  vi.resetModules();
  clearAuthCookies.mockClear();
  localStorage.clear();
  clearCookieUser();
});

afterEach(() => {
  localStorage.clear();
  clearCookieUser();
});

describe("useAuthStore.initialize — which stored profile wins", () => {
  it("prefers localStorage over the cookie", async () => {
    localStorage.setItem("fox_user", JSON.stringify(USER_A));
    setCookieUser(USER_B);

    const { useAuthStore } = await import("@/shared/auth/useAuthStore");
    useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    // localStorage is rewritten on every profile fetch; the cookie only at
    // login and refreshUserSession, so it is the one that goes stale.
    expect(state.user?.id).toBe("a");
  });

  it("falls back to the cookie when site storage was cleared", async () => {
    setCookieUser(USER_B);

    const { useAuthStore } = await import("@/shared/auth/useAuthStore");
    useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe("b");
  });

  it("settles signed-out when neither source has a profile", async () => {
    const { useAuthStore } = await import("@/shared/auth/useAuthStore");
    useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});

describe("endSession", () => {
  it("clears the server cookies before touching the client store", async () => {
    const order: string[] = [];
    clearAuthCookies.mockImplementationOnce(async () => {
      order.push("cookies");
      return true;
    });

    const { useAuthStore } = await import("@/shared/auth/useAuthStore");
    const { endSession } = await import("@/shared/auth/endSession");

    useAuthStore.getState().login({ user: USER_A as never });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    const pending = endSession();
    // The store must still be intact while the server action is in flight —
    // callers navigate the moment this resolves.
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await pending;
    order.push("store");

    expect(order).toEqual(["cookies", "store"]);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("fox_user")).toBeNull();
  });

  it("still clears the store when revoking the token fails", async () => {
    clearAuthCookies.mockRejectedValueOnce(new Error("network down"));

    const { useAuthStore } = await import("@/shared/auth/useAuthStore");
    const { endSession } = await import("@/shared/auth/endSession");

    useAuthStore.getState().login({ user: USER_A as never });
    await expect(endSession()).resolves.toBeUndefined();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe("axios 401 handler", () => {
  let assigned: string[];

  beforeEach(() => {
    assigned = [];
    // jsdom throws on real navigation, so stand in for `location`. Only `href`
    // is written by the handler.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return "http://localhost/";
        },
        set href(value: string) {
          assigned.push(value);
        },
      },
    });
  });

  it("ends the session before redirecting", async () => {
    const { handleAuthError } = await import("@/shared/lib/axios");
    const { useAuthStore } = await import("@/shared/auth/useAuthStore");

    useAuthStore.getState().login({ user: USER_A as never });

    let clearedBeforeRedirect = false;
    clearAuthCookies.mockImplementationOnce(async () => {
      clearedBeforeRedirect = assigned.length === 0;
      return true;
    });

    const error = { config: { url: "/profile" }, response: { status: 401 } };
    await expect(handleAuthError(error)).rejects.toBe(error);

    expect(clearAuthCookies).toHaveBeenCalledTimes(1);
    expect(clearedBeforeRedirect).toBe(true);
    expect(assigned).toEqual(["/?auth=expired"]);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("collapses a parallel 401 stampede into one session end", async () => {
    const { handleAuthError } = await import("@/shared/lib/axios");

    const error = () => ({
      config: { url: "/profile" },
      response: { status: 401 },
    });
    await Promise.allSettled([
      handleAuthError(error()),
      handleAuthError(error()),
      handleAuthError(error()),
    ]);

    expect(clearAuthCookies).toHaveBeenCalledTimes(1);
    expect(assigned).toEqual(["/?auth=expired"]);
  });

  it("leaves the login and refresh calls alone", async () => {
    const { handleAuthError } = await import("@/shared/lib/axios");

    for (const url of ["/auth/login", "/auth/refresh-token"]) {
      const error = { config: { url }, response: { status: 401 } };
      await expect(handleAuthError(error)).rejects.toBe(error);
    }

    expect(clearAuthCookies).not.toHaveBeenCalled();
    expect(assigned).toEqual([]);
  });
});
