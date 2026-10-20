import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _priority, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const openLogin = vi.fn();
const mockAuthState = {
  isAuthenticated: false,
  isLoading: false,
  openLogin,
};

type MockAuthState = typeof mockAuthState;

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: <T,>(selector?: (s: MockAuthState) => T) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

vi.mock("@/shared/components/layout/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell" />,
}));
vi.mock("@/shared/components/layout/UserMenuButton", () => ({
  default: () => <div data-testid="user-menu" />,
}));
vi.mock("@/shared/components/layout/MobileBottomNav", () => ({
  default: () => null,
}));

import LandingHeader from "@/features/landing/components/sections/LandingHeader";

/**
 * Signed-out visitors on small screens used to get no navigation at all: the
 * header tabs are desktop-only and the bottom nav is signed-in only. The menu
 * button opens the same landing links.
 */
describe("LandingHeader mobile menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
  });

  it("opens the landing links and sign-in for signed-out visitors", async () => {
    const user = userEvent.setup();
    render(<LandingHeader />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Menu" });
    const hrefs = within(menu)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/#events", "/#how-it-works", "/#earn"]);

    await user.click(within(menu).getByRole("button", { name: "Sign In" }));
    expect(openLogin).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when a link is chosen", async () => {
    const user = userEvent.setup();
    render(<LandingHeader />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("link", {
        name: "How it works",
      }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has no menu button for signed-in users", () => {
    mockAuthState.isAuthenticated = true;
    render(<LandingHeader />);
    expect(
      screen.queryByRole("button", { name: "Open menu" }),
    ).not.toBeInTheDocument();
  });

  it("has no menu button until auth has loaded", () => {
    mockAuthState.isLoading = true;
    render(<LandingHeader />);
    expect(
      screen.queryByRole("button", { name: "Open menu" }),
    ).not.toBeInTheDocument();
  });
});
