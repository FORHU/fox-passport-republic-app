import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: any) => <img src="mock.png" alt={props.alt ?? ""} {...props} />,
}));

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

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector?: (s: any) => any) => {
    const state = { user: { name: "Test Creator", email: "t@x.com" }, setUser: vi.fn() };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/features/notifications/components/NotificationBell", () => ({
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
