import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/shared/auth/useLogout", () => ({ useLogout: () => vi.fn() }));
vi.mock("@/shared/hooks/useUnreadMessagesCount", () => ({
  useUnreadMessagesCount: () => ({ unreadCount: 0 }),
}));
vi.mock("@/shared/components/layout/CurrencySwitcher", () => ({
  CurrencySwitcher: () => null,
}));
vi.mock("@/shared/components/layout/ThemeSwitcher", () => ({
  ThemeSwitcher: () => null,
}));

import { UserMenuNavLinks } from "@/shared/components/layout/user-menu/UserMenuNavLinks";

/**
 * The Calendar page is gone (api#418): it disagreed with /booking, which
 * already lists every booking. The menu must not lead there.
 */
describe("UserMenuNavLinks: no Calendar", () => {
  afterEach(() => {
    cleanup();
    push.mockClear();
  });

  it("has no Calendar row, and keeps the rows around it", () => {
    render(
      <UserMenuNavLinks
        userId="u1"
        canApply={false}
        syncing={false}
        onSync={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /calendar/i })).toBeNull();
    expect(screen.getByRole("button", { name: "Wishlists" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "QR Check-In Scanner" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Messages" })).toBeInTheDocument();
  });

  it("never navigates to /calendar", () => {
    render(
      <UserMenuNavLinks
        userId="u1"
        canApply={false}
        syncing={false}
        onSync={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    for (const button of screen.getAllByRole("button")) {
      if (!button.hasAttribute("disabled")) fireEvent.click(button);
    }
    expect(push).toHaveBeenCalled();
    expect(push.mock.calls.map(([href]) => href)).not.toContain("/calendar");
  });
});
