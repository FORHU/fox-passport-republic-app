import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { EventsSection } from "@/features/dashboard/components/EventsSection";
import type { EventItem } from "@/features/dashboard/data/dashboardData";

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));

// Money reads the currency context; the amount itself is not under test.
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

/**
 * BUG-20 (app#136): the warning shows only when the venue really needs
 * confirming, and the card's actions follow the API's status.
 */

function event(overrides: Partial<EventItem>): EventItem {
  return {
    id: "e1",
    title: "Launch Night",
    date: "Oct 1, 2026",
    loc: "Makati",
    type: "corporate",
    status: "published",
    venueConfirmation: "confirmed",
    booked: null,
    capacity: 120,
    revenue: null,
    img: "",
    ...overrides,
  };
}

function renderCard(ev: EventItem) {
  render(<EventsSection events={[ev]} onEdit={vi.fn()} onDelete={vi.fn()} />);
  return screen.getByRole("button", { name: /Launch Night/ });
}

const WARNINGS = [
  "No venue confirmed yet",
  "Waiting for the venue to confirm",
  "Venue declined, choose another",
  "Missing venue confirmation",
];

function expectNoWarning(card: HTMLElement) {
  for (const text of WARNINGS) {
    expect(within(card).queryByText(text)).not.toBeInTheDocument();
  }
}

describe("EventsSection venue warning", () => {
  it("shows no warning for a published event with a confirmed venue", () => {
    const card = renderCard(event({}));
    expectNoWarning(card);
    expect(within(card).getByText("Booked")).toBeInTheDocument();
    expect(within(card).queryByTitle("Delete draft")).not.toBeInTheDocument();
    expect(
      within(card).queryByRole("button", { name: "Continue Editing" }),
    ).not.toBeInTheDocument();
  });

  it("opens the editor once from a published card's edit button", () => {
    const onEdit = vi.fn();
    render(<EventsSection events={[event({ id: "e9" })]} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit event" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith("e9");
  });

  it("warns on a published event whose venue was never confirmed", () => {
    const card = renderCard(event({ venueConfirmation: "missing" }));
    expect(
      within(card).getByText("No venue confirmed yet"),
    ).toBeInTheDocument();
    expect(within(card).queryByTitle("Delete draft")).not.toBeInTheDocument();
  });

  it("says the venue is still deciding on a pending event", () => {
    const card = renderCard(
      event({ status: "pending", venueConfirmation: "pending" }),
    );
    expect(
      within(card).getByText("Waiting for the venue to confirm"),
    ).toBeInTheDocument();
    expect(within(card).queryByTitle("Delete draft")).not.toBeInTheDocument();
    expect(within(card).queryByText("Booked")).not.toBeInTheDocument();
  });

  it("offers draft actions with the declined note on a draft", () => {
    const card = renderCard(
      event({ status: "draft", venueConfirmation: "declined" }),
    );
    expect(
      within(card).getByText("Venue declined, choose another"),
    ).toBeInTheDocument();
    expect(within(card).getByTitle("Delete draft")).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: "Continue Editing" }),
    ).toBeInTheDocument();
  });

  it("offers draft actions without a warning when the draft's venue is confirmed", () => {
    const card = renderCard(event({ status: "draft" }));
    expectNoWarning(card);
    expect(within(card).getByTitle("Delete draft")).toBeInTheDocument();
  });

  it("offers Edit, not Delete, on a rejected event", () => {
    const card = renderCard(event({ status: "rejected" }));
    expectNoWarning(card);
    expect(
      within(card).getByRole("button", { name: "Edit" }),
    ).toBeInTheDocument();
    expect(within(card).queryByTitle("Delete draft")).not.toBeInTheDocument();
  });

  it("draws an empty booked bar instead of NaN when the count is unknown", () => {
    const card = renderCard(event({ booked: null, capacity: null }));
    const bar = card.querySelector(".bg-accent.rounded-full") as HTMLElement;
    expect(bar.style.width).toBe("0%");
  });
});

describe("EventsSection status badge", () => {
  it("only displays the event's status: no menu to open", () => {
    const card = renderCard(event({ status: "published" }));
    const badge = within(card).getByText("Published");
    // A label, not a button with an expandable menu.
    expect(badge.closest("[aria-expanded]")).toBeNull();
    fireEvent.click(badge);
    expect(within(card).queryByText("Ongoing")).not.toBeInTheDocument();
  });
});
