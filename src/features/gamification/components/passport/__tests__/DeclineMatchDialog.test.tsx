import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeclineMatchDialog } from "../DeclineMatchDialog";
import type { MatchDeclineReason } from "@/features/gamification/lib/matchDeclineReasons";

function Harness({
  onDecline,
}: {
  onDecline: (reason: MatchDeclineReason, note: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <DeclineMatchDialog open={open} onOpenChange={setOpen} onDecline={onDecline} />
  );
}

const declineButton = () =>
  screen.getByRole("button", { name: "Decline request" });

describe("DeclineMatchDialog", () => {
  it("can't send until a reason is picked", async () => {
    render(<Harness onDecline={vi.fn(async () => {})} />);
    expect(declineButton()).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Price too low"));
    expect(declineButton()).toBeEnabled();
  });

  it("needs a note for Other", async () => {
    render(<Harness onDecline={vi.fn(async () => {})} />);
    await userEvent.click(screen.getByLabelText("Other"));
    expect(declineButton()).toBeDisabled();
    expect(screen.getByText("Add a note for Other.")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox"), "   ");
    expect(declineButton()).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox"), "Booked elsewhere");
    expect(declineButton()).toBeEnabled();
  });

  it("sends the reason and trimmed note, then closes", async () => {
    const onDecline = vi.fn(async () => {});
    render(<Harness onDecline={onDecline} />);
    await userEvent.click(screen.getByLabelText("Too far from where I work"));
    await userEvent.type(screen.getByRole("textbox"), "  2 hours away  ");
    await userEvent.click(declineButton());
    expect(onDecline).toHaveBeenCalledWith("too_far", "2 hours away");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("stays open and shows the API message when sending fails", async () => {
    const onDecline = vi.fn(async () => {
      throw { response: { data: { message: "This invite was already answered" } } };
    });
    render(<Harness onDecline={onDecline} />);
    await userEvent.click(screen.getByLabelText("Not available on that day"));
    await userEvent.click(declineButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This invite was already answered",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(declineButton()).toBeEnabled();
  });
});
