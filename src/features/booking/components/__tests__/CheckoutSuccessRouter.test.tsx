import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutSuccessRouter } from "../CheckoutSuccessRouter";

// Mock next/navigation
let mockSearchParams = new Map<string, string>();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

// Mock the components
vi.mock("@/features/booking/components/CheckoutSuccessClient", () => ({
  default: () => (
    <div data-testid="legacy-checkout-success">Legacy Success</div>
  ),
}));

vi.mock("@/features/booking/components/MobileBookingSuccess", () => ({
  default: () => (
    <div data-testid="legacy-mobile-success">Legacy Mobile Success</div>
  ),
}));

vi.mock("@/shared/components/payment/CentralPaymentStatusClient", () => ({
  CentralPaymentStatusClient: ({ invoiceId }: { invoiceId: string }) => (
    <div data-testid="central-payment-success">
      Central Payment Status: {invoiceId}
    </div>
  ),
}));

describe("CheckoutSuccessRouter", () => {
  it("renders Central Payment status when invoiceId is present", () => {
    mockSearchParams = new Map([["invoiceId", "inv-123"]]);

    render(<CheckoutSuccessRouter />);

    expect(screen.getByTestId("central-payment-success")).toBeDefined();
    expect(screen.getByText("Central Payment Status: inv-123")).toBeDefined();
    expect(screen.queryByTestId("legacy-checkout-success")).toBeNull();
  });

  it("renders legacy flow when invoiceId is missing", () => {
    mockSearchParams = new Map();

    render(<CheckoutSuccessRouter />);

    expect(screen.getByTestId("legacy-checkout-success")).toBeDefined();
    expect(screen.getByTestId("legacy-mobile-success")).toBeDefined();
    expect(screen.queryByTestId("central-payment-success")).toBeNull();
  });
});
