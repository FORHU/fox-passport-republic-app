import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const nav = vi.hoisted(() => ({
  params: new URLSearchParams(),
  router: { push: vi.fn(), replace: vi.fn() },
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.params,
  useRouter: () => nav.router,
}));
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));
vi.mock("@/features/landing/components/sections/LandingHeader", () => ({
  default: () => null,
}));
vi.mock("@/shared/api/providerSpecialties", () => ({
  useProviderSpecialties: () => ({ data: [] }),
}));
vi.mock("@/shared/components/ui/CascadingLocationFields", () => ({
  CascadingLocationFields: () => null,
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number | string }) => <>₱{String(amount)}</>,
}));

import SearchFilters from "@/features/search/components/SearchFilters";
import SearchClient from "@/app/search/_components/SearchClient";
import {
  MAX_PRICE_FILTER_MESSAGE,
  PRICE_MAX,
  maxPriceError,
  maxPriceParam,
} from "@/shared/lib/limits";

function renderWith(ui: React.ReactElement, qs = "") {
  nav.params = new URLSearchParams(qs);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const maxPriceBox = () => screen.getByRole("spinbutton");

/**
 * The /search Max Price filter (app#286) took any amount and quietly clamped
 * it 400ms later, and a bad `maxPrice` in the URL went straight to the API.
 * It now caps at PRICE_MAX with a message, rejects negative and invalid
 * values, and ignores junk in the URL.
 */
describe("Max Price filter limit", () => {
  beforeEach(() => {
    api.get.mockResolvedValue({
      data: { data: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 0 } },
    });
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("helpers", () => {
    it("accepts a price up to PRICE_MAX and flags the rest", () => {
      expect(maxPriceError("")).toBeNull();
      expect(maxPriceError("250000")).toBeNull();
      expect(maxPriceError(String(PRICE_MAX))).toBeNull();
      expect(maxPriceError("99999999")).toBe(MAX_PRICE_FILTER_MESSAGE);
      expect(maxPriceError("-5")).toBe("Prices cannot be negative.");
      expect(maxPriceError("10.555")).not.toBeNull();
    });

    it("keeps only a valid price from the URL", () => {
      expect(maxPriceParam("2500")).toBe("2500");
      expect(maxPriceParam("abc")).toBe("");
      expect(maxPriceParam("-5")).toBe("");
      expect(maxPriceParam("0")).toBe("");
      expect(maxPriceParam("1e400")).toBe("");
      expect(maxPriceParam("99999999")).toBe("");
      expect(maxPriceParam(null)).toBe("");
    });
  });

  describe("SearchFilters", () => {
    it("shows the maximum as helper text", () => {
      renderWith(<SearchFilters />);
      expect(maxPriceBox()).toHaveAttribute("max", String(PRICE_MAX));
      expect(screen.getByText(/Up to/)).toHaveTextContent(String(PRICE_MAX));
    });

    it("shows a message and applies nothing above the limit", () => {
      renderWith(<SearchFilters />);
      fireEvent.change(maxPriceBox(), { target: { value: "99999999" } });
      fireEvent.blur(maxPriceBox());
      expect(screen.getByRole("alert")).toHaveTextContent(
        MAX_PRICE_FILTER_MESSAGE,
      );
      expect(maxPriceBox()).toHaveAttribute("aria-invalid", "true");
      expect(nav.router.push).not.toHaveBeenCalled();
    });

    it("rejects a negative value", () => {
      renderWith(<SearchFilters />);
      fireEvent.change(maxPriceBox(), { target: { value: "-5" } });
      fireEvent.keyDown(maxPriceBox(), { key: "Enter" });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Prices cannot be negative.",
      );
      expect(nav.router.push).not.toHaveBeenCalled();
    });

    it("blocks the minus, plus and exponent keys", () => {
      renderWith(<SearchFilters />);
      for (const key of ["-", "+", "e", "E"]) {
        // fireEvent returns false when the handler called preventDefault.
        expect(fireEvent.keyDown(maxPriceBox(), { key })).toBe(false);
      }
      expect(fireEvent.keyDown(maxPriceBox(), { key: "5" })).toBe(true);
    });

    it("applies a valid price and starts again from page 1", () => {
      renderWith(<SearchFilters />, "page=3");
      fireEvent.change(maxPriceBox(), { target: { value: "250000" } });
      fireEvent.blur(maxPriceBox());
      expect(screen.queryByRole("alert")).toBeNull();
      expect(nav.router.push).toHaveBeenCalledWith(
        "/search?maxPrice=250000",
        { scroll: false },
      );
    });

    it("ignores a bad maxPrice in the URL", () => {
      renderWith(<SearchFilters />, "maxPrice=-5");
      expect(maxPriceBox()).toHaveValue(null);
      expect(screen.queryByText("active")).toBeNull();
    });
  });

  describe("SearchClient", () => {
    it.each(["abc", "-5", "1e400", "99999999"])(
      "does not send maxPrice=%s to the API",
      async (bad) => {
        renderWith(<SearchClient />, `maxPrice=${bad}`);
        await waitFor(() => expect(api.get).toHaveBeenCalled());
        for (const [, config] of api.get.mock.calls) {
          expect(config?.params ?? {}).not.toHaveProperty("maxPrice");
        }
        expect(
          screen.queryByRole("button", { name: "Remove filter: max price" }),
        ).toBeNull();
      },
    );

    it("sends a valid maxPrice to the API", async () => {
      renderWith(<SearchClient />, "maxPrice=2500");
      await waitFor(() =>
        expect(api.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            params: expect.objectContaining({ maxPrice: "2500" }),
          }),
        ),
      );
      expect(
        screen.getByRole("button", { name: "Remove filter: max price" }),
      ).toBeInTheDocument();
    });
  });
});
