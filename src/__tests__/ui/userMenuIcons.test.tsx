import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _priority, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/creator-dashboard",
}));
vi.mock("@/shared/auth/session-api", () => ({
  refreshSession: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/shared/hooks/useUnreadMessagesCount", () => ({
  useUnreadMessagesCount: () => ({ unreadCount: 0 }),
}));
// The real switchers render, so their rows' icons are checked too.
vi.mock("@/shared/providers/CurrencyProvider", () => ({
  useCurrency: () => ({ currency: "PHP", setCurrency: vi.fn() }),
}));

import { useAuthStore } from "@/shared/auth/useAuthStore";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

/** The menu with the most rows: an admin who holds every dashboard, on a
 * header that adds the "Go to" app nav. */
const openFullMenu = () => {
  useAuthStore.getState().login({
    user: {
      id: "u1",
      email: "u@example.com",
      name: "U",
      roleType: ["investor", "venueFoxer", "eventFoxer"],
      permissions: ["admin:access", "venue:manage", "template:manage"],
    } as never,
  });
  const { container } = render(<UserMenuButton showAppNav />, { wrapper });
  fireEvent.click(screen.getByRole("button", { name: "User menu" }));
  return container;
};

/** A row's icon: the lucide-* class on its svg, or a Material Symbols name. */
const iconOf = (row: Element): string => {
  const material = row.querySelector(".material-symbols-outlined");
  if (material) return `material:${material.textContent}`;
  const svg = row.querySelector("svg");
  const lucide = Array.from(svg?.classList ?? []).find(
    (c) => c.startsWith("lucide-") && c !== "lucide-icon",
  );
  return lucide ?? "none";
};

const MATERIAL_TO_LUCIDE: Record<string, string> = {
  // Same picture in both icon sets; counted as one.
  "material:person": "lucide-user",
  "material:group": "lucide-users",
  "material:confirmation_number": "lucide-ticket",
};

describe("the user menu's icons (#305, #311)", () => {
  afterEach(cleanup);

  it("gives every row its own icon", () => {
    const container = openFullMenu();
    // Menu rows are full-width buttons; the profile header's role badges and
    // the theme radios are not rows.
    const rows = Array.from(container.querySelectorAll("button.w-full"));
    expect(rows.length).toBeGreaterThan(10);

    const byIcon = new Map<string, string[]>();
    for (const row of rows) {
      const raw = iconOf(row);
      const icon = MATERIAL_TO_LUCIDE[raw] ?? raw;
      expect(icon, `"${row.textContent}" has no icon`).not.toBe("none");
      byIcon.set(icon, [...(byIcon.get(icon) ?? []), row.textContent ?? ""]);
    }
    const shared = Array.from(byIcon).filter(([, labels]) => labels.length > 1);
    expect(shared).toEqual([]);
  });

  it("lists Bookings once, in Go to, without My Bookings", () => {
    openFullMenu();
    expect(screen.queryByText("My Bookings")).toBeNull();
    const goTo = screen.getByRole("group", { name: "Go to" });
    expect(within(goTo).getByText("Bookings")).toBeInTheDocument();
  });

  it("keeps Trips disabled with the Soon look", () => {
    openFullMenu();
    const trips = screen.getByRole("button", { name: /Trips/ });
    expect(trips).toBeDisabled();
    expect(trips.querySelector("svg")).toHaveClass(
      "lucide-luggage",
      "w-4",
      "h-4",
    );
  });
});
