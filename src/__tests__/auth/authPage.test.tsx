import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _priority, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/auth",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  Toaster: () => null,
}));
vi.mock("@/shared/components/layout/NotificationBell", () => ({
  default: () => null,
}));
vi.mock("@/shared/components/layout/MobileBottomNav", () => ({
  default: () => null,
}));

import AuthPageClient from "@/app/auth/_components/AuthPageClient";
import AuthModal from "@/features/auth/components/AuthModal";
import { useAuthStore } from "@/shared/auth/useAuthStore";

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );
}

/**
 * QA: the footer's "Sign in" opened /auth as a blank page with one button that
 * opened the popup. The page itself now has the header, a title and the form.
 */
describe("/auth sign-in page", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isOpen: false,
      view: "login",
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("shows the header logo, a title and the login form without a click", () => {
    renderWithQuery(<AuthPageClient />);

    expect(screen.getByAltText("FoxPassport Logo")).toBeInTheDocument();
    // The desktop form's title is the page heading, outside any dialog.
    expect(
      screen.getByRole("heading", { level: 1, name: /Vibe Check In/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Enter the portal/)).toBeInTheDocument();
    expect(screen.getAllByLabelText("Email").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Password").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Log In/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a pending verification in the page's form, not a popup over it", () => {
    useAuthStore.setState({
      isOpen: true,
      view: "verify-email",
      pendingEmail: "fox@example.com",
    });
    renderWithQuery(<AuthPageClient />);

    expect(useAuthStore.getState().isOpen).toBe(false);
    expect(useAuthStore.getState().view).toBe("verify-email");
    // Both layouts: the phone one keeps its own screen and switches too.
    expect(screen.getAllByText(/Verify your/)).toHaveLength(2);
  });

  it("switches both layouts to sign-up when the header's Sign up is used", () => {
    renderWithQuery(<AuthPageClient />);

    act(() => useAuthStore.getState().openSignup());

    expect(useAuthStore.getState().isOpen).toBe(false);
    expect(useAuthStore.getState().view).toBe("signup");
    expect(screen.getByText(/Create your/)).toBeInTheDocument();
    expect(screen.queryByText(/Vibe Check In/)).not.toBeInTheDocument();
  });

  it("keeps the popup's form title as the dialog's name", () => {
    useAuthStore.getState().openLogin();
    renderWithQuery(<AuthModal />);

    expect(
      screen.getByRole("dialog", { name: /Vibe Check In/ }),
    ).toBeInTheDocument();
  });
});
