import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/shared/hooks/useFavorites", () => ({
  useFavorites: () => ({
    favorites: [],
    isLoading: false,
    toggleFavorite: vi.fn(),
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
});
