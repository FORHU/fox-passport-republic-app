import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import DateRangePicker from "../DateRangePicker";

// The picker takes "today" from the local date; 04:00 UTC mid-month is
// still Nov 16 in every timezone from UTC-4 to UTC+19.
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

// Owns the dates like a real page does, and prints them as "start|end".
function Harness({ start = "", end = "" }: { start?: string; end?: string }) {
  const [s, setS] = useState(start);
  const [e, setE] = useState(end);
  return (
    <>
      <DateRangePicker
        startDate={s}
        endDate={e}
        onStartChange={setS}
        onEndChange={setE}
      />
      <output data-testid="range">{`${s}|${e}`}</output>
    </>
  );
}

const range = () => screen.getByTestId("range").textContent;
const day = (n: number) => screen.getByRole("button", { name: String(n) });
const openStart = () =>
  fireEvent.click(screen.getAllByRole("button", { name: "Open calendar" })[0]);
const openEnd = () =>
  fireEvent.click(screen.getAllByRole("button", { name: "Open calendar" })[1]);

describe("DateRangePicker start and end fields (app#365)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("changing the end from the End calendar keeps the start", () => {
    render(<Harness start="2026-11-20" end="2026-11-25" />);
    openEnd();
    fireEvent.click(day(27));
    expect(range()).toBe("2026-11-20|2026-11-27");
  });

  it("disables days before the start in the End calendar", () => {
    render(<Harness start="2026-11-29" />);
    openEnd();
    expect(day(22)).toBeDisabled();
    fireEvent.click(day(22));
    expect(range()).toBe("2026-11-29|");
    expect(day(29)).not.toBeDisabled();
    fireEvent.click(day(30));
    expect(range()).toBe("2026-11-29|2026-11-30");
  });

  it("picking a start after the end clears the end and asks for a new one", () => {
    render(<Harness start="2026-11-20" end="2026-11-25" />);
    openStart();
    fireEvent.click(day(28));
    expect(range()).toBe("2026-11-28|");
    expect(screen.getByText("Choose an end date")).toBeInTheDocument();
    expect(day(27)).toBeDisabled();
    fireEvent.click(day(30));
    expect(range()).toBe("2026-11-28|2026-11-30");
  });

  it("picking a start before the end keeps the end", () => {
    render(<Harness start="2026-11-20" end="2026-11-25" />);
    openStart();
    fireEvent.click(day(21));
    expect(range()).toBe("2026-11-21|2026-11-25");
  });

  it("picking an end first never sets the start", () => {
    render(<Harness />);
    openEnd();
    fireEvent.click(day(25));
    expect(range()).toBe("|2026-11-25");
    expect(screen.getByText("Choose a start date")).toBeInTheDocument();
    fireEvent.click(day(20));
    expect(range()).toBe("2026-11-20|2026-11-25");
  });

  it("typing a start keeps the same day (no timezone shift)", () => {
    render(<Harness />);
    const start = screen.getByLabelText("Start Date");
    fireEvent.change(start, { target: { value: "Nov 29, 2026" } });
    fireEvent.blur(start);
    expect(range()).toBe("2026-11-29|");
    // Leaving the field again without editing changes nothing.
    fireEvent.blur(start);
    expect(range()).toBe("2026-11-29|");
  });

  it("rejects a typed end before the start", () => {
    render(<Harness start="2026-11-29" end="2026-11-30" />);
    const end = screen.getByLabelText("End Date") as HTMLInputElement;
    fireEvent.change(end, { target: { value: "Nov 22, 2026" } });
    fireEvent.blur(end);
    expect(range()).toBe("2026-11-29|2026-11-30");
    expect(end.value).toBe("Nov 30, 2026");
  });

  it("reads a typed ISO date as that day and rejects one that doesn't exist", () => {
    render(<Harness />);
    const start = screen.getByLabelText("Start Date");
    fireEvent.change(start, { target: { value: "2026-11-29" } });
    fireEvent.blur(start);
    expect(range()).toBe("2026-11-29|");
    fireEvent.change(start, { target: { value: "2026-02-31" } });
    fireEvent.blur(start);
    expect(range()).toBe("2026-11-29|");
  });
});

describe("DateRangePicker stays open after a pick", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const done = () => screen.queryByRole("button", { name: "Done" });

  it("keeps the calendar open after picking an end", () => {
    render(<Harness start="2026-11-20" />);
    openEnd();
    fireEvent.click(day(25));
    expect(range()).toBe("2026-11-20|2026-11-25");
    expect(done()).toBeInTheDocument();
    expect(screen.getByText("Choose an end date")).toBeInTheDocument();
  });

  it("keeps the calendar open after picking a start that keeps the end", () => {
    render(<Harness start="2026-11-20" end="2026-11-25" />);
    openStart();
    fireEvent.click(day(21));
    expect(range()).toBe("2026-11-21|2026-11-25");
    expect(done()).toBeInTheDocument();
    expect(screen.getByText("Choose a start date")).toBeInTheDocument();
  });

  it("closes with Done, Escape, or a click outside", () => {
    render(<Harness start="2026-11-20" end="2026-11-25" />);
    openEnd();
    fireEvent.click(done()!);
    expect(done()).not.toBeInTheDocument();

    openEnd();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(done()).not.toBeInTheDocument();

    openEnd();
    fireEvent.click(document.querySelector(".fixed.inset-0")!);
    expect(done()).not.toBeInTheDocument();
  });
});
