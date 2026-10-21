import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import GoogleAuthCallbackPage from "../page";

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

// Better Auth sets the session cookie before redirecting here; the page only
// loads who that is and decides where to go.
describe("GoogleAuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.params = {};
    mocks.refreshSession.mockResolvedValue(null);
    localStorage.clear();
  });

  it("redirects home when Better Auth reports an error", async () => {
    mocks.params = { error: "access_denied" };

    render(<GoogleAuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.refreshSession).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalled();
  });

  it("redirects home when no session came back", async () => {
    render(<GoogleAuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalled();
  });

  it("enters the app as an existing user", async () => {
    const user = { id: "user-1", name: "Citizen" };
    mocks.refreshSession.mockResolvedValue(user);

    render(<GoogleAuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/search"));
    expect(mocks.login).toHaveBeenCalledWith({ user });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Welcome back!");
  });

  it("sends a new Google user to onboarding", async () => {
    const user = { id: "user-2", name: "New Citizen" };
    mocks.params = { new: "1" };
    mocks.refreshSession.mockResolvedValue(user);

    render(<GoogleAuthCallbackPage />);

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/onboarding"),
    );
    expect(localStorage.getItem("fp_new_user")).toBe("1");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Welcome!");
  });
});
