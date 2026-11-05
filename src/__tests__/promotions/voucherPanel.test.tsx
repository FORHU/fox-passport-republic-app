import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import type { Promotion } from "@/shared/api/promotions";

/**
 * BUG-17 (app#134): generating codes is easy to find, and the screens show
 * the API's codes, count and eligibility as sent — the app filters and
 * decides nothing itself.
 */

const api = vi.hoisted(() => ({
  fetchOwnPromotions: vi.fn(),
  fetchPromotions: vi.fn(),
  generateOwnVouchers: vi.fn(),
  generateVouchers: vi.fn(),
  importOwnVouchers: vi.fn(),
  importVouchers: vi.fn(),
  setOwnVoucherActive: vi.fn(),
  setVoucherActive: vi.fn(),
  fetchOwnPromotionAnalytics: vi.fn(async () => ({
    redemptionCount: 0,
    totalDiscountGiven: 0,
    firstRedeemedAt: null,
    lastRedeemedAt: null,
  })),
  fetchPromotionAnalytics: vi.fn(async () => ({
    redemptionCount: 0,
    totalDiscountGiven: 0,
    firstRedeemedAt: null,
    lastRedeemedAt: null,
  })),
  createOwnPromotion: vi.fn(),
  updateOwnPromotion: vi.fn(),
  deleteOwnPromotion: vi.fn(),
  createPromotion: vi.fn(),
  updatePromotion: vi.fn(),
  deletePromotion: vi.fn(),
}));
vi.mock("@/shared/api/promotions", () => api);

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

vi.mock("@/shared/auth/RequireAuth", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/features/dashboard/components", () => ({
  DashboardHeader: () => null,
}));
vi.mock("@/features/admin/components/AuditHistoryPanel", () => ({
  default: () => null,
}));

const { default: FoxerPromotionsClient } =
  await import("@/features/dashboard/components/FoxerPromotionsClient");
const { default: AdminPromotions } =
  await import("@/features/admin/components/AdminPromotions");

function promo(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "p1",
    name: "Summer Sale",
    description: null,
    transactionType: null,
    category: null,
    subcategory: null,
    providerId: "foxer-1",
    assetId: null,
    serviceId: null,
    venueId: "venue-1",
    discountType: "percentage",
    discountValue: 10,
    minSubtotal: null,
    maxDiscount: null,
    active: true,
    startDate: null,
    endDate: null,
    usageLimit: null,
    perUserLimit: null,
    autoApply: false,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    vouchers: [],
    voucherCount: 0,
    canGenerateCodes: true,
    codeGenerationBlockedReason: null,
    ...overrides,
  };
}

const LISTINGS = [{ id: "venue-1", name: "Rooftop", kind: "venue" as const }];

async function renderFoxer(promotions: Promotion[]) {
  api.fetchOwnPromotions.mockResolvedValue(promotions);
  render(<FoxerPromotionsClient listingOptions={LISTINGS} />);
  return screen.findByText(promotions[0].name);
}

beforeEach(() => vi.clearAllMocks());

describe("Foxer promotions: finding code generation", () => {
  it("offers a Manage codes button that opens the codes panel", async () => {
    await renderFoxer([promo()]);
    const toggle = screen.getByRole("button", { name: /Manage codes/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: /Generate Codes/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /Generate Codes/ }),
    ).toBeInTheDocument();
  });

  it("hints at Manage codes while a promotion has no codes", async () => {
    await renderFoxer([promo()]);
    expect(
      screen.getByText("No codes yet. Open Manage codes to generate them."),
    ).toBeInTheDocument();
  });
});

describe("Foxer promotions: showing the API's data as sent", () => {
  it("shows the API's count and every code it sends, without filtering", async () => {
    await renderFoxer([
      promo({
        voucherCount: 7,
        // Whatever the API sends is shown; it is the API that leaves out
        // the hidden auto-apply code.
        vouchers: [
          {
            id: "v1",
            code: "AUTO-LOOKALIKE",
            promotionId: "p1",
            active: true,
            createdAt: "2026-11-01T00:00:00.000Z",
          },
        ],
      }),
    ]);
    expect(screen.getByText("7 codes")).toBeInTheDocument();
    expect(
      screen.queryByText("No codes yet. Open Manage codes to generate them."),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Manage codes/ }));
    expect(screen.getByText("AUTO-LOOKALIKE")).toBeInTheDocument();
  });

  it("shows the API's reason and no controls when codes can't be added", async () => {
    await renderFoxer([
      promo({
        active: false,
        canGenerateCodes: false,
        codeGenerationBlockedReason:
          "This promotion is deactivated. Reactivate it to add codes.",
      }),
    ]);
    fireEvent.click(screen.getByRole("button", { name: /View details/ }));

    expect(
      screen.getByText(
        "This promotion is deactivated. Reactivate it to add codes.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Generate Codes/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Import Codes/ }),
    ).not.toBeInTheDocument();
  });
});

describe("Foxer promotions: generating", () => {
  it("sends the request, confirms, and reloads the count from the API", async () => {
    await renderFoxer([promo()]);
    api.generateOwnVouchers.mockResolvedValue([{ id: "v1" }, { id: "v2" }]);
    api.fetchOwnPromotions.mockResolvedValue([promo({ voucherCount: 2 })]);

    fireEvent.click(screen.getByRole("button", { name: /Manage codes/ }));
    const panel = document.getElementById("promo-codes-p1")!;
    fireEvent.change(within(panel).getAllByRole("textbox")[0], {
      target: { value: "2" },
    });
    fireEvent.click(
      within(panel).getByRole("button", { name: /Generate Codes/ }),
    );

    await waitFor(() =>
      expect(api.generateOwnVouchers).toHaveBeenCalledWith("p1", 2, undefined),
    );
    expect(toast.success).toHaveBeenCalledWith("Generated 2 voucher code(s).");
    expect(await screen.findByText("2 codes")).toBeInTheDocument();
    expect(api.fetchOwnPromotions).toHaveBeenCalledTimes(2);
  });

  it("shows the API's message when it refuses", async () => {
    await renderFoxer([promo()]);
    api.generateOwnVouchers.mockRejectedValue({
      response: { data: { message: "count must be between 1 and 500" } },
    });

    fireEvent.click(screen.getByRole("button", { name: /Manage codes/ }));
    fireEvent.click(screen.getByRole("button", { name: /Generate Codes/ }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "count must be between 1 and 500",
      ),
    );
  });
});

describe("Admin promotions", () => {
  it("shows the API's count and opens codes from a visible button", async () => {
    api.fetchPromotions.mockResolvedValue([
      promo({ providerId: null, venueId: null, voucherCount: 3 }),
    ]);
    render(<AdminPromotions />);
    await screen.findByText("Summer Sale");

    expect(screen.getByText("3 codes")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /Manage codes/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /Generate Codes/ }),
    ).toBeInTheDocument();
  });
});
