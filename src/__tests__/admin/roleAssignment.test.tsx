import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { RoleAssignmentControls } from "@/features/admin/components/RoleAssignmentControls";

/**
 * The only control in the console that hands out capability. The API refuses
 * without `roles:assign` regardless, so this is courtesy rather than the
 * boundary — but a secretary seeing a role selector they cannot use is a bug
 * worth failing a build over, and self-assignment is refused twice on purpose.
 */

const viewer = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (selector: (s: { user: unknown }) => unknown) =>
    selector({ user: viewer.current }),
}));

const citizen = {
  id: "citizen-1",
  email: "someone@example.com",
  systemRole: "user",
  roleType: [],
};

function renderFor(user: unknown, target = citizen) {
  viewer.current = user;
  const client = new QueryClient();
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(RoleAssignmentControls, { citizen: target }),
    ),
  );
}

describe("RoleAssignmentControls", () => {
  it("renders nothing without roles:assign", () => {
    const { container } = renderFor({
      id: "sec-1",
      permissions: ["admin:access", "queue:read", "queue:decide"],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing at all for a signed-out viewer", () => {
    const { container } = renderFor(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the controls to an admin holding roles:assign", () => {
    renderFor({ id: "admin-1", permissions: ["admin:access", "roles:assign"] });
    expect(screen.getByLabelText(/system role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply roles/i })).toBeInTheDocument();
  });

  it("refuses to offer a viewer their own row", () => {
    renderFor(
      { id: "admin-1", permissions: ["admin:access", "roles:assign"] },
      { ...citizen, id: "admin-1" },
    );
    expect(screen.queryByLabelText(/system role/i)).not.toBeInTheDocument();
    expect(screen.getByText(/nobody changes their own access/i)).toBeInTheDocument();
  });
});
