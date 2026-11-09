import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const { signUpEmail, toastError } = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));
vi.mock("@/shared/auth/auth-client", () => ({
  authClient: { signUp: { email: signUpEmail } },
}));
vi.mock("sonner", () => ({
  toast: { error: toastError, success: vi.fn() },
  Toaster: () => null,
}));
// The real charter must be scrolled to the end of both documents; that gate
// has its own behaviour, so here one click reads and accepts it.
vi.mock("@/features/auth/components/TermsPrivacyModal", () => ({
  TermsPrivacyModal: (p: {
    onAccept: () => void;
    onBothRead?: () => void;
    onClose: () => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        p.onBothRead?.();
        p.onAccept();
        p.onClose();
      }}
    >
      Accept charter
    </button>
  ),
}));

import AuthModal from "@/features/auth/components/AuthModal";
import MobileAuthPage from "@/features/auth/components/MobileAuthPage";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { PASSWORD_MIN } from "@/shared/lib/passwordPolicy";

const HINT = `Minimum ${PASSWORD_MIN} characters`;
const PW = "Valid-Passw0rd!x";
const REQUIRED_MESSAGES = [
  "Full name is required",
  "Email is required",
  "Username is required",
  "Password is required",
  "Confirm your password",
];
const TERMS_MESSAGE = "You must accept the Terms and Privacy Policy";

function withQuery(ui: React.ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
  );
}

function renderPopup() {
  useAuthStore.getState().openSignup();
  render(withQuery(<AuthModal />));
}

async function acceptTerms(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("checkbox"));
  await user.click(await screen.findByRole("button", { name: "Accept charter" }));
  await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
}

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Sign Up" }));

/** Every alert's text, by the id the field points at, for each invalid field. */
function describedAlerts() {
  return [...document.querySelectorAll('[aria-invalid="true"]')].map((el) => {
    const ids = (el.getAttribute("aria-describedby") ?? "").split(" ");
    return ids
      .map((id) => document.getElementById(id))
      .filter((n) => n?.getAttribute("role") === "alert")
      .map((n) => n!.textContent);
  });
}

beforeEach(() => {
  signUpEmail.mockReset();
  toastError.mockReset();
  useAuthStore.setState({ isOpen: false, bookingSummary: null });
});

describe("Sign-up popup validation", () => {
  it("shows the password rules before submit, linked to the field", () => {
    renderPopup();
    const password = screen.getByLabelText("PASSWORD");
    expect(screen.getByText(new RegExp(HINT))).toBeVisible();
    expect(password).toHaveAccessibleDescription(
      expect.stringContaining(HINT),
    );
  });

  it("names every empty field on submit, focuses the first, and toasts once", async () => {
    const user = userEvent.setup();
    renderPopup();
    await acceptTerms(user);
    await submit(user);

    for (const message of REQUIRED_MESSAGES) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.queryByText(TERMS_MESSAGE)).toBeNull();
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith(
      "Please fix the highlighted fields",
      expect.anything(),
    );
    await waitFor(() => expect(screen.getByLabelText("FULL NAME")).toHaveFocus());
    // The hint stays next to the error, and both describe the field.
    const password = screen.getByLabelText("PASSWORD");
    expect(password).toHaveAccessibleDescription(
      expect.stringMatching(new RegExp(`${HINT}.*Password is required`)),
    );
  });

  it("shows every field error and the terms error when terms are unticked", async () => {
    const user = userEvent.setup();
    renderPopup();
    const form = screen.getByRole("checkbox").closest("form")!;
    // No native check can cancel the submit before zod runs.
    expect(form.noValidate).toBe(true);
    // aria-required stays for screen readers; the native attribute is gone.
    expect(screen.getByRole("checkbox")).not.toHaveAttribute("required");
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-required", "true");

    await submit(user);

    for (const message of [...REQUIRED_MESSAGES, TERMS_MESSAGE]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAccessibleDescription(TERMS_MESSAGE);
    // Six invalid controls, each linked to its role="alert" message.
    const alerts = describedAlerts();
    expect(alerts).toHaveLength(6);
    for (const linked of alerts) expect(linked).toHaveLength(1);
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("says a malformed email needs to be valid", async () => {
    const user = userEvent.setup();
    renderPopup();
    await user.type(screen.getByLabelText("EMAIL ADDRESS"), "not-an-email");
    expect(
      await screen.findByText("Enter a valid email address"),
    ).toBeInTheDocument();
  });

  it("says when the passwords do not match, even with other fields empty", async () => {
    const user = userEvent.setup();
    renderPopup();
    await user.type(screen.getByLabelText("PASSWORD"), PW);
    await user.type(screen.getByLabelText("CONFIRM PASSWORD"), `${PW}-other`);
    await submit(user);
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("submits a fully valid form", async () => {
    signUpEmail.mockResolvedValue({ data: { user: {} }, error: null });
    const user = userEvent.setup();
    renderPopup();
    await user.type(screen.getByLabelText("FULL NAME"), "Fox Mulder");
    await user.type(screen.getByLabelText("EMAIL ADDRESS"), "fox@example.com");
    await user.type(screen.getByLabelText("USERNAME"), "fox_mulder");
    await user.type(screen.getByLabelText("PASSWORD"), PW);
    await user.type(screen.getByLabelText("CONFIRM PASSWORD"), PW);
    await acceptTerms(user);
    await submit(user);

    await waitFor(() =>
      expect(signUpEmail).toHaveBeenCalledWith({
        email: "fox@example.com",
        password: PW,
        name: "Fox Mulder",
      }),
    );
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe("/auth mobile sign-up validation", () => {
  async function openMobileSignup(user: ReturnType<typeof userEvent.setup>) {
    render(withQuery(<MobileAuthPage />));
    await user.click(screen.getByRole("button", { name: "Create an account" }));
  }

  it("shows the hint, then every error including confirm and terms", async () => {
    const user = userEvent.setup();
    await openMobileSignup(user);
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      expect.stringContaining(HINT),
    );

    await submit(user);

    for (const message of [...REQUIRED_MESSAGES, TERMS_MESSAGE]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.getByText(new RegExp(HINT))).toBeVisible();
    expect(toastError).toHaveBeenCalledWith(
      "Please fix the highlighted fields",
      expect.anything(),
    );
  });

  it("submits a fully valid form (it used to fail on a missing confirm field)", async () => {
    signUpEmail.mockResolvedValue({ data: { user: {} }, error: null });
    const user = userEvent.setup();
    await openMobileSignup(user);
    await user.type(screen.getByLabelText("Full Name"), "Fox Mulder");
    await user.type(screen.getByLabelText("Email Address"), "fox@example.com");
    await user.type(screen.getByLabelText("Username"), "fox_mulder");
    await user.type(screen.getByLabelText("Password"), PW);
    await user.type(screen.getByLabelText("Confirm Password"), PW);
    await acceptTerms(user);
    await submit(user);

    await waitFor(() =>
      expect(signUpEmail).toHaveBeenCalledWith({
        email: "fox@example.com",
        password: PW,
        name: "Fox Mulder",
      }),
    );
  });
});
