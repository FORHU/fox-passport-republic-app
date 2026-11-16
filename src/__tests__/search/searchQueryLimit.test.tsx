import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const LONG = "a".repeat(500);
const nav = vi.hoisted(() => ({
  params: new URLSearchParams(),
  router: { push: vi.fn(), replace: vi.fn() },
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.params,
  useRouter: () => nav.router,
}));
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));
vi.mock("@/features/landing/components/sections/LandingHeader", () => ({
  default: () => null,
}));
vi.mock("@/features/search/components/SearchFilters", () => ({
  default: () => null,
  EVENT_KINDS: [],
  FILTER_PARAMS: ["q", "category", "specialty", "city", "maxPrice"],
}));
vi.mock("@/shared/api/providerSpecialties", () => ({
  useProviderSpecialties: () => ({ data: [] }),
}));

import SearchClient from "@/app/search/_components/SearchClient";
import { SEARCH_QUERY_MAX } from "@/shared/lib/limits";

function renderSearch(qs: string) {
  nav.params = new URLSearchParams(qs);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SearchClient />
    </QueryClientProvider>,
  );
}

/**
 * The Foxers search (app#300): the box took any amount of text, and the
 * filter chip repeated all of it, so a long query pushed the page wider than
 * the screen. The box now stops at 200 characters, a longer `q` from the URL
 * is cut to 200, and the chip truncates with the full text in its title.
 */
describe("SearchClient search query limit", () => {
  beforeEach(() => {
    api.get.mockResolvedValue({
      data: { data: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 0 } },
    });
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("caps the search box at 200 characters", () => {
    renderSearch("");
    expect(SEARCH_QUERY_MAX).toBe(200);
    expect(screen.getByLabelText("Search Foxers")).toHaveAttribute(
      "maxLength",
      "200",
    );
  });

  it("cuts a long q from the URL to 200 in the box, the chip and the API call", async () => {
    renderSearch(`q=${LONG}`);
    const cut = "a".repeat(200);

    expect(screen.getByLabelText("Search Foxers")).toHaveValue(cut);
    // The chip label is truncated visually, with the full query on hover and
    // in the remove button's screen-reader label.
    expect(screen.getByTitle(cut)).toHaveClass("truncate");
    expect(
      screen.getByRole("button", { name: `Remove filter: search "${cut}"` }),
    ).toBeInTheDocument();

    await waitFor(() => expect(api.get).toHaveBeenCalled());
    for (const [, opts] of api.get.mock.calls) {
      expect(opts.params.q).toBe(cut);
    }
    // The cut value matches what the box holds, so nothing is re-written.
    expect(nav.router.replace).not.toHaveBeenCalled();
  });

  it("leaves a short query as it is", () => {
    renderSearch("q=dj");
    expect(screen.getByLabelText("Search Foxers")).toHaveValue("dj");
    expect(screen.getByTitle("dj")).toBeInTheDocument();
  });
});
