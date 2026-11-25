import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  ProviderDashboard,
  ProviderLineItem,
} from "@/features/event/api/marketplaceItems";

/** app#318: a Provider or Mayor declines a booked event until it is paid. */

const h = vi.hoisted(() => ({
  fetch: vi.fn(),
  review: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/features/event/api/marketplaceItems", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchProviderMarketplaceItems: h.fetch,
  reviewLineItem: h.review,
}));
vi.mock("sonner", () => ({
  toast: { success: h.toastSuccess, error: h.toastError },
}));

import ProviderMarketplaceRequestsClient from "../ProviderMarketplaceRequestsClient";

const row = (over: Partial<ProviderLineItem>): ProviderLineItem => ({
  id: "tx",
  status: "approved",
  agreedPrice: 1000,
  booking: { status: "pending" },
  event: { name: "Garden wedding", startAt: "2026-12-05T10:00:00Z" },
  ...over,
});

const dashboard = (over: Partial<ProviderDashboard>): ProviderDashboard => ({
  assets: [],
  services: [],
  venues: [],
  summary: { totalPending: 0, totalApproved: 0 },
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  h.review.mockResolvedValue({});
});

describe("ProviderMarketplaceRequestsClient", () => {
  it("names a Mayor's venue row, and offers Decline only while unpaid", async () => {
    h.fetch.mockResolvedValue(
      dashboard({
        venues: [row({ id: "v1", venue: { name: "Grand Hall" } })],
        assets: [
          row({
            id: "a1",
            asset: { name: "Paid speakers" },
            booking: { status: "confirmed" },
          }),
          row({
            id: "a2",
            status: "pending_provider_confirmation",
            asset: { name: "New request" },
          }),
        ],
      }),
    );
    render(<ProviderMarketplaceRequestsClient />);

    const hall = (await screen.findByText("Grand Hall")).closest("div")!
      .parentElement!;
    expect(
      within(hall).getByRole("button", { name: "Decline" }),
    ).toBeInTheDocument();

    const paid = screen.getByText("Paid speakers").closest("div")!
      .parentElement!;
    expect(within(paid).queryByRole("button", { name: "Decline" })).toBeNull();
    expect(within(paid).getByText("Paid")).toBeInTheDocument();

    // A new request keeps its Confirm / Decline (reject), not the booked one.
    const request = screen.getByText("New request").closest("div")!
      .parentElement!;
    expect(
      within(request).getByRole("button", { name: "Confirm" }),
    ).toBeInTheDocument();
  });

  it("declines as busy or for another reason", async () => {
    h.fetch.mockResolvedValue(
      dashboard({ venues: [row({ id: "v1", venue: { name: "Grand Hall" } })] }),
    );
    render(<ProviderMarketplaceRequestsClient />);

    await userEvent.click(await screen.findByRole("button", { name: "Decline" }));
    await userEvent.click(screen.getByRole("button", { name: "I'm busy then" }));
    await waitFor(() =>
      expect(h.review).toHaveBeenCalledWith("v1", "venue", "decline", "busy"),
    );

    await userEvent.click(await screen.findByRole("button", { name: "Decline" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Decline this booking" }),
    );
    await waitFor(() =>
      expect(h.review).toHaveBeenLastCalledWith(
        "v1",
        "venue",
        "decline",
        "other",
      ),
    );
    expect(h.toastSuccess).toHaveBeenCalledWith(
      "You declined. The host and the citizen were told.",
    );
  });

  it("shows the API's reason when the booking was paid meanwhile", async () => {
    h.fetch.mockResolvedValue(
      dashboard({ services: [row({ id: "s1", service: { name: "DJ set" } })] }),
    );
    h.review.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message: "This booking is paid, so it can't be declined.",
          code: "DECLINE_AFTER_PAYMENT",
        },
      },
    });
    render(<ProviderMarketplaceRequestsClient />);

    await userEvent.click(await screen.findByRole("button", { name: "Decline" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Decline this booking" }),
    );

    await waitFor(() =>
      expect(h.toastError).toHaveBeenCalledWith(
        "This booking is paid, so it can't be declined.",
      ),
    );
    // The list is read again, so the row shows where it stands now.
    expect(h.fetch).toHaveBeenCalledTimes(2);
  });
});
