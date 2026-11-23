import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * app#361: New Password and Confirm New Password on the reset code screen each
 * have their own show/hide toggle, and one doesn't change the other.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/shared/auth/auth-client", () => ({
  authClient: { emailOtp: { requestPasswordReset: vi.fn(), resetPassword: vi.fn() } },
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  Toaster: () => null,
}));

import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { useAuthStore } from "@/shared/auth/useAuthStore";

beforeEach(() => {
  useAuthStore.setState({ pendingEmail: "fox@example.test" });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ResetPasswordForm />
    </QueryClientProvider>,
  );
});

describe("Reset password show/hide toggles", () => {
  it("each toggle shows and hides only its own field", async () => {
    const user = userEvent.setup();
    const newPw = screen.getByLabelText(/^new password/i);
    const confirmPw = screen.getByLabelText(/confirm new password/i);
    const [newToggle, confirmToggle] = screen.getAllByRole("button", { name: "Show password" });

    expect(newPw).toHaveAttribute("type", "password");
    expect(confirmPw).toHaveAttribute("type", "password");

    await user.click(newToggle);
    expect(newPw).toHaveAttribute("type", "text");
    expect(newToggle).toHaveAttribute("aria-pressed", "true");
    expect(confirmPw).toHaveAttribute("type", "password");

    await user.click(confirmToggle);
    expect(confirmPw).toHaveAttribute("type", "text");

    await user.click(newToggle);
    expect(newPw).toHaveAttribute("type", "password");
    expect(confirmPw).toHaveAttribute("type", "text");
  });
});
