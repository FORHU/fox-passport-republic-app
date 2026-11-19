import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

import AdminChargebacksPanel, {
  isUrgent,
  stripeDisputeUrl,
  type AdminChargeback,
} from "@/features/admin/components/AdminChargebacksPanel";

/**
 * app#346: Stripe chargebacks recorded by the API, so an admin answers each
 * one in Stripe before its evidence deadline.
 */

const NOW = Date.parse("2026-11-18T00:00:00Z");
const DAY = 86_400_000;

const chargeback = (over: Partial<AdminChargeback>): AdminChargeback => ({
  id: "c1",
  stripeDisputeId: "dp_123",
  stripeChargeId: "ch_123",
  amount: "1234.50",
  currency: "php",
  reason: "fraudulent",
  status: "needs_response",
  evidenceDueBy: new Date(NOW + 2 * DAY).toISOString(),
  createdAt: "2026-11-17T02:00:00Z",
  payment: {
    id: "pay1",
    invoiceId: "inv1",
    assetBookingId: null,
    serviceBookingId: null,
  },
  ...over,
});

function renderPanel(rows: AdminChargeback[]) {
  api.get.mockResolvedValue({
    data: { data: rows, pagination: { page: 1, total: rows.length, totalPages: 1 } },
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminChargebacksPanel />
    </QueryClientProvider>,
  );
}

describe("AdminChargebacksPanel", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("lists chargebacks with status, reason, deadline and a Stripe link", async () => {
    renderPanel([chargeback({})]);
    await screen.findByText("Fraudulent");
    expect(api.get).toHaveBeenCalledWith("/admin/payment-disputes", {
      params: { page: 1, limit: 20 },
    });
    expect(screen.getAllByText("Needs response").length).toBeGreaterThan(0);
    expect(screen.getByText(/Evidence due/)).toBeTruthy();
    expect(screen.getByText("Event or sponsorship payment")).toBeTruthy();
    const link = screen.getByRole("link", { name: /Open in Stripe/ });
    expect(link.getAttribute("href")).toMatch(/disputes\/dp_123$/);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("hides the deadline once the chargeback is answered", async () => {
    renderPanel([chargeback({ status: "won" })]);
    await screen.findByText("Fraudulent");
    expect(screen.queryByText(/Evidence due/)).toBeNull();
  });

  it("filters by status", async () => {
    renderPanel([chargeback({})]);
    await screen.findByText("Fraudulent");
    fireEvent.click(screen.getByRole("button", { name: "Lost" }));
    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith("/admin/payment-disputes", {
        params: { page: 1, limit: 20, status: "lost" },
      }),
    );
  });

  it("marks an unanswered chargeback urgent within three days of its deadline", () => {
    expect(isUrgent(chargeback({}), NOW)).toBe(true);
    expect(
      isUrgent(
        chargeback({ evidenceDueBy: new Date(NOW + 5 * DAY).toISOString() }),
        NOW,
      ),
    ).toBe(false);
    expect(isUrgent(chargeback({ status: "under_review" }), NOW)).toBe(false);
    expect(isUrgent(chargeback({ evidenceDueBy: null }), NOW)).toBe(false);
  });

  it("links to Stripe's test dashboard with a test key", () => {
    expect(stripeDisputeUrl("dp_1", "pk_test_abc")).toBe(
      "https://dashboard.stripe.com/test/disputes/dp_1",
    );
    expect(stripeDisputeUrl("dp_1", "pk_live_abc")).toBe(
      "https://dashboard.stripe.com/disputes/dp_1",
    );
  });
});
