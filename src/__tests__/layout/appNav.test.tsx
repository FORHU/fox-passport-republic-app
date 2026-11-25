import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  APP_NAV,
  appNavFor,
  appNavForUser,
  isNavActive,
} from "@/shared/lib/app-nav";

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

  it("points Passport at the user's own public passport, not /user", () => {
    const nav = appNavForUser("u1");
    expect(nav.map((i) => i.label)).toEqual([
      "Foxers",
      "Map",
      "Republic",
      "Bookings",
      "Passport",
    ]);
    expect(nav.at(-1)).toMatchObject({
      href: "/user/u1",
      requiresAuth: true,
    });
    expect(nav.slice(0, -1)).toEqual(APP_NAV.slice(0, -1));
  });

  it("leaves the public passport out until the user's id is known", () => {
    for (const id of [undefined, null, ""]) {
      const hrefs = appNavForUser(id).map((i) => i.href);
      expect(hrefs).toEqual(["/search", "/venues/map", "/republic", "/booking"]);
    }
  });

  it("gives the mobile bottom nav the same places, in order", () => {
    render(<MobileBottomNav />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      appNavForUser("u1").map((i) => i.href),
    );
    expect(screen.getByRole("link", { name: "Passport" })).toHaveAttribute(
      "href",
      "/user/u1",
    );
    expect(
      links.some((a) => a.getAttribute("href") === "/user"),
    ).toBe(false);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });
});
