import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Foxer } from "@/shared/api/foxers";

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, sizes: _sizes, ...props }: any) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const authState: { user: { id: string } | null } = { user: null };
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

const favorites = vi.hoisted(() => ({
  saved: new Set<string>(),
  toggleFavorite: vi.fn(),
}));
vi.mock("@/shared/hooks/useFavorites", () => ({
  useFavorites: () => ({
    favorites: [],
    isLoading: false,
    isFavorited: (id: string, type?: string) =>
      type === "foxer" && favorites.saved.has(id),
    toggleFavorite: favorites.toggleFavorite,
    isToggling: false,
  }),
}));

import EventFoxerList from "@/features/search/components/EventFoxersSection";

const foxer = (overrides: Partial<Foxer> = {}): Foxer => ({
  id: "fox-1",
  name: "Ada Fox",
  roleType: ["eventFoxer"],
  createdAt: "2026-11-01T00:00:00Z",
  services: [],
  ...overrides,
});

/**
 * app#313: the ♥ on each Foxer card on /search only stopped the click, so it
 * saved nothing and never changed. It now toggles the Foxer favourite.
 */
describe("Foxer card ♥", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    favorites.saved.clear();
    authState.user = null;
  });

  it("saves the Foxer as a foxer favourite, without opening the profile", () => {
    render(<EventFoxerList items={[foxer()]} loading={false} />);

    const heart = screen.getByRole("button", { name: "Save Ada Fox" });
    expect(heart).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(heart);
    expect(favorites.toggleFavorite).toHaveBeenCalledWith("fox-1", {
      type: "foxer",
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a saved Foxer as pressed, with a filled heart and a Remove label", () => {
    favorites.saved.add("fox-1");
    render(<EventFoxerList items={[foxer()]} loading={false} />);

    const heart = screen.getByRole("button", { name: "Remove Ada Fox" });
    expect(heart).toHaveAttribute("aria-pressed", "true");
    expect(heart).toHaveTextContent("favorite");
    expect(heart).not.toHaveTextContent("favorite_border");
  });

  it("hides the ♥ on your own card", () => {
    authState.user = { id: "fox-1" };
    render(<EventFoxerList items={[foxer()]} loading={false} />);

    expect(
      screen.queryByRole("button", { name: /Ada Fox$/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Plan with Ada" }),
    ).toBeInTheDocument();
  });
});
