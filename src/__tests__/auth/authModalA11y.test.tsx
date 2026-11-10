import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

import AuthModal from "@/features/auth/components/AuthModal";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/** A page with a trigger, like the header's "Sign up" button. */
function Page() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <button
        type="button"
        onClick={() => useAuthStore.getState().openSignup()}
      >
        Sign up
      </button>
      <AuthModal />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  useAuthStore.setState({ isOpen: false, bookingSummary: null });
});

describe("Sign-up popup with a screen reader", () => {
  it("links every label to its field, with autocomplete and required", async () => {
    useAuthStore.getState().openSignup();
    render(<Page />);

    const expected: [string, string][] = [
      ["FULL NAME", "name"],
      ["EMAIL ADDRESS", "email"],
      ["USERNAME", "username"],
      ["PASSWORD", "new-password"],
      ["CONFIRM PASSWORD", "new-password"],
    ];
    for (const [label, autocomplete] of expected) {
      const field = screen.getByLabelText(label);
      expect(field.tagName).toBe("INPUT");
      expect(field).toHaveAttribute("autocomplete", autocomplete);
      expect(field).toHaveAttribute("aria-required", "true");
    }
    // Ids are generated, never the old shared ones.
    expect(document.getElementById("terms")).toBeNull();
  });

  it("is a modal dialog named by its heading", () => {
    useAuthStore.getState().openSignup();
    render(<Page />);
    const dialog = screen.getByRole("dialog", { name: /Join the Hype/ });
    expect(dialog).toBeInTheDocument();
  });

  it("names the show-password toggles and keeps them reachable", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().openSignup();
    render(<Page />);
    const toggles = screen.getAllByRole("button", { name: "Show password" });
    expect(toggles).toHaveLength(2);
    expect(toggles[0]).toHaveAttribute("aria-pressed", "false");
    expect(toggles[0]).not.toHaveAttribute("tabindex", "-1");
    await user.click(toggles[0]);
    expect(toggles[0]).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("PASSWORD")).toHaveAttribute("type", "text");
  });

  it("announces a field error and links it to the field", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().openSignup();
    render(<Page />);
    const email = screen.getByLabelText("EMAIL ADDRESS");
    await user.type(email, "not-an-email");
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    const errorId = email.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    const error = document.getElementById(errorId!);
    expect(error).toHaveAttribute("role", "alert");
    expect(error?.textContent).not.toBe("");
  });

  it("moves focus in on open, closes on Esc, and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const trigger = screen.getByRole("button", { name: "Sign up" });
    trigger.focus();
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(useAuthStore.getState().isOpen).toBe(false);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("moves focus to the new form when switching to log in", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().openSignup();
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Log in" }));
    const email = await screen.findByLabelText("Email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    await waitFor(() => expect(email).toHaveFocus());
    expect(
      screen.getByRole("dialog", { name: /Vibe Check In/ }),
    ).toBeInTheDocument();
  });

  it("leaves no unnamed button in the popup", () => {
    useAuthStore.getState().openSignup();
    render(<Page />);
    act(() => {});
    const unnamed = [...document.querySelectorAll("button")].filter(
      (b) =>
        !b.textContent?.trim() &&
        !b.getAttribute("aria-label") &&
        !b.getAttribute("aria-labelledby"),
    );
    expect(unnamed).toHaveLength(0);
  });
});
