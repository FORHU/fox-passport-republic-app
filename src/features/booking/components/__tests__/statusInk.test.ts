import { describe, it, expect } from "vitest";
import {
  bookingDays,
  canCancel,
  canReview,
  dayKey,
  displayTotal,
  groupBookings,
  mergeUpcoming,
  statusInk,
  statusLabel,
} from "../bookings/statusInk";

const past = new Date(Date.now() - 86_400_000).toISOString();
const soon = new Date(Date.now() + 86_400_000).toISOString();
const later = new Date(Date.now() + 5 * 86_400_000).toISOString();

const b = (over: Record<string, unknown>) => ({
  id: "booking-1",
  status: "confirmed",
  startAt: soon,
  totalAmount: "100",
  ...over,
});

describe("groupBookings", () => {
  it("splits a page into attention, coming up and past", () => {
    const groups = groupBookings([
      b({ id: "unpaid", status: "pending", startAt: past }),
      b({ id: "later", status: "confirmed", startAt: later }),
      b({ id: "soon", status: "pending", startAt: soon }),
      b({ id: "disputed", status: "disputed" }),
      b({ id: "done", status: "completed", startAt: past }),
      b({ id: "gone", status: "cancelled", startAt: later }),
      b({ id: "lapsed", status: "confirmed", startAt: past, endAt: past }),
    ]);

    expect(groups.attention.map((x) => x.id)).toEqual(["unpaid"]);
    // Coming up runs soonest first; a cancelled future booking is not coming up.
    expect(groups.upcoming.map((x) => x.id)).toEqual([
      "soon",
      "disputed",
      "later",
    ]);
    // Past runs latest first.
    expect(groups.past.map((x) => x.id)).toEqual(["gone", "done", "lapsed"]);
  });
});

describe("mergeUpcoming", () => {
  it("takes Coming up from the server list across pages, plus what's under way on this page", () => {
    const ongoing = new Date(Date.now() + 3_600_000).toISOString();
    const upcomingFromServer = [
      b({ id: "next", startAt: soon }),
      b({ id: "far", startAt: later }),
    ];
    const page = [
      b({ id: "far", startAt: later }), // also on this page
      b({ id: "now", status: "active", startAt: past, endAt: ongoing }),
      b({ id: "done", status: "completed", startAt: past }),
      b({ id: "unpaid", status: "pending", startAt: past }),
    ];

    const groups = mergeUpcoming(upcomingFromServer, page);

    expect(groups.upcoming.map((x) => x.id)).toEqual(["now", "next", "far"]);
    expect(groups.attention.map((x) => x.id)).toEqual(["unpaid"]);
    expect(groups.past.map((x) => x.id)).toEqual(["done"]);
  });
});

describe("bookingDays", () => {
  it("marks every day a booking covers", () => {
    const days = bookingDays({
      startAt: new Date(2026, 9, 24, 18).toISOString(),
      endAt: new Date(2026, 9, 26, 2).toISOString(),
    });
    expect(days).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("status", () => {
  it("labels a past-due unpaid booking as expired, in the attention ink", () => {
    const unpaid = b({ status: "pending", startAt: past });
    expect(statusLabel(unpaid)).toBe("Unpaid, expired");
    expect(statusInk(unpaid)).toContain("amber");
  });

  it("gives each meaning one ink", () => {
    expect(statusInk(b({ status: "confirmed" }))).toContain("accent-text");
    expect(statusInk(b({ status: "completed" }))).toContain("stamp-blue");
    expect(statusInk(b({ status: "cancelled" }))).toContain("stamp-red");
    expect(statusInk(b({ status: "pending" }))).toContain("text-white/70");
  });
});

describe("actions", () => {
  it("lets the booker cancel pending or confirmed bookings, never the host", () => {
    expect(canCancel(b({ status: "pending" }), false)).toBe(true);
    expect(canCancel(b({ status: "confirmed" }), false)).toBe(true);
    expect(canCancel(b({ status: "confirmed" }), true)).toBe(false);
    expect(canCancel(b({ status: "active" }), false)).toBe(false);
    expect(canCancel(b({ status: "pending", startAt: past }), false)).toBe(
      false,
    );
  });

  it("offers a review only on a completed, unreviewed booking of your own", () => {
    expect(canReview(b({ status: "completed", hasReview: false }), false)).toBe(
      true,
    );
    expect(canReview(b({ status: "completed", hasReview: true }), false)).toBe(
      false,
    );
    expect(canReview(b({ status: "completed" }), true)).toBe(false);
  });
});

describe("displayTotal", () => {
  it("prefers completed payments, else the booking total", () => {
    expect(displayTotal(b({ totalAmount: "250.5" }))).toBe(250.5);
    expect(
      displayTotal(
        b({
          totalAmount: "0",
          payments: [
            { status: "completed", amount: 40 },
            { status: "failed", amount: 99 },
          ],
        }),
      ),
    ).toBe(40);
  });
});
