import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  renderHook,
  screen,
  fireEvent,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _priority, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/creator-dashboard",
}));
vi.mock("@/shared/auth/session-api", () => ({
  refreshSession: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/shared/hooks/useUnreadMessagesCount", () => ({
  useUnreadMessagesCount: () => ({ unreadCount: 0 }),
}));
vi.mock("@/shared/components/layout/NotificationBell", () => ({
  default: () => null,
}));
vi.mock("@/shared/components/layout/CurrencySwitcher", () => ({
  CurrencySwitcher: () => null,
}));
vi.mock("@/shared/components/layout/ThemeSwitcher", () => ({
  ThemeSwitcher: () => null,
}));

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useCreatorNavLinks } from "@/features/dashboard/hooks/useCreatorNavLinks";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";
import { isPartnerUser } from "@/shared/auth/roles";
import { ROLES } from "@/shared/data/roleCatalog";

const signIn = (user: Record<string, unknown>) =>
  useAuthStore.getState().login({
    user: { id: "u1", email: "u@example.com", name: "U", ...user } as never,
  });

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const labels = () =>
  renderHook(() => useCreatorNavLinks()).result.current.allNavLinks.map(
    (l) => l.label,
  );

/**
 * Each control is shown only to the people whose role or permission can use
 * it — the visibility audit's group B.
 */
describe("creator dashboard sections", () => {
  beforeEach(() => useAuthStore.getState().logout?.());

  it("give a Mayor Check In and Requests, but not the Event Foxer's Affiliations", () => {
    signIn({
      roleType: ["venueFoxer"],
      permissions: ["venue:manage", "payouts:onboard"],
    });
    const shown = labels();
    expect(shown).toContain("Check In");
    expect(shown).toContain("Requests");
    expect(shown).not.toContain("Affiliations");
  });

  it("give an Event Foxer Affiliations", () => {
    signIn({
      roleType: ["eventFoxer"],
      permissions: ["template:manage", "booking:check-in"],
    });
    expect(labels()).toContain("Affiliations");
  });

  it("don't give an admin Check In, which they can't do", () => {
    signIn({
      systemRole: "admin",
      roleType: [],
      permissions: ["admin:access", "booking:check-in", "bookings:read:all"],
    });
    const shown = labels();
    expect(shown).toContain("Overview");
    expect(shown).not.toContain("Check In");
  });

  it("don't offer a plain Check-in Helper the overview that would bounce them", () => {
    signIn({ roleType: [], permissions: [] });
    expect(labels()).not.toContain("Overview");
  });
});

describe("the dashboard's mobile bar", () => {
  it("keeps every section reachable through More", () => {
    signIn({
      roleType: ["venueFoxer", "eventFoxer", "gearFoxer"],
      permissions: [
        "venue:manage",
        "template:manage",
        "asset:manage",
        "promotions:manage-own",
        "payouts:onboard",
      ],
    });
    const { container } = render(<DashboardHeader />, { wrapper });
    const mobile = container.querySelector("nav.md\\:hidden") as HTMLElement;
    const tabs = within(mobile).getAllByRole("link");
    expect(tabs.length).toBe(4);
    fireEvent.click(within(mobile).getByRole("button", { name: /More/ }));
    const sheet = screen.getByRole("dialog", { name: "More" });
    // The links that didn't fit, e.g. Earnings at the end of the list.
    expect(within(sheet).getByText("Earnings")).toBeInTheDocument();
  });
});

describe("the user menu", () => {
  const open = () => {
    render(<UserMenuButton showAppNav />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "User menu" }));
  };

  it("offers the shared pages when asked to", () => {
    signIn({ roleType: [], permissions: [] });
    open();
    const goTo = screen.getByRole("group", { name: "Go to" });
    expect(within(goTo).getByText("Republic")).toBeInTheDocument();
    expect(within(goTo).getByText("Passport")).toBeInTheDocument();
    // Foxers is already first in My Dashboards.
    expect(within(goTo).queryByText("Foxers")).toBeNull();
  });

  it("offers Apply for a Role while there's a role left to apply for", () => {
    signIn({ roleType: ["venueFoxer"], permissions: ["venue:manage"] });
    open();
    expect(screen.getByText("Apply for a Role")).toBeInTheDocument();
  });

  it("doesn't offer Apply for a Role once every role is held", () => {
    signIn({ roleType: ROLES.map((r) => r.roleType), permissions: [] });
    open();
    expect(screen.queryByText("Apply for a Role")).toBeNull();
  });

  it("reaches Notifications, which the header bell hides on a phone", () => {
    signIn({ roleType: [], permissions: [] });
    open();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });
});

describe("the Partner Foxer badge", () => {
  it("is for investors", () => {
    expect(isPartnerUser({ roleType: ["investor"] })).toBe(true);
  });

  it("isn't for an admin without the investor role", () => {
    expect(isPartnerUser({ roleType: [], systemRole: "admin" })).toBe(false);
  });
});
