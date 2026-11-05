import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/shared/lib/axios", () => ({ default: { patch: vi.fn() } }));
vi.mock("@/shared/components/ui/Money", () => ({ Money: () => null }));
vi.mock("@/shared/components/ui/LocationMap", () => ({
  LocationMap: () => null,
}));

import { AdminVenuesTable } from "@/features/admin/components/AdminVenuesTable";

const renderTable = (venues: any[]) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminVenuesTable venues={venues} isLoading={false} />
    </QueryClientProvider>,
  );

/**
 * The admin venue list is the API's raw rows (`mayor` / `mayorId`). The table
 * read only the server-normalized `host`, so after any client refetch every
 * venue showed "Unknown Owner".
 */
describe("AdminVenuesTable Mayor column", () => {
  afterEach(cleanup);

  it("shows the Mayor of a raw API venue", () => {
    renderTable([
      {
        id: "v1",
        name: "Fox Hall",
        status: "available",
        mayorId: "abcdef1234567890",
        mayor: { id: "abcdef1234567890", name: "Maya Mayor" },
        images: [],
      },
    ]);
    expect(screen.getByText("Maya Mayor")).toBeInTheDocument();
    expect(screen.getByText("ID: abcdef12…")).toBeInTheDocument();
    expect(screen.queryByText("Unknown Owner")).toBeNull();
  });

  it("still reads the normalized host shape", () => {
    renderTable([
      {
        id: "v2",
        name: "Den",
        status: "pending",
        hostId: "1234567890abcdef",
        host: { id: "1234567890abcdef", name: "Hal Host" },
        images: [],
      },
    ]);
    expect(screen.getByText("Hal Host")).toBeInTheDocument();
  });
});
