import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@/shared/lib/axios";
import {
  fetchEventFoxers,
  fetchEventTemplates,
  fetchGearFoxers,
  fetchServiceFoxers,
} from "../search";

vi.mock("@/shared/lib/axios", () => ({
  default: { get: vi.fn() },
}));

const get = vi.mocked(api.get);

/**
 * The /search box sends `q` to every section, so typing a city or event type
 * narrows the whole page — Gear and Talent used to drop it.
 */
describe("search API — the search box reaches every section", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { data: [], pagination: null } });
  });

  const filters = { q: "Makati", city: "Makati" };

  it.each([
    ["/users/foxers", fetchEventFoxers],
    ["/event-templates/browse", fetchEventTemplates],
    ["/asset/browse", fetchGearFoxers],
    ["/service/browse", fetchServiceFoxers],
  ] as const)("sends q and city to %s", async (path, fetcher) => {
    await fetcher(1, 5, filters);
    expect(get).toHaveBeenCalledWith(path, {
      params: expect.objectContaining({ q: "Makati", city: "Makati" }),
    });
  });

  it("leaves q out when the box is empty", async () => {
    await fetchGearFoxers(1, 5, { city: "Makati" });
    const params = get.mock.calls[0][1]?.params as Record<string, unknown>;
    expect(params).not.toHaveProperty("q");
  });
});
