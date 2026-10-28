import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// jsdom has no IntersectionObserver; the section's scroll-reveal needs one.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

vi.mock("@/features/landing/journey/data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/landing/journey/data")>()),
  useFoxerTotal: () => 0,
}));

import { EarnBlock } from "@/features/landing/journey/sections";
import RoleDocs from "@/features/landing/journey/RoleDocs";
import JourneyFooter from "@/features/landing/journey/JourneyFooter";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import { ROLES } from "@/features/landing/journey/data";

/**
 * The Earn role cards used to link to protected apply routes, which bounced
 * signed-out visitors back to the hero. They now open each role's public
 * docs page.
 */
describe("Earn role docs", () => {
  it("links every role card to its public docs page", () => {
    render(<EarnBlock />);
    for (const r of ROLES) {
      const card = screen.getByRole("link", { name: new RegExp(`^${r.name}`) });
      expect(card.getAttribute("href")).toBe(`/earn/${r.key}`);
    }
  });

  it("shows the role's documentation and marks it current", () => {
    render(<RoleDocs slug="venue" />);
    expect(screen.getByRole("heading", { name: "Venue Foxer" })).toBeTruthy();
    expect(
      screen.getByText(/Approve the Event Foxers who want to host/),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /^Venue Foxer/ })
        .getAttribute("aria-current"),
    ).toBe("page");
    // Signed out: applying opens sign-in instead of linking to a protected route.
    expect(
      screen.getByRole("button", { name: "Apply as Venue Foxer" }),
    ).toBeTruthy();
  });

  // The footers had the same bug: their role links went to the apply routes.
  it("points the landing footer's role links at public pages", () => {
    render(<JourneyFooter />);
    const column = screen.getByText("Become a Foxer").parentElement!;
    const hrefs = Array.from(column.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual(["#earn", "/earn/event", "/earn/venue"]);
  });

  it("points the shared footer's Become a Foxer at the role docs", () => {
    render(<LandingFooter />);
    expect(
      screen.getByRole("link", { name: "Become a Foxer" }).getAttribute("href"),
    ).toBe("/earn/event");
  });
});
