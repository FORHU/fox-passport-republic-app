import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const auth = vi.hoisted(() => ({
  user: { permissions: [] as string[] },
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: typeof auth) => unknown) => select(auth),
}));

import AdminPayoutsPanel, {
  canRetryPayout,
  type AdminPayout,
} from "@/features/admin/components/AdminPayoutsPanel";

/**
 * app#346: failed Foxer payouts (api#363's admin endpoints), with a Retry
 * only where the API would send it and only for an admin who may.
 */

const payout = (over: Partial<AdminPayout>): AdminPayout => ({
  id: "p1",
  sourceType: "event_venue_transaction",
  sourceId: "tx1",
  payoutAmount: "1500.00",
  status: "failed",
  failureReason: "stripe_error",
  failureMessage: "Your account has insufficient funds",
  transferAttempts: 1,
  createdAt: "2026-11-17T02:00:00Z",
  providerUser: { id: "u1", name: "Mara Venue", email: "mara@test.com" },
  ...over,
});

const ROWS = [
  payout({}),
  payout({
    id: "p2",
    failureReason: "source_refunded",
    failureMessage: "The booking line was cancelled or refunded",
    providerUser: { id: "u2", name: "Cancelled Carl", email: "c@test.com" },
  }),
];

function renderPanel(permissions: string[]) {
  auth.user = { permissions };
  api.get.mockResolvedValue({
    data: { data: ROWS, pagination: { page: 1, total: 2, totalPages: 1 } },
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminPayoutsPanel />
    </QueryClientProvider>,
  );
}

describe("AdminPayoutsPanel", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("lists failed payouts with recipient, reason and message", async () => {
    renderPanel(["payments:read:all"]);
    await screen.findByText(/Mara Venue/);
    expect(api.get).toHaveBeenCalledWith("/admin/payouts", {
      params: { status: "failed", page: 1, limit: 20 },
    });
    expect(screen.getByText("Your account has insufficient funds")).toBeTruthy();
    expect(screen.getAllByText("Stripe error").length).toBeGreaterThan(0);
    // Read-only without payments:manage.
    expect(screen.queryByRole("button", { name: /Retry/ })).toBeNull();
  });

  it("filters by failure reason", async () => {
    renderPanel(["payments:read:all"]);
    await screen.findByText(/Mara Venue/);
    fireEvent.click(screen.getByRole("button", { name: "Not onboarded" }));
    await waitFor(() =>
      expect(api.get).toHaveBeenLastCalledWith("/admin/payouts", {
        params: {
          status: "failed",
          page: 1,
          limit: 20,
          failureReason: "not_onboarded",
        },
      }),
    );
  });

  it("retries a payout, and offers no retry for a cancelled line", async () => {
    renderPanel(["payments:read:all", "payments:manage"]);
    await screen.findByText(/Mara Venue/);
    const buttons = screen.getAllByRole("button", { name: /Retry/ });
    expect(buttons).toHaveLength(1); // not for Cancelled Carl

    api.post.mockResolvedValue({
      data: { data: payout({ status: "paid", failureReason: null }) },
    });
    fireEvent.click(buttons[0]);
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/admin/payouts/p1/retry"),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Payout sent"));
  });

  it("shows the API's refusal", async () => {
    renderPanel(["payments:read:all", "payments:manage"]);
    await screen.findByText(/Mara Venue/);
    api.post.mockRejectedValue({
      response: { data: { message: "This payout has already been paid" } },
    });
    fireEvent.click(screen.getByRole("button", { name: /Retry/ }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This payout has already been paid",
      ),
    );
  });

  it("knows which payouts a retry can send", () => {
    expect(canRetryPayout(payout({}))).toBe(true);
    expect(canRetryPayout(payout({ failureReason: "not_onboarded" }))).toBe(
      true,
    );
    expect(canRetryPayout(payout({ failureReason: "source_refunded" }))).toBe(
      false,
    );
    expect(canRetryPayout(payout({ payoutAmount: "0.00" }))).toBe(false);
    expect(canRetryPayout(payout({ status: "paid" }))).toBe(false);
  });
});
