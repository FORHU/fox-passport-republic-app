import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// jsdom has no IntersectionObserver; the sections' scroll-reveal needs one.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

const events = { current: [] as any[] };
vi.mock("@/features/landing/journey/data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/landing/journey/data")>()),
  useEventsQuery: () => ({
    data: events.current,
    isPending: false,
    isError: false,
  }),
  useEvents: () => events.current,
}));

import {
  EVENT_TYPES,
  EventGrid,
  EventTypes,
} from "@/features/landing/journey/booking";
import JourneyFooter from "@/features/landing/journey/JourneyFooter";

const href = (name: RegExp | string) =>
  screen.getByRole("link", { name }).getAttribute("href");

/**
 * "Find events" used to lead to two places: the package results and the Foxer
 * directory. Event links now all go to /packages (the same event templates the
 * landing shows); links to /search say "Find Foxers".
 */
describe("landing event links", () => {
  beforeEach(() => {
    events.current = [];
  });

  it("sends See all events to the package results", () => {
    events.current = [{ id: "e1", name: "Garden wedding", category: "wedding" }];
    render(<EventGrid />);
    expect(href(/See all/)).toBe("/packages");
  });

  it("points the empty state at the Foxers", () => {
    render(<EventGrid />);
    expect(href("Find Foxers")).toBe("/search");
  });

  it("opens each kind's package results from the event-type cards", () => {
    render(<EventTypes />);
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(
      EVENT_TYPES.map((t) => `/packages?category=${t.value}`),
    );
  });

  it("labels the footer links by where they go", () => {
    render(<JourneyFooter />);
    expect(href("Find events")).toBe("/packages");
    expect(href("Find Foxers")).toBe("/search");
  });
});
