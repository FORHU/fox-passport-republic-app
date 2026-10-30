import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/shared/components/ui/Money", () => ({ Money: () => null }));

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { AdminAssetsTable } from "@/features/admin/components/AdminAssetsTable";

const signIn = (permissions: string[]) =>
  useAuthStore.getState().login({
    user: {
      id: "a1",
      email: "a@example.com",
      name: "Ada",
      systemRole: "admin",
      roleType: [],
      permissions,
    } as never,
  });

const renderTable = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminAssetsTable
        assets={[{ id: "g1", name: "Stage truss", status: "pending" }]}
        isLoading={false}
      />
    </QueryClientProvider>,
  );

/**
 * Seeing the review queue (queue:read) isn't deciding it (queue:decide), as
 * AdminReviewPanel already had it. The other three queue tables follow the
 * same pattern.
 */
describe("queue Approve / Reject", () => {
  it("is offered with queue:decide", () => {
    signIn(["admin:access", "queue:read", "queue:decide"]);
    renderTable();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("isn't offered with queue:read alone", () => {
    signIn(["admin:access", "queue:read"]);
    renderTable();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
  });
});
