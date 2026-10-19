import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

import AuthModal from "@/features/auth/components/AuthModal";
import { useAuthStore } from "@/shared/auth/useAuthStore";

const renderModal = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthModal />
    </QueryClientProvider>,
  );

beforeEach(() => {
  useAuthStore.setState({ isOpen: false, bookingSummary: null });
});

/**
 * Reserving while signed out opens the normal Create Account form, with the
 * package beside it. The form itself must be the same one.
 */
describe("AuthModal at booking", () => {
  it("shows the package beside the same Create Account form", () => {
    useAuthStore.getState().openSignupFor({
      title: "Garden Wedding",
      place: "Manila",
      price: 1200,
    });
    renderModal();

    expect(screen.getByText("Your package")).toBeTruthy();
    expect(screen.getByText("Garden Wedding")).toBeTruthy();
    for (const label of [
      "FULL NAME",
      "EMAIL ADDRESS",
      "USERNAME",
      "PASSWORD",
      "CONFIRM PASSWORD",
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: /Sign Up/ })).toBeTruthy();
  });

  it("is the plain modal when there is no package", () => {
    useAuthStore.getState().openSignup();
    renderModal();
    expect(screen.queryByText("Your package")).toBeNull();
    expect(screen.getByText("FULL NAME")).toBeTruthy();
  });
});
