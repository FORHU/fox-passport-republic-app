import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The page's own sections are heavy (maps, queries); only the grid matters here.
vi.mock("@/features/landing/components/sections/LandingHeader", () => ({
  default: ({ eventsToggle }: { eventsToggle?: boolean }) => (
    <header data-testid="header" data-events-toggle={String(!!eventsToggle)} />
  ),
}));
vi.mock("@/features/landing/journey/JourneyHero", () => ({
  default: () => null,
}));
vi.mock("@/features/landing/journey/JourneyFooter", () => ({
  default: () => null,
}));
vi.mock("@/features/landing/journey/sections", () => ({
  ClosingCta: () => null,
  EarnBlock: () => null,
}));
vi.mock("@/features/landing/journey/FloorPlan", () => ({
  FloorPlan: () => null,
}));
vi.mock("@/features/landing/journey/booking", () => ({
  EventGrid: () => <section id="events" data-testid="event-grid" />,
  EventTypes: () => null,
}));

import JourneyLanding from "@/features/landing/journey/JourneyLanding";
import { useLandingPrefsStore } from "@/shared/store/useLandingPrefsStore";

/** app#380: the header switch shows or hides the landing event grid. */
describe("JourneyLanding events toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    useLandingPrefsStore.setState({ showEvents: true });
  });

  it("shows the event grid by default and turns the header switch on", () => {
    render(<JourneyLanding />);
    expect(screen.getByTestId("event-grid")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-events-toggle",
      "true",
    );
  });

  it("swaps the grid for a notice that keeps #events, and brings it back", async () => {
    const user = userEvent.setup();
    const { container } = render(<JourneyLanding />);

    act(() => useLandingPrefsStore.getState().setShowEvents(false));
    expect(screen.queryByTestId("event-grid")).not.toBeInTheDocument();
    expect(screen.getByText(/Events are hidden/)).toBeInTheDocument();
    expect(container.querySelector("#events")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Show events" }));
    expect(screen.getByTestId("event-grid")).toBeInTheDocument();
    expect(useLandingPrefsStore.getState().showEvents).toBe(true);
  });

  it("restores a visitor's saved choice after mount", async () => {
    localStorage.setItem(
      "landing-prefs",
      JSON.stringify({ state: { showEvents: false }, version: 0 }),
    );
    render(<JourneyLanding />);
    expect(await screen.findByText(/Events are hidden/)).toBeInTheDocument();
    expect(screen.queryByTestId("event-grid")).not.toBeInTheDocument();
  });

  it("saves the choice in this browser", () => {
    render(<JourneyLanding />);
    act(() => useLandingPrefsStore.getState().setShowEvents(false));
    expect(JSON.parse(localStorage.getItem("landing-prefs")!)).toMatchObject({
      state: { showEvents: false },
    });
  });
});
