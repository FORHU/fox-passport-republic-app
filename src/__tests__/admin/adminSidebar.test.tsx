import { describe, it, expect, vi, afterEach } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

const logout = vi.hoisted(() => vi.fn(() => Promise.resolve()));
vi.mock("@/shared/auth/useLogout", () => ({ useLogout: () => logout }));

import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { useUIStore } from "@/shared/store/useUIStore";

/**
 * The admin console had no way out but the logo or the address bar: no
 * sign-out and no link back to the site.
 */
describe("AdminSidebar", () => {
  afterEach(() => {
    cleanup();
    logout.mockClear();
  });

  it("links back to the main site", () => {
    render(<AdminSidebar />);
    expect(
      screen.getByRole("link", { name: /back to site/i }).getAttribute("href"),
    ).toBe("/");
  });

  it("logs out through the shared sign-out and closes the drawer", async () => {
    useUIStore.getState().setSidebarOpen(true);
    render(<AdminSidebar />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});
