import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { UserMenuRoleSection } from "@/shared/components/layout/user-menu/UserMenuRoleSection";
import { ROLE_DEFS } from "@/shared/components/layout/user-menu/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/creator-dashboard",
}));

/**
 * Investors had no way into the creator dashboard from the menu: Creator
 * Dashboard is for supply-side roles only. "Investor Dashboard" opens its
 * overview.
 */
describe("UserMenuRoleSection for investors", () => {
  it("gives an investor a way into the creator dashboard overview", () => {
    const onSelectRole = vi.fn();
    const investorOnly = (def: (typeof ROLE_DEFS)[number]) =>
      def.key === "foxers" || def.roleTypes.includes("investor");
    render(
      <UserMenuRoleSection
        isAdmin={false}
        roleTypes={["investor"]}
        hasRoleAccess={investorOnly}
        onSelectRole={onSelectRole}
        onSelectAdmin={vi.fn()}
      />,
    );
    expect(screen.queryByText("Creator Dashboard")).toBeNull();
    const investor = screen.getByRole("button", { name: /Investor Dashboard/ });
    expect(investor).toHaveAttribute("aria-current", "page");
    fireEvent.click(investor);
    expect(onSelectRole.mock.calls[0][0].href).toBe("/creator-dashboard");
  });
});
