import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({ isAuthenticated: true }),
}));

vi.mock("@/features/notifications/hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock("@/shared/components/layout/LandingHeader", () => ({
  default: () => <header data-testid="landing-header" />,
}));

import NotificationListClient from "@/features/notifications/components/NotificationListClient";

/**
 * /notifications used to render its own copy of an old header (Explore /
 * Bookings / Notifications tabs and a bare avatar) instead of the app's
 * default one (#309).
 */
describe("NotificationListClient header", () => {
  it("renders the shared default header, not the old copy", async () => {
    render(<NotificationListClient />);

    expect(await screen.findByTestId("landing-header")).toBeInTheDocument();
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(
      screen.queryByRole("link", { name: "Explore" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Notifications" }),
    ).toBeInTheDocument();
  });
});
