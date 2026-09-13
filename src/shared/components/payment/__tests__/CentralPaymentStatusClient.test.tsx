import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CentralPaymentStatusClient } from "../CentralPaymentStatusClient";
import * as invoiceHooks from "@/shared/hooks/useInvoiceStatus";

vi.mock("@/shared/hooks/useInvoiceStatus");
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({ user: { role: "member" } }),
}));
vi.mock("@/shared/lib/dashboard-path", () => ({
  getDashboardPath: () => "/dashboard",
}));

describe("CentralPaymentStatusClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loading state when fetching initially", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("shows processing state", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "processing" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Confirming Payment...")).toBeDefined();
  });

  it("shows 15-second safety timeout message without failing", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "processing" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(screen.getByText("Confirming Payment...")).toBeDefined();
    expect(screen.getByText("Payment is still being confirmed. You can safely leave this page.")).toBeDefined();
    expect(screen.queryByText("Payment Failed or Cancelled")).toBeNull();
  });

  it("shows paid state", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "paid" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Payment Confirmed!")).toBeDefined();
  });

  it("shows failed state", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "failed" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Payment Not Completed")).toBeDefined();
  });

  it("shows cancelled state", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "cancelled" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Payment Not Completed")).toBeDefined();
  });

  it("shows refunded state as its own terminal outcome, not the confirming spinner", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "refunded" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Payment Not Completed")).toBeDefined();
    expect(screen.getByText("This payment was refunded.")).toBeDefined();
    expect(screen.queryByText("Confirming Payment...")).toBeNull();
  });

  it("falls through to the confirming spinner for pending — the real pre-webhook value", () => {
    (invoiceHooks.useInvoiceStatusPoll as any).mockReturnValue({
      data: { status: "pending" },
      isLoading: false,
      isError: false,
    });

    render(<CentralPaymentStatusClient invoiceId="inv-123" />);
    expect(screen.getByText("Confirming Payment...")).toBeDefined();
  });
});
