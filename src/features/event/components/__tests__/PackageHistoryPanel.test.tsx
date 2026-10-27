import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import PackageHistoryPanel from "@/features/event/components/PackageHistoryPanel";
import type { PackageHistoryEntry } from "@/shared/api/event-templates";

/**
 * Event Studio's History: each entry from GET /event-templates/:id/history as
 * a sentence, with who and when.
 */

const api = vi.hoisted(() => ({ fetchPackageHistory: vi.fn() }));
vi.mock("@/shared/api/event-templates", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchPackageHistory: api.fetchPackageHistory,
}));

const entry = (over: Partial<PackageHistoryEntry>): PackageHistoryEntry => ({
  id: Math.random().toString(36),
  at: "2027-06-01T10:00:00Z",
  action: "package.edit",
  actor: { id: "foxer", name: "Ivan" },
  ...over,
});

function renderPanel(entries: PackageHistoryEntry[]) {
  api.fetchPackageHistory.mockResolvedValue(entries);
  render(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(PackageHistoryPanel, { templateId: "t1" }),
    ),
  );
}

describe("PackageHistoryPanel", () => {
  it("writes each kind of entry as a sentence", async () => {
    renderPanel([
      entry({
        changes: {
          maxAttendees: { from: 100, to: null },
          hostMarkupPct: { from: 10, to: 12 },
          category: { from: "birthday", to: "beach_resort" },
        },
      }),
      entry({
        action: "package.item.add",
        kind: "venue",
        itemName: "Sky Hall",
      }),
      entry({ action: "package.item.remove", kind: "asset", itemName: null }),
      entry({
        action: "booking.created",
        actor: { id: "guest", name: "Ana" },
        guestCount: 40,
      }),
      entry({ action: "booking.paid", amount: 1500 }),
      entry({ action: "booking.cancelled", refunded: true }),
      entry({ action: "booking.checkedIn", actor: { id: "x", name: null } }),
    ]);

    expect(await screen.findByText("Max Attendees: 100 → no limit")).toBeTruthy();
    expect(screen.getByText("Markup: 10% → 12%")).toBeTruthy();
    expect(screen.getByText("Category: Birthday → Beach resort")).toBeTruthy();
    expect(screen.getByText("Added venue Sky Hall")).toBeTruthy();
    expect(screen.getByText("Removed gear")).toBeTruthy();
    expect(screen.getByText("Booked for 40 guests")).toBeTruthy();
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText(/^Paid .*1,500/)).toBeTruthy();
    expect(screen.getByText("Cancelled a booking (refunded)")).toBeTruthy();
    expect(screen.getByText("Deleted user")).toBeTruthy();
  });

  it("says when nothing is recorded yet", async () => {
    renderPanel([]);
    expect(await screen.findByText("Nothing recorded yet.")).toBeTruthy();
  });
});
