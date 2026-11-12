import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

import { RewardsWalletView } from "@/features/gamification/components/rewards/RewardsWalletView";
import { RewardsStoreModal } from "@/features/gamification/components/rewards/RewardsStoreModal";
import {
  toWalletHistoryItem,
  type RewardCatalogItem,
} from "@/shared/api/rewards";

// As GET /rewards/me sends it: grants and lifecycle rows, coinsDelta
const mockWallet = {
  coins: 250,
  pendingCoins: 50,
  totalEarnedCoins: 300,
  history: [
    {
      id: "ev-1",
      type: "grant",
      action: "early_booking",
      coinsDelta: 100,
      refType: "booking",
      refId: "b-1",
      isPending: false,
      createdAt: "2026-11-05T08:00:00.000Z",
    },
    {
      id: "ev-2",
      type: "lifecycle",
      lifecycleType: "REDEMPTION",
      coinsDelta: -100,
      reason: "Redeemed ₱20 Discount (RWD-COIN20-ABC)",
      createdAt: "2026-11-05T09:00:00.000Z",
    },
  ],
};

const mockCatalog: RewardCatalogItem[] = [
  {
    id: "rwd-20",
    slug: "voucher-20-php",
    title: "₱20 Booking Discount",
    description: "₱20 off booking platform fee.",
    coinCost: 100,
    rewardType: "booking_voucher",
    targetAudience: "citizen",
    discountPhp: 20,
    discountPercentage: null,
    active: true,
    canAfford: true,
    minSubtotal: 800,
  },
  {
    id: "rwd-50",
    slug: "voucher-50-php",
    title: "₱50 Booking Discount",
    description: "₱50 off booking platform fee.",
    coinCost: 250,
    rewardType: "booking_voucher",
    targetAudience: "citizen",
    discountPhp: 50,
    discountPercentage: null,
    active: true,
    canAfford: true,
    minSubtotal: 2000,
  },
];

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

describe("toWalletHistoryItem", () => {
  it("maps grants to EARNED and lifecycle rows by type, keeping the voucher code checkout reads", () => {
    expect(toWalletHistoryItem(mockWallet.history[0] as any)).toMatchObject({
      type: "EARNED",
      action: "early_booking",
      coins: 100,
      metadata: { refType: "booking", refId: "b-1" },
    });
    expect(toWalletHistoryItem(mockWallet.history[1] as any)).toMatchObject({
      type: "REDEMPTION",
      action: "Redeemed ₱20 Discount (RWD-COIN20-ABC)",
      coins: -100,
    });
    expect(
      toWalletHistoryItem({
        id: "lc-9",
        type: "lifecycle",
        lifecycleType: "VOUCHER_RETURN",
        coinsDelta: 100,
        reason: "VOUCHER_EXPIRED: Tokens returned for unused voucher RWD-X",
        createdAt: "2026-12-06T01:30:00.000Z",
      }),
    ).toMatchObject({ type: "RETURNED", coins: 100 });
  });
});

describe("RewardsWalletView Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders spendable balance, pending escrow, Token rules and transaction history, with no level or rank", async () => {
    api.get.mockImplementation(async (url: string) => {
      if (url.includes("/rewards/me")) {
        return { data: { data: mockWallet } };
      }
      return { data: { data: [] } };
    });

    render(
      <QueryClientProvider client={createClient()}>
        <RewardsWalletView />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("250")).toBeInTheDocument();
      expect(screen.getByText("5 Tokens = ₱1")).toBeInTheDocument();
      expect(screen.getByText("Early Booking")).toBeInTheDocument();
    });

    expect(screen.getByText("+100 Tokens")).toBeInTheDocument();
    expect(screen.getByText("-100 Tokens")).toBeInTheDocument();
    expect(screen.queryByText(/Citizen Level/)).not.toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
    expect(screen.getAllByText("EARNED").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("REDEEMED")).toBeInTheDocument();
  });
});

describe("RewardsStoreModal Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders catalogue perks with no level lock, and allows eligible redemption", async () => {
    api.get.mockImplementation(async (url: string) => {
      if (url.includes("/rewards/catalog")) {
        return { data: { data: mockCatalog } };
      }
      return { data: { data: [] } };
    });

    api.post.mockResolvedValueOnce({
      data: {
        data: {
          redemption: { id: "red-1", rewardId: "rwd-20", coinsSpent: 100 },
          voucher: {
            id: "vch-1",
            code: "RWD-TEST20-XYZ",
            discountPhp: 20,
            expiresAt: "2026-12-05T00:00:00.000Z",
          },
        },
      },
    });

    render(
      <QueryClientProvider client={createClient()}>
        <RewardsStoreModal isOpen={true} onClose={vi.fn()} userCoins={250} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Citizen Rewards Store")).toBeInTheDocument();
      expect(screen.getByText("₱20 Booking Discount")).toBeInTheDocument();
      expect(screen.getByText("₱50 Booking Discount")).toBeInTheDocument();
    });

    // No level lock: everything affordable is eligible
    expect(screen.getAllByText("Eligible")).toHaveLength(2);
    expect(screen.queryByText(/Unlocks at Lvl/)).not.toBeInTheDocument();

    // Click Redeem on eligible ₱20 voucher
    const redeemButtons = screen.getAllByRole("button", { name: "Redeem" });
    fireEvent.click(redeemButtons[0]);

    // Confirmation dialog opens
    await waitFor(() => {
      expect(screen.getByText("Confirm Reward Redemption")).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: "Confirm & Deduct" });
    fireEvent.click(confirmBtn);

    // Success dialog presents generated voucher
    await waitFor(() => {
      expect(screen.getByText("Voucher Generated!")).toBeInTheDocument();
      expect(screen.getByText("RWD-TEST20-XYZ")).toBeInTheDocument();
    });
  });
});
