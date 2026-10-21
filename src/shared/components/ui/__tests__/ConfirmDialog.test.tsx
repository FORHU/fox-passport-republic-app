import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog, useConfirm } from "../ConfirmDialog";

function Harness({ onConfirm }: { onConfirm: () => void | Promise<void> }) {
  const [open, setOpen] = useState(true);
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={onConfirm}
      title="Delete this?"
      description="This can't be undone."
      confirmLabel="Delete"
      tone="danger"
    />
  );
}

describe("ConfirmDialog", () => {
  it("focuses Cancel first so Enter can't confirm by accident", async () => {
    render(<Harness onConfirm={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
  });

  it("closes after the action resolves", async () => {
    const onConfirm = vi.fn(async () => {});
    render(<Harness onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("stays open when the action rejects", async () => {
    const onConfirm = vi.fn(async () => {
      throw new Error("nope");
    });
    render(<Harness onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled(),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

function HookHarness({ onResult }: { onResult: (ok: boolean) => void }) {
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <button
        onClick={async () => onResult(await confirm({ title: "Log out?" }))}
      >
        Ask
      </button>
      {dialog}
    </>
  );
}

describe("useConfirm", () => {
  it("resolves true on confirm", async () => {
    const onResult = vi.fn();
    render(<HookHarness onResult={onResult} />);
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(onResult).toHaveBeenCalledOnce();
  });

  it("resolves false on cancel", async () => {
    const onResult = vi.fn();
    render(<HookHarness onResult={onResult} />);
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });
});
