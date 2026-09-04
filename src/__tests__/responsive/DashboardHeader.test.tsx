/* eslint-disable @next/next/no-img-element -- mocking next/image for jsdom */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: <T,>(selector?: (s: MockAuthState) => T) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

vi.mock("@/shared/components/layout/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell" />,
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
});
