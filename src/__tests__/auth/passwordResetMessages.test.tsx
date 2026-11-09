import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * app#257: the reset request checks the account first. An unknown email stays
 * on the form, and the toast and the screen say the same thing; a known one
 * goes to the code screen, which repeats the toast's "We sent a 6-digit code".
 */

const { requestPasswordReset, toastError, toastSuccess } = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));
vi.mock("@/shared/auth/auth-client", () => ({
  authClient: { emailOtp: { requestPasswordReset } },
}));
vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
  Toaster: () => null,
}));

import AuthModal from "@/features/auth/components/AuthModal";
import MobileAuthPage from "@/features/auth/components/MobileAuthPage";
import { NO_ACCOUNT_MESSAGE } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/shared/auth/useAuthStore";

const NOBODY = "qa-nobody@example.test";
const KNOWN = "fox@example.test";
const SENT = `We sent a 6-digit code to ${KNOWN}.`;

const notFound = () =>
  requestPasswordReset.mockResolvedValue({
    data: null,
    error: { status: 404, message: NO_ACCOUNT_MESSAGE },
  });
const sent = () =>
  requestPasswordReset.mockResolvedValue({ data: { success: true }, error: null });

function withQuery(ui: React.ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
  );
}

/** Text with the email split across elements, as both code screens render it. */
const byText = (text: string) => (_: string, el: Element | null) =>
  el?.tagName === "P" && el.textContent?.replace(/\s+/g, " ").trim() === text;

beforeEach(() => {
  requestPasswordReset.mockReset();
  toastError.mockReset();
  toastSuccess.mockReset();
  useAuthStore.setState({ isOpen: false, bookingSummary: null, pendingEmail: null });
});

describe("Forgot password popup", () => {
  function renderForgot() {
    useAuthStore.setState({ isOpen: true, view: "forgot-password" });
    render(withQuery(<AuthModal />));
  }

  async function send(email: string) {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("EMAIL ADDRESS"), email);
    await user.click(screen.getByRole("button", { name: "Send Reset Code" }));
  }

  it("an unknown email stays on the form, with the toast's text beside the field", async () => {
    notFound();
    renderForgot();
    await send(NOBODY);

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(NO_ACCOUNT_MESSAGE));
    expect(await screen.findByText(NO_ACCOUNT_MESSAGE)).toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send Reset Code" })).toBeInTheDocument();
    expect(screen.queryByText(/We sent a 6-digit code/)).toBeNull();
  });

  it("a known email opens the code screen, which says what the toast said", async () => {
    sent();
    renderForgot();
    await send(KNOWN);

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith(SENT));
    expect(await screen.findByText(byText(SENT))).toBeInTheDocument();
    expect(screen.getByLabelText("RESET CODE")).toBeInTheDocument();
  });
});

describe("Mobile auth page", () => {
  async function openForgot() {
    const user = userEvent.setup();
    render(withQuery(<MobileAuthPage />));
    await user.click(screen.getByRole("button", { name: /Forgot password/ }));
    return user;
  }

  it("an unknown email stays on the form, with the toast's text beside the field", async () => {
    notFound();
    const user = await openForgot();
    await user.type(screen.getByLabelText("Email address"), NOBODY);
    await user.click(screen.getByRole("button", { name: "Send Reset Code" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(NO_ACCOUNT_MESSAGE));
    expect(await screen.findByText(NO_ACCOUNT_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Reset Code" })).toBeInTheDocument();
  });

  it("a known email opens a code screen that says what the toast said", async () => {
    sent();
    const user = await openForgot();
    await user.type(screen.getByLabelText("Email address"), KNOWN);
    await user.click(screen.getByRole("button", { name: "Send Reset Code" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith(SENT));
    expect(await screen.findByText(byText(SENT))).toBeInTheDocument();
    expect(screen.getByLabelText("Reset code")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Password" })).toBeInTheDocument();
  });
});
