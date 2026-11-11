import { describe, it, expect, vi, beforeEach } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

import { fetchProviders } from "@/features/search/api/search";

describe("fetchProviders (RR-3 specialty search)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        data: [{ id: "p-1", name: "Lens & Light" }],
        pagination: { page: 1, limit: 8, total: 1, totalPages: 1 },
      },
    });
  });

  it("asks for Providers under the chosen specialty", async () => {
    const res = await fetchProviders(1, 8, {
      specialty: "photography",
      city: "Manila",
      category: "wedding",
    });

    expect(api.get).toHaveBeenCalledWith("/users/foxers", {
      params: {
        page: 1,
        limit: 8,
        roleType: "providerFoxer",
        specialty: "photography",
        city: "Manila",
      },
    });
    expect(res.items).toHaveLength(1);
    expect(res.pagination.total).toBe(1);
  });

  it("lists every Provider without a specialty", async () => {
    await fetchProviders(2, 8);

    expect(api.get).toHaveBeenCalledWith("/users/foxers", {
      params: { page: 2, limit: 8, roleType: "providerFoxer" },
    });
  });
});
