import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Favorite } from "@/shared/api/favorites";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

const favs = vi.hoisted(() => ({
  list: [] as Favorite[],
  toggleFavorite: vi.fn(),
}));
vi.mock("@/shared/hooks/useFavorites", () => ({
  useFavorites: () => ({
    favorites: favs.list,
    isLoading: false,
    toggleFavorite: favs.toggleFavorite,
  }),
}));

vi.mock("@/shared/providers/CurrencyProvider", () => ({
  useCurrency: () => ({ format: (amount: number) => `$${amount}` }),
}));

vi.mock("@/shared/components/layout/LandingHeader", () => ({
  default: () => <header data-testid="landing-header" />,
}));

import WishlistsPage from "@/app/wishlists/page";

/**
 * /wishlists rendered its own minimal header (a back arrow and "Saved")
 * instead of the app's default one, and named itself "Saved" while the menu
 * says "Wishlists" (#310). The page renders both the mobile and the desktop
 * view (CSS hides one), so each check sees two of everything.
 */
describe("WishlistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    favs.list = [];
  });

  it("renders the shared default header once, over both views", () => {
    render(<WishlistsPage />);

    expect(screen.getByTestId("landing-header")).toBeInTheDocument();
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: /back/i }),
    ).not.toBeInTheDocument();
  });

  it("calls the page Wishlists everywhere, never Saved", () => {
    const { container } = render(<WishlistsPage />);

    expect(
      screen.getAllByRole("heading", { level: 1, name: "Wishlists" }),
    ).toHaveLength(2);
    expect(screen.getAllByText("Your wishlist is empty")).toHaveLength(2);
    expect(container.textContent).not.toMatch(/saved/i);
  });

  // app#313: saved Foxers show in the wishlist and can be removed there.
  it("lists a saved Foxer, linking to their profile with role and city", () => {
    favs.list = [
      {
        id: "f-1",
        targetId: "fox-1",
        type: "foxer",
        createdAt: "2026-11-17T00:00:00Z",
        foxer: {
          id: "fox-1",
          name: "Ada Fox",
          imgId: "avatars/ada.jpg",
          city: "Makati",
          roleType: ["eventFoxer"],
        },
      },
    ];
    render(<WishlistsPage />);

    expect(screen.getAllByText("Ada Fox")).toHaveLength(2);
    expect(screen.getAllByText("Event Foxer · Makati")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /Ada Fox/ }),
    ).toHaveAttribute("href", "/foxer/fox-1");
  });

  it("removes a favourite with its own type", () => {
    favs.list = [
      {
        id: "f-1",
        targetId: "e-1",
        type: "event",
        createdAt: "2026-11-17T00:00:00Z",
        event: { id: "e-1", name: "Beach Party", price: 100 },
      },
    ];
    render(<WishlistsPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Beach Party from wishlist" }),
    );
    expect(favs.toggleFavorite).toHaveBeenCalledWith("e-1", { type: "event" });
  });
});
