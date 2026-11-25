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

describe("ConfirmDialog secondary action", () => {
  function SecondaryHarness({
    onConfirm,
    onSecondary,
  }: {
    onConfirm: () => void | Promise<void>;
    onSecondary: () => void | Promise<void>;
  }) {
    const [open, setOpen] = useState(true);
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
        title="Decline this booking?"
        confirmLabel="Decline this booking"
        tone="danger"
        secondaryAction={{ label: "I'm busy then", onConfirm: onSecondary }}
      />
    );
  }

  it("runs only the secondary answer and closes", async () => {
    const onConfirm = vi.fn();
    const onSecondary = vi.fn(async () => {});
    render(<SecondaryHarness onConfirm={onConfirm} onSecondary={onSecondary} />);
    await userEvent.click(screen.getByRole("button", { name: "I'm busy then" }));
    expect(onSecondary).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("stays open when the secondary answer rejects", async () => {
    render(
      <SecondaryHarness
        onConfirm={vi.fn()}
        onSecondary={vi.fn(async () => {
          throw new Error("no");
        })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "I'm busy then" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("is not shown unless asked for", () => {
    render(<Harness onConfirm={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
