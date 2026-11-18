import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DateRangePicker from "../DateRangePicker";

// The picker takes "today" from the UTC date; mid-month keeps the local
// view month on November in any test timezone.
const NOW = new Date("2026-11-16T04:00:00Z");
const TODAY = "2026-11-16";

function openPicker(
  props: Partial<Parameters<typeof DateRangePicker>[0]> = {},
) {
  render(
    <DateRangePicker
      startDate=""
      endDate=""
      onStartChange={() => {}}
      onEndChange={() => {}}
      {...props}
    />,
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Open calendar" })[0]);
  const today = document.querySelector('[aria-current="date"]') as HTMLElement;
  return { today };
}

describe("DateRangePicker calendar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks today with a static ring, not a pulse", () => {
    const { today } = openPicker();
    expect(today).toHaveTextContent("16");
    expect(today.className).toContain("ring-1");
    expect(today.className).not.toContain("animate-pulse");
  });

  it("lets the selected style win when today is selected", () => {
    const { today } = openPicker({ startDate: TODAY });
    expect(today.className).toContain("bg-accent");
    expect(today.className).not.toContain("ring-1");
  });

  it("draws the popover on an opaque surface", () => {
    const { today } = openPicker();
    const panel = today.closest(".rounded-2xl") as HTMLElement;
    expect(panel.className).toContain("bg-surface");
    expect(panel.className).not.toMatch(/bg-black\//);
  });

  it("has no looping animation unless loading, and honours reduced motion", () => {
    openPicker();
    expect(document.querySelector(".animate-pulse")).toBeNull();
    const popover = document.querySelector(".animate-in") as HTMLElement;
    expect(popover.className).toContain("motion-reduce:animate-none");
  });

  it("pulses only the loading grid, with a reduced-motion opt-out", () => {
    openPicker({ loading: true });
    const pulsing = document.querySelectorAll(".animate-pulse");
    expect(pulsing).toHaveLength(1);
    expect(pulsing[0]).toHaveAttribute("aria-busy", "true");
    expect(pulsing[0].className).toContain("motion-reduce:animate-none");
  });
});
