import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProposalActions } from "../ProposalActions";
import * as partnershipHooks from "@/features/partnership/hooks/usePartnerships";
import * as checkoutHooks from "@/features/partnership/hooks/usePartnershipCheckout";

vi.mock("@/features/partnership/hooks/usePartnerships");
vi.mock("@/features/partnership/hooks/usePartnershipCheckout");

describe("ProposalActions", () => {
  const mockCheckout = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (partnershipHooks.useAcceptPartnershipProposal as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (partnershipHooks.useRejectPartnershipProposal as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (partnershipHooks.useWithdrawPartnershipProposal as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
    
    (checkoutHooks.usePartnershipCheckoutMutation as any).mockReturnValue({
      mutate: mockCheckout,
      isPending: false,
      error: null
    });
  });

  it("shows Pay Sponsorship for pending accepted sponsorships", () => {
    const proposal: any = {
      id: "prop-123",
      status: "accepted",
      partnershipType: "sponsorship",
      payment: { required: true, status: "pending" },
    };

    render(<ProposalActions proposal={proposal} />);
    const button = screen.getByText("Pay Now");
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(mockCheckout).toHaveBeenCalledWith("prop-123");
  });

  it("shows Paid state when already paid", () => {
    const proposal: any = {
      id: "prop-123",
      status: "accepted",
      partnershipType: "sponsorship",
      payment: { required: true, status: "paid" },
    };

    render(<ProposalActions proposal={proposal} />);
    expect(screen.getByText("Paid")).toBeDefined();
    expect(screen.queryByText("Pay Now")).toBeNull();
  });

  it("does not show Pay Sponsorship for non-sponsorships", () => {
    const proposal: any = {
      id: "prop-123",
      status: "accepted",
      partnershipType: "business_partnership",
    };

    render(<ProposalActions proposal={proposal} />);
    expect(screen.queryByText("Pay Now")).toBeNull();
  });

  it("shows Retry Payment for failed/cancelled states", () => {
    const proposal: any = {
      id: "prop-123",
      status: "accepted",
      partnershipType: "sponsorship",
      payment: { required: true, status: "failed" },
    };

    render(<ProposalActions proposal={proposal} />);
    expect(screen.getByText("Retry Payment")).toBeDefined();
  });
  
  it("displays checkout error", () => {
    (checkoutHooks.usePartnershipCheckoutMutation as any).mockReturnValue({
      mutate: mockCheckout,
      isPending: false,
      error: { response: { data: { message: "Checkout failed" } } }
    });
    const proposal: any = {
      id: "prop-123",
      status: "accepted",
      partnershipType: "sponsorship",
      payment: { required: true, status: "pending" },
    };

    render(<ProposalActions proposal={proposal} />);
    expect(screen.getByText("Checkout failed")).toBeDefined();
  });
});
