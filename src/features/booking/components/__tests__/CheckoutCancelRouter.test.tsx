import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutCancelRouter } from "../CheckoutCancelRouter";

let mockSearchParams = new Map<string, string>();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

vi.mock("@/shared/components/payment/CentralPaymentStatusClient", () => ({
  CentralPaymentStatusClient: ({ invoiceId }: { invoiceId: string }) => (
    <div data-testid="central-payment-cancel">Actual Status Lookup: {invoiceId}</div>
  ),
}));

describe("CheckoutCancelRouter", () => {
  it("renders Central Payment status lookup when invoiceId is present", () => {
    mockSearchParams = new Map([["invoiceId", "inv-123"]]);
    
    render(<CheckoutCancelRouter />);
    
    expect(screen.getByTestId("central-payment-cancel")).toBeDefined();
    expect(screen.getByText("Actual Status Lookup: inv-123")).toBeDefined();
    expect(screen.queryByText("Checkout Cancelled")).toBeNull();
  });

  it("renders generic checkout cancelled when invoiceId is missing", () => {
    mockSearchParams = new Map();
    
    render(<CheckoutCancelRouter />);
    
    expect(screen.getByText("Checkout Cancelled")).toBeDefined();
    expect(screen.queryByTestId("central-payment-cancel")).toBeNull();
  });
});
