import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { APP_NAV, appNavFor, isNavActive } from "@/shared/lib/app-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/user",
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "u1", name: "Citizen", email: "c@example.com" },
    isLoading: false,
  }),
}));

import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";

/**
 * The desktop headers and the mobile bottom nav used to list different places
 * (Explore here, Bookings there, "Profile" on mobile only). They now share one
 * list, so the app offers the same navigation at every width.
 */
describe("app nav", () => {
  it("matches routes segment by segment", () => {
    expect(isNavActive("/user", "/user")).toBe(true);
    expect(isNavActive("/user/passport", "/user")).toBe(true);
    expect(isNavActive("/users", "/user")).toBe(false);
    expect(isNavActive(null, "/user")).toBe(false);
  });

  it("shows signed-out visitors only the public places", () => {
    expect(appNavFor(false).map((i) => i.label)).toEqual([
      "Foxers",
      "Map",
      "Republic",
    ]);
    expect(appNavFor(true)).toEqual(APP_NAV);
  });

  it("gives the mobile bottom nav the same places, in order", () => {
    render(<MobileBottomNav />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      APP_NAV.map((i) => i.href),
    );
    expect(screen.getByRole("link", { name: "Passport" })).toHaveAttribute(
      "href",
      "/user",
    );
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });
});
