import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Favorite } from "@/shared/api/favorites";

/**
 * Epic api#454: favourites persist across reloads (api#455), any number can be
 * saved (app#416), and a save shows up in full at once (app#415).
 */

const authState: { user: { id: string } | null } = { user: { id: "u-1" } };
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => authState,
}));
vi.mock("@/shared/auth/returnTo", () => ({ signInThen: vi.fn() }));

const api = vi.hoisted(() => ({
  getUserFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavoriteByListing: vi.fn(async () => {}),
}));
vi.mock("@/shared/api/favorites", () => api);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useFavorites } from "@/shared/hooks/useFavorites";

const fav = (targetId: string, over: Partial<Favorite> = {}): Favorite => ({
  id: `f-${targetId}`,
  targetId,
  type: "venue",
  createdAt: "2026-11-24T00:00:00.000Z",
  ...over,
});

function setup(
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useFavorites(), { wrapper }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  authState.user = { id: "u-1" };
});

describe("useFavorites sync", () => {
  it("sends an add as an add even once the cache already shows it saved", async () => {
    api.getUserFavorites.mockResolvedValue([]);
    // Hold the add open so the optimistic entry is in the cache meanwhile.
    let finish!: (v: unknown) => void;
    api.addFavorite.mockReturnValue(new Promise((r) => (finish = r)));
    const { result } = setup();
    await waitFor(() => expect(api.getUserFavorites).toHaveBeenCalled());

    act(() => result.current.toggleFavorite("v-1"));

    await waitFor(() => expect(result.current.isFavorited("v-1")).toBe(true));
    await waitFor(() =>
      expect(api.addFavorite).toHaveBeenCalledWith("v-1", "venue"),
    );
    expect(api.removeFavoriteByListing).not.toHaveBeenCalled();
    finish({ added: true, favorite: fav("v-1") });
  });

  it("keeps every saved item, well past three (app#416)", async () => {
    api.getUserFavorites.mockResolvedValue([]);
    api.addFavorite.mockImplementation(async (id: string) => ({
      added: true,
      favorite: fav(id),
    }));
    const { result } = setup();
    await waitFor(() => expect(api.getUserFavorites).toHaveBeenCalled());

    const ids = ["v-1", "v-2", "v-3", "v-4", "v-5"];
    api.getUserFavorites.mockResolvedValue(ids.map((id) => fav(id)));
    for (const id of ids) {
      act(() => result.current.toggleFavorite(id));
    }

    await waitFor(() =>
      expect(ids.every((id) => result.current.isFavorited(id))).toBe(true),
    );
    expect(api.addFavorite).toHaveBeenCalledTimes(5);
    expect(api.removeFavoriteByListing).not.toHaveBeenCalled();
  });

  it("replaces the placeholder with the saved card, without duplicates (app#415)", async () => {
    api.getUserFavorites.mockResolvedValue([]);
    const saved = fav("v-1", {
      venue: { id: "v-1", name: "Rooftop", images: [] },
    });
    api.addFavorite.mockResolvedValue({ added: true, favorite: saved });
    const { result, client } = setup();
    await waitFor(() => expect(api.getUserFavorites).toHaveBeenCalled());
    // The refetch after saving answers slowly; the card must not wait for it.
    api.getUserFavorites.mockReturnValue(new Promise(() => {}));

    act(() => result.current.toggleFavorite("v-1"));

    await waitFor(() => expect(result.current.favorites).toEqual([saved]));
    expect(client.getQueryData(["favorites", "u-1"])).toEqual([saved]);
  });

  it("shows the remembered hearts straight away after a reload (api#455)", async () => {
    localStorage.setItem("fox_favorites:u-1", JSON.stringify([fav("v-9")]));
    api.getUserFavorites.mockReturnValue(new Promise(() => {}));

    const { result } = setup();

    expect(result.current.isFavorited("v-9")).toBe(true);
    // …and still asks the API, which stays the source of truth.
    await waitFor(() =>
      expect(api.getUserFavorites).toHaveBeenCalledWith("u-1"),
    );
  });

  it("remembers the list from the API for the next reload", async () => {
    api.getUserFavorites.mockResolvedValue([fav("v-1"), fav("v-2")]);
    const { result } = setup();

    await waitFor(() => expect(result.current.isFavorited("v-2")).toBe(true));
    expect(JSON.parse(localStorage.getItem("fox_favorites:u-1")!)).toHaveLength(
      2,
    );
  });

  it("removes and remembers the removal", async () => {
    api.getUserFavorites.mockResolvedValue([fav("v-1")]);
    const { result } = setup();
    await waitFor(() => expect(result.current.isFavorited("v-1")).toBe(true));
    api.getUserFavorites.mockResolvedValue([]);

    act(() => result.current.toggleFavorite("v-1"));

    await waitFor(() =>
      expect(api.removeFavoriteByListing).toHaveBeenCalledWith("v-1", "venue"),
    );
    await waitFor(() => expect(result.current.isFavorited("v-1")).toBe(false));
    expect(JSON.parse(localStorage.getItem("fox_favorites:u-1")!)).toEqual([]);
  });
});
