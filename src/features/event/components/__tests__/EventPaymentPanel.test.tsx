import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventPaymentPanel } from "../EventPaymentPanel";
import * as eventHooks from "@/features/event/hooks/useEventCheckout";

vi.mock("@/features/event/hooks/useEventCheckout");

describe("EventPaymentPanel", () => {
  const mockCheckout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (eventHooks.useEventPaymentSummary as any).mockReturnValue({
      data: {
        eventId: "event-123",
        subtotalAmount: 5000,
        discountAmount: 0,
        platformFeeAmount: 500,
        grossAmount: 5500,
        currency: "PHP",
      },
      isLoading: false,
      error: null,
    });

    (eventHooks.useEventCheckoutMutation as any).mockReturnValue({
      mutate: mockCheckout,
      isPending: false,
      error: null,
    });
  });

  it("loads and displays payment summary", () => {
    render(<EventPaymentPanel eventId="event-123" />);

    expect(screen.getByText("₱5,000.00")).toBeDefined();
    expect(screen.getByText("₱500.00")).toBeDefined();
    expect(screen.getByText("₱5,500.00")).toBeDefined();
  });

  it("Pay Now triggers checkout mutation", () => {
    render(<EventPaymentPanel eventId="event-123" />);
    const button = screen.getByText("Pay Now");
    fireEvent.click(button);
    expect(mockCheckout).toHaveBeenCalledWith({
      eventId: "event-123",
      voucherCode: undefined,
    });
  });

  it("disables button while loading", () => {
    (eventHooks.useEventCheckoutMutation as any).mockReturnValue({
      mutate: mockCheckout,
      isPending: true,
      error: null,
    });

    render(<EventPaymentPanel eventId="event-123" />);
    const button = screen.getByRole("button", {
      name: /Redirecting to secure checkout/i,
    });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("displays existing error behavior correctly", () => {
    (eventHooks.useEventCheckoutMutation as any).mockReturnValue({
      mutate: mockCheckout,
      isPending: false,
      error: { response: { data: { message: "Already paid" } } },
    });

    render(<EventPaymentPanel eventId="event-123" />);
    expect(screen.getByText("Already paid")).toBeDefined();

    const button = screen.getByText("Pay Now");
    expect(button.hasAttribute("disabled")).toBe(false);
  });
});
