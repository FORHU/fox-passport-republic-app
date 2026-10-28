import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { UserMenuRoleSection } from "@/shared/components/layout/user-menu/UserMenuRoleSection";
import { ROLE_DEFS } from "@/shared/components/layout/user-menu/types";

const labelOf = (def: (typeof ROLE_DEFS)[number]) =>
  def.labelFor?.([]) ?? def.label;

function renderSection(isAdmin = false) {
  const onSelectRole = vi.fn();
  const onSelectAdmin = vi.fn();
  // Everything but the last dashboard is unlocked.
  const locked = ROLE_DEFS[ROLE_DEFS.length - 1].key;
  render(
    <UserMenuRoleSection
      isAdmin={isAdmin}
      roleTypes={[]}
      hasRoleAccess={(def) => def.key !== locked}
      onSelectRole={onSelectRole}
      onSelectAdmin={onSelectAdmin}
    />,
  );
  return { onSelectRole, onSelectAdmin };
}

/**
 * "My Dashboards" used to start collapsed behind a toggle, which hid from
 * first-time users where their dashboards were. It is now always open.
 */
describe("UserMenuRoleSection", () => {
  afterEach(cleanup);

  it("lists every dashboard without a click, and has no toggle", () => {
    renderSection();
    expect(screen.getByRole("group", { name: "My Dashboards" })).toBeTruthy();
    for (const def of ROLE_DEFS)
      expect(screen.getByText(labelOf(def))).toBeTruthy();
    expect(screen.queryByRole("button", { name: /my dashboards/i })).toBeNull();
  });

  it("still opens a dashboard, locked or not", () => {
    const { onSelectRole } = renderSection();
    const first = ROLE_DEFS[0];
    const last = ROLE_DEFS[ROLE_DEFS.length - 1];
    fireEvent.click(screen.getByText(labelOf(first)));
    expect(onSelectRole).toHaveBeenLastCalledWith(first, true);
    fireEvent.click(screen.getByText(labelOf(last)));
    expect(onSelectRole).toHaveBeenLastCalledWith(last, false);
  });

  it("shows the Admin dashboard only to admins", () => {
    renderSection(false);
    expect(screen.queryByText("Admin Dashboard")).toBeNull();
    cleanup();
    const { onSelectAdmin } = renderSection(true);
    fireEvent.click(screen.getByText("Admin Dashboard"));
    expect(onSelectAdmin).toHaveBeenCalled();
  });
});
