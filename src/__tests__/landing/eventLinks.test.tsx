import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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

const events = { current: [] as any[], error: false };
vi.mock("@/features/landing/journey/data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/landing/journey/data")>()),
  useEventsQuery: () => ({
    data: events.current,
    isPending: false,
    isError: events.error,
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
    events.error = false;
  });

  it("sends See all events to the package results", () => {
    events.current = [{ id: "e1", name: "Garden wedding", category: "wedding" }];
    render(<EventGrid />);
    expect(href(/See all/)).toBe("/packages");
    expect(screen.queryByText("Example")).toBeNull();
  });

  // With nothing to book, the section shows examples, not an empty message.
  it("shows unbookable example cards when there are no events", () => {
    render(<EventGrid />);
    const badges = screen.getAllByText("Example");
    expect(badges).toHaveLength(EVENT_TYPES.length);
    for (const badge of badges) expect(badge.closest("a")).toBeNull();
    expect(screen.queryByText(/No events are open to book/)).toBeNull();
    expect(href(/Plan it with/)).toBe("/search");
  });

  it("keeps the error message when events fail to load", () => {
    events.error = true;
    render(<EventGrid />);
    expect(screen.getByText(/couldn.t load the events/)).toBeTruthy();
    expect(screen.queryByText("Example")).toBeNull();
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

  // A featured event is the card's preview only; the card still browses the kind.
  it("opens the kind's results even when a featured event is shown", () => {
    events.current = EVENT_TYPES.map((t) => ({
      id: t.value,
      name: `${t.label} night`,
      category: t.value,
    }));
    render(<EventTypes />);
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(
      EVENT_TYPES.map((t) => `/packages?category=${t.value}`),
    );
  });

  it("shows the event types without counts", () => {
    events.current = EVENT_TYPES.map((t) => ({
      id: t.value,
      name: `${t.label} night`,
      category: t.value,
    }));
    render(<EventTypes />);
    expect(screen.queryByText(/\d+ events?$/)).toBeNull();
    for (const t of EVENT_TYPES) expect(screen.getByText(t.label)).toBeTruthy();
  });

  // The photo beside the index follows the keyboard, not only the pointer.
  it("previews the kind whose row has focus", () => {
    const { container } = render(<EventTypes />);
    const preview = container.querySelector("[data-kind]");
    expect(preview?.getAttribute("data-kind")).toBe("wedding");
    fireEvent.focus(screen.getByRole("link", { name: /Birthday/ }));
    expect(preview?.getAttribute("data-kind")).toBe("birthday");
  });

  it("labels the footer links by where they go", () => {
    render(<JourneyFooter />);
    expect(href("Find events")).toBe("/packages");
    expect(href("Find Foxers")).toBe("/search");
  });
});
