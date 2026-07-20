import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: any) => <img src="mock.png" alt={props.alt ?? ""} {...props} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
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

  it("renders a mobile hamburger (md:hidden) and a desktop nav (hidden md:flex)", () => {
    const { container } = render(<DashboardHeader />);

    const hamburger = container.querySelector("button.md\\:hidden");
    expect(hamburger).not.toBeNull();

    const desktopNav = container.querySelector("nav.hidden.md\\:flex");
    expect(desktopNav).not.toBeNull();
  });

  it("opens the mobile drawer containing the nav links when hamburger is clicked", () => {
    const { container } = render(<DashboardHeader />);

    const hamburger = container.querySelector("button.md\\:hidden") as HTMLButtonElement;
    fireEvent.click(hamburger);

    const dialog = screen.getByRole("dialog");
    const drawer = within(dialog);
    expect(drawer.getByText("Overview")).toBeInTheDocument();
    expect(drawer.getByText("Venues")).toBeInTheDocument();
    expect(drawer.getByText("Assets")).toBeInTheDocument();
  });
});
