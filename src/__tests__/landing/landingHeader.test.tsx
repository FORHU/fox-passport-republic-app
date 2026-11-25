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
  user: { id: "u1" },
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
import { appNavForUser } from "@/shared/lib/app-nav";
import { THEME_STORAGE_KEY } from "@/shared/lib/theme";
import { useThemeStore } from "@/shared/store/useThemeStore";

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

  it("gives signed-in users the app nav, the same places as the mobile bar", () => {
    mockAuthState.isAuthenticated = true;
    render(<LandingHeader />);
    const nav = within(screen.getByRole("navigation"));
    const hrefs = nav.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(appNavForUser("u1").map((i) => i.href));
    // Passport opens the user's own public passport, not the /user dashboard.
    expect(nav.getByRole("link", { name: "Passport" })).toHaveAttribute(
      "href",
      "/user/u1",
    );
    expect(hrefs).not.toContain("/user");
  });

  it("has no menu button until auth has loaded", () => {
    mockAuthState.isLoading = true;
    render(<LandingHeader />);
    expect(
      screen.queryByRole("button", { name: "Open menu" }),
    ).not.toBeInTheDocument();
  });
});

/**
 * app#380: signed-out visitors had no way to pick light or dark (the picker
 * is in the signed-in user menu). The header has a light/dark switch.
 */
describe("LandingHeader theme switch", () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    useThemeStore.getState().setTheme("dark");
  });

  it("is on in dark, and switches the whole app to light and back", async () => {
    const user = userEvent.setup();
    render(<LandingHeader />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveClass("bg-accent");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("is not there until auth has loaded, or for signed-in users", () => {
    mockAuthState.isLoading = true;
    const { rerender } = render(<LandingHeader />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();

    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    rerender(<LandingHeader />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("is in the mobile menu too, and leaves the menu open", async () => {
    const user = userEvent.setup();
    render(<LandingHeader />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Menu" });
    const hrefs = within(menu)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/#events", "/#how-it-works", "/#earn"]);

    const toggle = within(menu).getByRole("switch", { name: "Dark mode" });
    await user.click(toggle);
    expect(useThemeStore.getState().theme).toBe("light");
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });
});

/**
 * app#367: light mode pins an exact `bg-white` to real white (for white
 * cards), so a white wipe behind the Sign In label left white text on white
 * on hover. The button inverts through the theme's white/black instead.
 */
describe("LandingHeader Sign In button", () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
  });

  it("has no fill that light mode pins to white behind the label", () => {
    render(<LandingHeader />);
    const signIn = screen.getByRole("button", { name: "Sign In" });
    expect(signIn).toHaveClass("hover:bg-white", "hover:text-black");
    expect(signIn).not.toHaveClass("bg-white");
    expect(signIn.querySelector('[class~="bg-white"]')).toBeNull();
  });
});
