import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { BookedEventDetail } from "@/shared/types/eventEdit";

/** app#318: the host sees which Supplier to replace and proposes a fix. */

const h = vi.hoisted(() => ({
  replacements: vi.fn(),
  propose: vi.fn(),
  withdraw: vi.fn(),
  proposals: vi.fn(),
  decline: vi.fn(),
  preview: vi.fn(),
  reschedule: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/features/event/api/bookedEvents", () => ({
  fetchNeedsAttention: vi.fn(),
  fetchBookedEvent: vi.fn(),
  fetchReplacements: h.replacements,
  proposeReplacement: h.propose,
  withdrawProposal: h.withdraw,
  fetchProposals: h.proposals,
  hostDeclineBooking: h.decline,
  previewReschedule: h.preview,
  proposeReschedule: h.reschedule,
}));
vi.mock("sonner", () => ({
  toast: { success: h.toastSuccess, error: h.toastError },
}));

import { BookedSuppliersPanel } from "../BookedSuppliersPanel";
import { localToIso } from "../RescheduleDialog";

const FUTURE = "2099-01-01T10:00:00.000Z";

const detail = (over: Partial<BookedEventDetail> = {}): BookedEventDetail => ({
  eventId: "e1",
  eventName: "Garden wedding",
  startAt: FUTURE,
  endAt: FUTURE,
  eventStatus: "confirmed",
  declinableBookingId: null,
  editableBookingId: "b1",
  clientId: "citizen1",
  pendingReschedule: null,
  suppliers: [
    {
      kind: "venue",
      transactionId: "tx-hall",
      supplierName: "Mayor May",
      itemName: "Grand Hall",
      status: "approved",
      reason: null,
      cause: null,
      pendingProposalId: null,
      replaceBy: null,
    },
    {
      kind: "asset",
      transactionId: "tx-sound",
      supplierName: "Ana Audio",
      itemName: "Sound system",
      status: "rejected",
      reason: "declined",
      cause: "busy",
      pendingProposalId: null,
      replaceBy: FUTURE,
    },
  ],
  ...over,
});

function renderPanel(d: BookedEventDetail) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <BookedSuppliersPanel
        detail={d}
        actions={<button type="button">Open event chat</button>}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  h.proposals.mockResolvedValue([]);
});

describe("BookedSuppliersPanel", () => {
  it("marks the Supplier to replace, with why and by when", () => {
    renderPanel(detail());

    expect(screen.getByText("This event needs a replacement")).toBeInTheDocument();
    const sound = screen.getByTestId("booked-row-tx-sound");
    expect(within(sound).getByText("Busy with another booking")).toBeInTheDocument();
    expect(within(sound).getByText(/Replace by/)).toBeInTheDocument();
    expect(
      within(sound).getByRole("button", { name: "Find a replacement" }),
    ).toBeInTheDocument();
    const hall = screen.getByTestId("booked-row-tx-hall");
    expect(within(hall).queryByRole("button")).toBeNull();
    expect(screen.getByRole("button", { name: "Change date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open event chat" })).toBeInTheDocument();
  });

  it("proposes a replacement and shows the new total", async () => {
    h.replacements.mockResolvedValue([
      {
        itemId: "asset-new",
        name: "Bigger speakers",
        supplierName: "Bea Beats",
        price: 1200,
        partner: true,
      },
    ]);
    h.propose.mockResolvedValue({
      id: "p1",
      proposedPrice: 6200,
      priceDelta: 200,
    });
    renderPanel(detail());

    await userEvent.click(screen.getByRole("button", { name: "Find a replacement" }));
    await userEvent.click(await screen.findByLabelText(/Bigger speakers/));
    expect(screen.getByText("Partner")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Note to the citizen/), "Louder");
    await userEvent.click(screen.getByRole("button", { name: "Propose" }));

    await waitFor(() =>
      expect(h.propose).toHaveBeenCalledWith("tx-sound", {
        kind: "asset",
        itemId: "asset-new",
        note: "Louder",
      }),
    );
    expect(h.toastSuccess.mock.calls[0][0]).toMatch(
      /Sent\. The citizen will answer\. The total goes up by .*200.*6,200/,
    );
  });

  it("withdraws a replacement waiting for the citizen", async () => {
    h.withdraw.mockResolvedValue(undefined);
    const d = detail();
    d.suppliers[1].pendingProposalId = "p1";
    h.proposals.mockResolvedValue([
      { id: "p1", itemName: "Bigger speakers", proposedPrice: 6200 },
    ]);
    renderPanel(d);

    expect(
      await screen.findByText(/waiting for the citizen: Bigger speakers/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Find a replacement" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    await waitFor(() => expect(h.withdraw).toHaveBeenCalledWith("p1"));
  });

  it("shows a pending date change instead of Change date", () => {
    renderPanel(
      detail({
        pendingReschedule: {
          proposalId: "r1",
          proposedStartAt: FUTURE,
          proposedEndAt: FUTURE,
          expiresAt: FUTURE,
        },
      }),
    );

    expect(screen.getByText(/New date proposed/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change date" })).toBeNull();
  });

  it("lets the host decline an unpaid booking as busy", async () => {
    h.decline.mockResolvedValue(undefined);
    renderPanel(detail({ declinableBookingId: "b1" }));

    await userEvent.click(
      screen.getByRole("button", { name: "I can't run this event" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "I'm busy then" }));

    await waitFor(() => expect(h.decline).toHaveBeenCalledWith("b1", "busy"));
  });

  it("offers nothing to edit on a booking that can't change", () => {
    renderPanel(detail({ editableBookingId: null }));

    expect(screen.queryByRole("button", { name: "Find a replacement" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Change date" })).toBeNull();
  });
});

describe("localToIso", () => {
  it("reads the picker's local time as an instant", () => {
    expect(localToIso("2026-12-12T09:00")).toBe(
      new Date(2026, 11, 12, 9, 0).toISOString(),
    );
    expect(localToIso("")).toBeNull();
    expect(localToIso("nonsense")).toBeNull();
  });
});
