import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const authState: { user: { id: string } | null } = { user: null };
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

const signInThen = vi.fn();
vi.mock("@/shared/auth/returnTo", () => ({
  signInThen: (path: string) => signInThen(path),
}));

const api = vi.hoisted(() => ({
  getUserFavorites: vi.fn(async () => []),
  addFavorite: vi.fn(async () => ({})),
  removeFavoriteByListing: vi.fn(async () => {}),
}));
vi.mock("@/shared/api/favorites", () => api);

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useFavorites } from "@/shared/hooks/useFavorites";

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * app#313: a signed-out ♥ asks for sign-in and the save completes afterwards.
 * Favourites carry their type, so a Foxer, an event and a venue with the same
 * id are three different favourites.
 */
describe("useFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    authState.user = null;
    window.history.replaceState(null, "", "/search?tab=foxers");
  });

  it("signed out: opens sign-in back to this page, then finishes the save", async () => {
    const { result, rerender } = renderHook(() => useFavorites(), { wrapper });

    act(() => result.current.toggleFavorite("fox-1", { type: "foxer" }));
    expect(signInThen).toHaveBeenCalledWith("/search?tab=foxers");
    expect(api.addFavorite).not.toHaveBeenCalled();

    authState.user = { id: "u-1" };
    rerender();

    await waitFor(() =>
      expect(api.addFavorite).toHaveBeenCalledWith("fox-1", "foxer"),
    );
    expect(sessionStorage.getItem("fox_pending_favorite")).toBeNull();
  });

  it("finishes a pending save once, however many cards use the hook", async () => {
    sessionStorage.setItem(
      "fox_pending_favorite",
      JSON.stringify({ targetId: "fox-1", type: "foxer" }),
    );
    authState.user = { id: "u-1" };

    renderHook(
      () => [useFavorites(), useFavorites(), useFavorites()],
      { wrapper },
    );

    await waitFor(() => expect(api.addFavorite).toHaveBeenCalled());
    expect(api.addFavorite).toHaveBeenCalledTimes(1);
  });

  it("toggles by type: saving a Foxer adds a foxer favourite", async () => {
    authState.user = { id: "u-1" };
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggleFavorite("fox-1", { type: "foxer" }));

    await waitFor(() =>
      expect(api.addFavorite).toHaveBeenCalledWith("fox-1", "foxer"),
    );
  });

  it("removes an event with the event type, not as a venue", async () => {
    authState.user = { id: "u-1" };
    api.getUserFavorites.mockResolvedValue([
      { id: "f-1", targetId: "e-1", type: "event", createdAt: "" },
    ] as never);
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() =>
      expect(result.current.isFavorited("e-1", "event")).toBe(true),
    );
    expect(result.current.isFavorited("e-1")).toBe(false);

    act(() => result.current.toggleFavorite("e-1", { type: "event" }));

    await waitFor(() =>
      expect(api.removeFavoriteByListing).toHaveBeenCalledWith("e-1", "event"),
    );
  });
});
