import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  BookingReplacementStatus,
  EventEditProposal,
} from "@/shared/types/eventEdit";

/** app#318: the citizen answers the host's swap or new date on web. */

const h = vi.hoisted(() => ({
  replacement: vi.fn(),
  proposals: vi.fn(),
  accept: vi.fn(),
  confirm: vi.fn(),
  decline: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  paid: null as null | (() => void),
}));

vi.mock("@/features/booking/api/eventProposals", () => ({
  fetchBookingReplacement: h.replacement,
  fetchBookingProposals: h.proposals,
  acceptProposal: h.accept,
  confirmProposalPayment: h.confirm,
  declineProposal: h.decline,
}));
vi.mock("sonner", () => ({
  toast: { success: h.toastSuccess, error: h.toastError },
}));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: () => Promise.resolve(null) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("../StripePaymentForm", () => ({
  default: ({
    totalAmount,
    onSuccess,
  }: {
    totalAmount: number;
    onSuccess: () => void;
  }) => (
    <button type="button" onClick={onSuccess}>
      Pay form {totalAmount}
    </button>
  ),
}));

import EventProposalCard from "../EventProposalCard";

const FUTURE = "2099-01-01T10:00:00.000Z";

const status = (
  over: Partial<BookingReplacementStatus> = {},
): BookingReplacementStatus => ({
  items: [],
  replaceBy: null,
  fullRefund: false,
  awaitingConfirmation: 0,
  unpaid: true,
  totalAmount: 5000,
  ...over,
});

const swap = (over: Partial<EventEditProposal> = {}): EventEditProposal => ({
  id: "p1",
  eventId: "e1",
  bookingId: "b1",
  type: "swap",
  status: "pending",
  kind: "asset",
  itemName: "Bigger speakers",
  replacesName: "Sound system",
  currentPrice: 1000,
  proposedPrice: 1200,
  priceDelta: 200,
  note: "Louder",
  expiresAt: FUTURE,
  awaitingPayment: false,
  proposedStartAt: null,
  proposedEndAt: null,
  previousStartAt: null,
  previousEndAt: null,
  ...over,
});

function renderCard(props: Partial<Parameters<typeof EventProposalCard>[0]> = {}) {
  const onCancel = vi.fn();
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <EventProposalCard
        bookingId="b1"
        isCitizen
        canCancel
        onCancel={onCancel}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onCancel };
}

beforeEach(() => {
  vi.clearAllMocks();
  h.replacement.mockResolvedValue(status());
  h.proposals.mockResolvedValue([]);
});

describe("EventProposalCard", () => {
  it("renders nothing when nothing needs an answer", async () => {
    renderCard();
    await waitFor(() => expect(h.proposals).toHaveBeenCalled());
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByText(/Your host proposes/)).toBeNull();
  });

  it("shows a swap with its price change, and accepts it", async () => {
    h.proposals.mockResolvedValue([swap()]);
    h.accept.mockResolvedValue({ proposalId: "p1" });
    renderCard();

    expect(await screen.findByText("Your host proposes a change")).toBeInTheDocument();
    expect(screen.getByText(/Sound system/)).toBeInTheDocument();
    expect(screen.getByText(/Your total goes up by/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Accept" }));

    await waitFor(() => expect(h.accept).toHaveBeenCalledWith("p1"));
    expect(h.toastSuccess).toHaveBeenCalledWith(
      "Accepted. The new Supplier will confirm.",
    );
  });

  it("shows a new date with an unchanged total", async () => {
    h.proposals.mockResolvedValue([
      swap({
        type: "reschedule",
        kind: null,
        itemName: "",
        replacesName: "",
        priceDelta: 0,
        previousStartAt: "2026-12-05T10:00:00.000Z",
        proposedStartAt: "2026-12-12T10:00:00.000Z",
      }),
    ]);
    h.accept.mockResolvedValue({ proposalId: "p1" });
    renderCard();

    expect(
      await screen.findByText("Your host proposes a new date"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Move your event from/)).toBeInTheDocument();
    expect(screen.getByText("Your total stays the same.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() =>
      expect(h.toastSuccess).toHaveBeenCalledWith(
        "Accepted. Your booking moved to the new date.",
      ),
    );
  });

  it("takes the difference on a paid booking, then confirms it", async () => {
    h.replacement.mockResolvedValue(status({ unpaid: false }));
    h.proposals.mockResolvedValue([swap()]);
    h.accept.mockResolvedValue({
      proposalId: "p1",
      paymentRequired: true,
      amount: 200,
      clientSecret: "cs_1",
      paid: false,
    });
    h.confirm.mockResolvedValue(undefined);
    renderCard();

    await userEvent.click(
      await screen.findByRole("button", { name: /Accept and pay/ }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Pay form 200" }));

    await waitFor(() => expect(h.confirm).toHaveBeenCalledWith("p1"));
    expect(h.toastSuccess).toHaveBeenCalledWith(
      "Accepted. The change is applied.",
    );
  });

  it("says why when the price changed since", async () => {
    h.proposals.mockResolvedValue([swap()]);
    h.accept.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message:
            "The price changed since this was proposed. Ask your host to propose it again.",
          code: "PROPOSAL_PRICE_CHANGED",
        },
      },
    });
    renderCard();

    await userEvent.click(await screen.findByRole("button", { name: "Accept" }));

    await waitFor(() =>
      expect(h.toastError).toHaveBeenCalledWith(
        "The price changed since this was proposed. Ask your host to propose it again.",
      ),
    );
    // Read again: the proposal has ended.
    await waitFor(() => expect(h.proposals.mock.calls.length).toBeGreaterThan(1));
  });

  it("declines after asking", async () => {
    h.proposals.mockResolvedValue([swap()]);
    h.decline.mockResolvedValue(undefined);
    renderCard();

    await userEvent.click(await screen.findByRole("button", { name: "Decline" }));
    // The confirm dialog's own Decline.
    const buttons = await screen.findAllByRole("button", { name: "Decline" });
    await userEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => expect(h.decline).toHaveBeenCalledWith("p1"));
  });

  it("offers the full-refund cancel once the deadline passed", async () => {
    h.replacement.mockResolvedValue(
      status({
        items: [
          {
            kind: "asset",
            itemName: "Sound system",
            reason: "declined",
            replaceBy: "2026-01-01T00:00:00.000Z",
            pendingProposalId: null,
          },
        ],
        fullRefund: true,
      }),
    );
    const { onCancel } = renderCard();

    expect(
      await screen.findByText(/didn't find a replacement in time/),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Cancel for a full refund" }),
    );
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows the host the proposal without the buttons", async () => {
    h.proposals.mockResolvedValue([swap()]);
    renderCard({ isCitizen: false });

    expect(
      await screen.findByText("Waiting for the citizen to answer."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  });
});
