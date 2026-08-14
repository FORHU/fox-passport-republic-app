/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ComponentProps<"img">) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));

// DashboardHeader calls usePathname() to mark the active link — omitting it
// here makes the component throw during render.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/creator-dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

const mockAccess = {
  isMayor: true,
  isHost: true,
  isFoxer: true,
  canManageEvents: true,
  canManageVenues: true,
  canManageInventory: true,
  canManageServices: true,
};

vi.mock("@/features/auth/hooks/useRoleAccess", () => ({
  useRoleAccess: () => mockAccess,
  RoleAccess: {},
}));

const mockAuthState = {
  user: { name: "Test Creator", email: "t@x.com" },
  setUser: vi.fn(),
};

type MockAuthState = typeof mockAuthState;

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: <T,>(selector?: (s: MockAuthState) => T) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

vi.mock("@/features/notifications/components/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell" />,
}));

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

describe("DashboardHeader — responsive nav", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a mobile hamburger (md:hidden) and a desktop nav (hidden md:flex)", () => {
    const { container } = render(<DashboardHeader />);

    const hamburger = container.querySelector("button.md\\:hidden");
    expect(hamburger).not.toBeNull();

    const desktopNav = container.querySelector("nav.hidden.md\\:flex");
    expect(desktopNav).not.toBeNull();
  });

  it("opens the mobile drawer containing the nav links when hamburger is clicked", () => {
    const { container } = render(<DashboardHeader />);

    const hamburger = container.querySelector(
      "button.md\\:hidden",
    ) as HTMLButtonElement;
    fireEvent.click(hamburger);

    const dialog = screen.getByRole("dialog");
    const drawer = within(dialog);
    expect(drawer.getByText("Overview")).toBeInTheDocument();
    expect(drawer.getByText("Venues")).toBeInTheDocument();
    expect(drawer.getByText("Assets")).toBeInTheDocument();
  });
});
