import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _priority, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));

// DashboardHeader calls usePathname() to mark the active link — omitting it
// here makes the component throw during render.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/creator-dashboard",
}));

const mockAccess = {
  isMayor: true,
  isHost: true,
  isFoxer: true,
  canManageEvents: true,
  canManageVenues: true,
  canManageInventory: true,
  canManageServices: true,
  canManagePerformers: true,
};

vi.mock("@/shared/auth/useRoleAccess", () => ({
  useRoleAccess: () => mockAccess,
  RoleAccess: {},
}));

const mockAuthState = {
  user: { name: "Test Creator", email: "t@x.com" },
  setUser: vi.fn(),
};

type MockAuthState = typeof mockAuthState;

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: Object.assign(
    <T,>(selector?: (s: MockAuthState) => T) =>
      selector ? selector(mockAuthState) : mockAuthState,
    // UserMenuButton reads the session epoch around its profile sync.
    { getState: () => mockAuthState },
  ),
  onAccountChange: () => () => {},
}));

vi.mock("@/shared/components/layout/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell" />,
}));

// UserMenuButton (rendered inside DashboardHeader's user menu) reads this to
// badge the hamburger icon with unread messages — a real query, so it needs
// mocking here the same way NotificationBell's own query dependency is
// avoided above.
vi.mock("@/shared/hooks/useUnreadMessagesCount", () => ({
  useUnreadMessagesCount: () => ({ unreadCount: 0, isLoading: false }),
}));

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

describe("DashboardHeader — responsive nav", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders desktop nav and mobile floating bottom tab bar", () => {
    const { container } = render(<DashboardHeader />);

    const desktopNav = container.querySelector("nav.hidden.md\\:flex");
    expect(desktopNav).not.toBeNull();

    const mobileNav = container.querySelector("nav.md\\:hidden");
    expect(mobileNav).not.toBeNull();
  });

  it("renders creator studio title and notification bell", () => {
    render(<DashboardHeader />);

    expect(screen.getByText("FoxPassport")).toBeInTheDocument();
    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
  });

  // Every tab at once pushed the bell and the user menu off the bar between
  // `md` and `xl` (e.g. at 887px).
  it("shows four tabs below xl and lists the rest in More", () => {
    const { container } = render(<DashboardHeader />);
    const desktopNav = container.querySelector(
      "nav.hidden.md\\:flex",
    ) as HTMLElement;

    const tabs = within(desktopNav).getAllByRole("link");
    const shown = tabs.filter((t) => !t.classList.contains("hidden"));
    const folded = tabs.filter((t) => t.classList.contains("hidden"));
    expect(shown).toHaveLength(4);
    expect(folded.length).toBeGreaterThan(0);
    folded.forEach((t) => expect(t).toHaveClass("xl:inline"));

    fireEvent.click(within(desktopNav).getByRole("button", { name: /More/ }));
    for (const tab of folded) {
      const inMore = within(desktopNav)
        .getAllByRole("link", { name: new RegExp(tab.textContent!) })
        .find((l) => l !== tab);
      expect(inMore).toBeDefined();
      expect(inMore).toHaveClass("xl:hidden");
    }
  });

  it("keeps the user menu button and hides the name while tabs share the bar", () => {
    render(<DashboardHeader />);

    expect(screen.getByRole("button", { name: "User menu" })).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-user-name")).toHaveClass(
      "md:hidden",
      "xl:block",
    );
  });
});
