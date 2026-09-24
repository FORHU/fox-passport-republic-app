import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import GoogleAuthCallbackPage from "../page";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  replace: vi.fn(),
  login: vi.fn(),
  completeGoogleAuth: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => ({ get: mocks.get }),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({ login: mocks.login }),
}));

vi.mock("@/shared/auth/session-api", () => ({
  completeGoogleAuth: mocks.completeGoogleAuth,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

describe("GoogleAuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockReturnValue(null);
    mocks.completeGoogleAuth.mockResolvedValue(null);
    localStorage.clear();
  });

  it("redirects home when the exchange code is missing", async () => {
    render(<GoogleAuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.completeGoogleAuth).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalled();
  });

  it("completes an existing-user session and returns home", async () => {
    const user = { id: "user-1", name: "Citizen" };
    mocks.get.mockReturnValue("exchange-1");
    mocks.completeGoogleAuth.mockResolvedValue({ user, isNewUser: false });

    render(<GoogleAuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.completeGoogleAuth).toHaveBeenCalledWith("exchange-1");
    expect(mocks.login).toHaveBeenCalledWith({ user });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Welcome back!");
  });

  it("sends a new Google user to onboarding", async () => {
    const user = { id: "user-2", name: "New Citizen" };
    mocks.get.mockReturnValue("exchange-2");
    mocks.completeGoogleAuth.mockResolvedValue({ user, isNewUser: true });

    render(<GoogleAuthCallbackPage />);

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/onboarding"),
    );
    expect(localStorage.getItem("fp_new_user")).toBe("1");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Welcome!");
  });
});
