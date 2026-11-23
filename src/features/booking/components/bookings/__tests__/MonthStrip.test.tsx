import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { MonthStrip } from "@/features/booking/components/bookings/MonthStrip";

/**
 * The bookings calendar: one seven-column month grid at every width, booked
 * days pickable, month navigation.
 */

afterEach(cleanup);

const booking = (id: string, startAt: string, status = "confirmed") => ({
  id,
  startAt,
  status,
  event: { name: `Event ${id}` },
});

function renderMonth(bookings: any[], onPick = vi.fn()) {
  // 1 December 2026 is a Tuesday, so the grid opens with two blank cells.
  const utils = render(
    createElement(MonthStrip, {
      bookings,
      anchor: new Date(2026, 11, 1),
      onPick,
    }),
  );
  return { ...utils, onPick };
}

describe("MonthStrip", () => {
  it("shows the weekday names once, above a seven-column grid", () => {
    renderMonth([]);
    for (const w of ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]) {
      expect(screen.getAllByText(w)).toHaveLength(1);
    }
  });

  it("starts the month on its weekday with leading blanks", () => {
    const { container } = renderMonth([]);
    const cells = container.querySelectorAll("ol > li");
    expect(container.querySelectorAll("ol > li[aria-hidden]")).toHaveLength(2);
    expect(cells).toHaveLength(2 + 31);
    expect(cells[2].textContent).toBe("1");
  });

  it("jumps to a booked day's bookings when it is picked", () => {
    const { onPick } = renderMonth([
      booking("a", "2026-12-10T12:00:00"),
      booking("b", "2026-12-10T18:00:00", "pending"),
      booking("c", "2026-12-14T12:00:00"),
    ]);
    expect(screen.getByText(/2 days with bookings/)).toBeTruthy();

    const day = screen.getByRole("button", { name: /2 bookings/ });
    expect(day.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(day);
    expect(onPick).toHaveBeenCalledWith(["a", "b"]);
    expect(day.getAttribute("aria-pressed")).toBe("true");
  });

  it("moves between months", () => {
    renderMonth([]);
    const heading = () => screen.getByRole("heading", { level: 2 }).textContent;
    expect(heading()).toMatch(/December/);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(heading()).toMatch(/January/);
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(heading()).toMatch(/November/);
  });
});
