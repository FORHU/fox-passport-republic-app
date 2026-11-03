import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { UserMenuRoleSection } from "@/shared/components/layout/user-menu/UserMenuRoleSection";
import { ROLE_DEFS } from "@/shared/components/layout/user-menu/types";
import type { User } from "@/shared/auth/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/creator-dashboard",
}));

function renderFor(user: Partial<User>) {
  const onSelectRole = vi.fn();
  const full = { id: "u1", systemRole: "user", ...user } as User;
  render(
    <UserMenuRoleSection
      isAdmin={(full.permissions ?? []).includes("admin:access")}
      roleTypes={full.roleType ?? []}
      hasRoleAccess={(def) => def.canOpen(full)}
      onSelectRole={onSelectRole}
      onSelectAdmin={vi.fn()}
    />,
  );
  return { onSelectRole };
}

/**
 * The creator dashboard is one entry, named for whoever holds it, and offered
 * only to people `requireHost` lets in — the same rule, so the menu never
 * leads to a page that bounces.
 */
describe("UserMenuRoleSection: the creator dashboard entry", () => {
  afterEach(cleanup);

  it("names it Investor Dashboard for an investor-only user, and opens the overview", () => {
    const { onSelectRole } = renderFor({ roleType: ["investor"] });
    expect(screen.queryByText("Creator Dashboard")).toBeNull();
    const investor = screen.getByRole("button", { name: /Investor Dashboard/ });
    expect(investor).toHaveAttribute("aria-current", "page");
    fireEvent.click(investor);
    expect(onSelectRole.mock.calls[0][0].href).toBe("/creator-dashboard");
  });

  it("gives a Foxer who also invests one entry, marked Current", () => {
    renderFor({ roleType: ["eventFoxer", "investor"] });
    const entries = screen
      .getAllByRole("button")
      .filter((b) => /Dashboard/.test(b.textContent ?? ""));
    expect(entries).toHaveLength(1);
    expect(entries[0]).toHaveTextContent("Creator Dashboard");
    expect(entries[0]).toHaveAttribute("aria-current", "page");
  });

  it("doesn't offer it to an admin secretary, whom the page would bounce", () => {
    renderFor({
      systemRole: "admin_secretary",
      roleType: [],
      permissions: ["admin:access", "queue:read"],
    });
    expect(screen.queryByText("Creator Dashboard")).toBeNull();
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("offers an admin the creator dashboard, but not as an investor", () => {
    renderFor({
      systemRole: "admin",
      roleType: [],
      permissions: ["admin:access", "bookings:read:all"],
    });
    expect(screen.getByText("Creator Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Investor Dashboard")).toBeNull();
    expect(screen.queryByText("Partner Foxer Hub")).toBeNull();
  });

  it("offers a plain citizen only Foxers", () => {
    renderFor({ roleType: [] });
    const citizen = {
      id: "u1",
      systemRole: "user",
      roleType: [],
    } as unknown as User;
    const listed = ROLE_DEFS.filter((def) => def.canOpen(citizen));
    expect(listed.map((def) => def.key)).toEqual(["foxers"]);
  });
});
