import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import FacebookAuthCallbackPage from "../page";
import {
  ACCOUNT_NOT_LINKED,
  ACCOUNT_NOT_LINKED_MESSAGE,
} from "@/shared/auth/social-errors";

const mocks = vi.hoisted(() => ({
  params: {} as Record<string, string>,
  replace: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => ({ get: (k: string) => mocks.params[k] ?? null }),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({ login: mocks.login }),
}));

vi.mock("@/shared/auth/session-api", () => ({
  refreshSession: mocks.refreshSession,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

// The failure messages only; the success paths match the Google callback's
// tests.
describe("FacebookAuthCallbackPage errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.params = {};
    mocks.refreshSession.mockResolvedValue(null);
  });

  it("explains account_not_linked instead of showing the raw code", async () => {
    mocks.params = { error: ACCOUNT_NOT_LINKED };

    render(<FacebookAuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.refreshSession).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      ACCOUNT_NOT_LINKED_MESSAGE,
      expect.objectContaining({ duration: expect.any(Number) }),
    );
  });

  it("still explains a missing Facebook email", async () => {
    mocks.params = { error: "email_not_found" };

    render(<FacebookAuthCallbackPage />);

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(
        expect.stringContaining("Facebook didn't share an email address"),
      ),
    );
  });

  it("keeps the code in the message for other errors", async () => {
    mocks.params = { error: "access_denied" };

    render(<FacebookAuthCallbackPage />);

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Facebook sign-in failed (access_denied). Please try again.",
      ),
    );
  });
});
