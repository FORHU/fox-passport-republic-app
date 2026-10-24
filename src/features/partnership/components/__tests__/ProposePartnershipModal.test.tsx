import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProposePartnershipModal from "../ProposePartnershipModal";
import * as partnershipHooks from "@/features/partnership/hooks/usePartnerships";
import { CREATE_PROPOSAL_FALLBACK } from "@/features/partnership/utils/proposalErrorMessage";

// Only the mutation is faked; the error-message helper is the real one.
vi.mock(
  "@/features/partnership/hooks/usePartnerships",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/partnership/hooks/usePartnerships")
      >();
    return { ...actual, useCreatePartnershipProposal: vi.fn() };
  },
);

const VENUE_ID = "venue-1";

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText("e.g. Stage Sponsorship"), {
    target: { value: "Stage Sponsorship" },
  });
  fireEvent.change(screen.getByPlaceholderText("0.00"), {
    target: { value: "50000" },
  });
  fireEvent.change(screen.getByPlaceholderText("Describe your proposal..."), {
    target: { value: "Fund the main stage build." },
  });
  fireEvent.change(
    screen.getByPlaceholderText("What benefits do you expect or offer?"),
    { target: { value: "  Logo on the stage backdrop  " } },
  );
}

describe("ProposePartnershipModal", () => {
  const mutateAsync = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (partnershipHooks.useCreatePartnershipProposal as any).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
  });

  it("sends benefits as plain text and closes on success", async () => {
    mutateAsync.mockResolvedValue({ id: "p1" });
    render(
      <ProposePartnershipModal
        targetVenueId={VENUE_ID}
        targetName="Example venue"
        onClose={onClose}
      />,
    );

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit Proposal" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync.mock.calls[0][0]).toMatchObject({
      targetVenueId: VENUE_ID,
      partnershipType: "investment",
      title: "Stage Sponsorship",
      proposedAmount: 50000,
      proposedBenefits: "Logo on the stage backdrop",
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("sends the database's value for the type the person picks", async () => {
    mutateAsync.mockResolvedValue({ id: "p2" });
    render(
      <ProposePartnershipModal
        targetVenueId={VENUE_ID}
        targetName="Example venue"
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Investment/ }));
    fireEvent.click(
      screen.getByRole("option", { name: "Resource Contribution" }),
    );
    fireEvent.change(screen.getByPlaceholderText("e.g. Stage Sponsorship"), {
      target: { value: "Lighting rig" },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe your proposal..."), {
      target: { value: "Lend our rig for the season." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit Proposal" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync.mock.calls[0][0].partnershipType).toBe(
      "resource_contribution",
    );
    // An empty benefits box sends nothing, never an object.
    expect(mutateAsync.mock.calls[0][0].proposedBenefits).toBeUndefined();
  });

  it("stops an amount the API can't store before sending", async () => {
    render(
      <ProposePartnershipModal
        targetVenueId={VENUE_ID}
        targetName="Example venue"
        onClose={onClose}
      />,
    );

    fillForm();
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "99999999999" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit Proposal" }));

    expect(
      await screen.findByText(
        "The amount can't be more than 9,999,999,999.99.",
      ),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("keeps the form open with the API's message when it is turned down", async () => {
    mutateAsync.mockRejectedValue({
      response: { status: 400, data: { message: "Describe your proposal." } },
    });
    render(
      <ProposePartnershipModal
        targetVenueId={VENUE_ID}
        targetName="Example venue"
        onClose={onClose}
      />,
    );

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit Proposal" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Describe your proposal.",
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("e.g. Stage Sponsorship")).toHaveValue(
      "Stage Sponsorship",
    );
  });

  it("never shows a server error's own text", async () => {
    mutateAsync.mockRejectedValue({
      response: {
        status: 500,
        data: { message: "Invalid `prisma.partnershipProposal.create()`" },
      },
    });
    render(
      <ProposePartnershipModal
        targetVenueId={VENUE_ID}
        targetName="Example venue"
        onClose={onClose}
      />,
    );

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit Proposal" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(CREATE_PROPOSAL_FALLBACK);
    expect(alert).not.toHaveTextContent(/prisma/i);
  });
});
