import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

/**
 * The embedded Stripe pages sent `fox_stripe_account_id` from localStorage to
 * an unauthenticated route that opened whatever account it named: after an
 * account switch the next user saw the previous one's balances and payouts,
 * and anyone could name any account. The API picks the account now.
 */

const connect = vi.hoisted(() => ({ options: null as any }));
vi.mock("@stripe/connect-js", () => ({
  loadConnectAndInitialize: (options: unknown) => {
    connect.options = options;
    return {};
  },
}));
vi.mock("@stripe/react-connect-js", () => {
  const Empty = ({ children }: { children?: unknown }) => children ?? null;
  return {
    ConnectComponentsProvider: Empty,
    ConnectAccountOnboarding: Empty,
    ConnectBalances: Empty,
    ConnectPayments: Empty,
    ConnectPayouts: Empty,
    ConnectNotificationBanner: Empty,
    ConnectAccountManagement: Empty,
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const api = vi.hoisted(() => ({
  post: vi.fn(async () => ({ data: { data: { clientSecret: "cs_1" } } })),
}));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

import StripeDashboardClient from "@/app/creator-dashboard/stripe-dashboard/_components/StripeDashboardClient";
import StripeOnboardClient from "@/app/creator-dashboard/stripe-onboard/_components/StripeOnboardClient";

describe.each([
  ["dashboard", StripeDashboardClient],
  ["onboarding", StripeOnboardClient],
])("the Stripe %s page", (_name, Page) => {
  it("asks the API for the signed-in user's own account, naming none", async () => {
    localStorage.setItem("fox_stripe_account_id", "acct_previous_user");
    api.post.mockClear();
    render(<Page />);
    await waitFor(() => expect(connect.options).toBeTruthy());

    await expect(connect.options.fetchClientSecret()).resolves.toBe("cs_1");
    expect(api.post).toHaveBeenCalledWith("/stripe-connect/account-session");
    expect(api.post.mock.calls[0]).toHaveLength(1);
  });
});
