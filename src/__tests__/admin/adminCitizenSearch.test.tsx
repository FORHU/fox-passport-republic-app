import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));
vi.mock("@/features/admin/components/RoleAssignmentControls", () => ({
  RoleAssignmentControls: () => null,
}));

import { AdminCitizenTable } from "@/features/admin/components/AdminCitizenTable";

const ADA = {
  id: "u1",
  name: "Ada",
  email: "ada@example.com",
  systemRole: "user",
  roleType: ["investor"],
  createdAt: "2026-10-01T00:00:00Z",
};

function renderTable(
  props: React.ComponentProps<typeof AdminCitizenTable> = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AdminCitizenTable {...props} />
    </QueryClientProvider>,
  );
}

/**
 * The Citizens directory: the total comes from the API's pagination from the
 * first render, the search box drives the API's search, and an empty result
 * says what was searched and offers a way back.
 */
describe("AdminCitizenTable", () => {
  afterEach(() => {
    cleanup();
    api.get.mockReset();
  });

  it("shows the real total from the server-rendered first page", () => {
    renderTable({
      initialCitizens: [ADA],
      initialPagination: { page: 1, limit: 20, total: 57, totalPages: 3 },
    });
    expect(screen.getByText("57 registered users")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("sends the search to the API and shows the matches", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [ADA],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });
    renderTable({ initialCitizens: [], initialPagination: undefined });

    fireEvent.change(screen.getByRole("searchbox", { name: /search citizens/i }), {
      target: { value: "investor" },
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/users", {
        params: { page: 1, limit: 20, search: "investor" },
      }),
    );
    expect(await screen.findByText("Ada")).toBeInTheDocument();
  });

  it("names the query when nothing matches and clears it", async () => {
    api.get.mockImplementation((_url: string, { params }: any) =>
      Promise.resolve({
        data: params.search
          ? {
              data: [],
              pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            }
          : {
              data: [ADA],
              pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
            },
      }),
    );
    renderTable({
      initialCitizens: [ADA],
      initialPagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const input = screen.getByRole("searchbox", { name: /search citizens/i });
    fireEvent.change(input, { target: { value: "zzz" } });

    expect(
      await screen.findByText(/No citizens match .zzz./),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    expect(input).toHaveValue("");
    expect(await screen.findByText("Ada")).toBeInTheDocument();
  });
});
