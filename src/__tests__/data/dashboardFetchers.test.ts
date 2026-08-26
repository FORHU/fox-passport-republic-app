import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Guards the fix for dashboard over-fetching.
 *
 * Every single-resource dashboard page used to call `getHostDashboard`, which
 * fans out to four endpoints, and then read one list off the result — paying for
 * four requests and discarding three. These tests pin the request count, which
 * is the thing that regresses silently.
 */

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "test-token" }) }),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/shared/lib/server/auth", () => ({
  requireAuth: vi.fn(async () => ({ id: "host-1" })),
}));

const urls = () =>
  (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
    String(c[0]),
  );

beforeEach(() => {
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ data: [] }),
  })) as unknown as typeof fetch;
});

afterEach(() => vi.restoreAllMocks());

describe("single-resource fetchers make exactly one request", () => {
  it("getAssetsByHostId hits only /asset", async () => {
    const { getAssetsByHostId } = await import("@/shared/lib/server/data");
    await getAssetsByHostId("host-1");

    expect(urls()).toHaveLength(1);
    expect(urls()[0]).toContain("/asset");
    expect(urls()[0]).toContain("ownerId=host-1");
  });

  it("getVenuesByHostId hits only /venues", async () => {
    const { getVenuesByHostId } = await import("@/shared/lib/server/data");
    await getVenuesByHostId("host-1");

    expect(urls()).toHaveLength(1);
    expect(urls()[0]).toContain("/venues");
    expect(urls()[0]).toContain("hostId=host-1");
  });
});

describe("the aggregate is still an aggregate", () => {
  it("getHostDashboard fetches all four resources, once each", async () => {
    const { getHostDashboard } = await import("@/shared/lib/server/data");
    const result = await getHostDashboard("host-1");

    const requested = urls();
    expect(requested).toHaveLength(4);
    for (const path of ["/event-templates", "/venues", "/asset", "/service"]) {
      expect(requested.filter((u) => u.includes(path))).toHaveLength(1);
    }
    expect(Object.keys(result).sort()).toEqual([
      "events",
      "inventory",
      "services",
      "venues",
    ]);
  });
});

describe("pages do not reach for the aggregate to render one list", () => {
  it.each([
    ["src/app/creator-dashboard/assets/page.tsx", "getAssetsByHostId"],
    ["src/app/creator-dashboard/venues/page.tsx", "getVenuesByHostId"],
  ])("%s uses %s", async (file, expected) => {
    const src = readFileSync(file, "utf-8");

    expect(src).toContain(expected);
    expect(src).not.toContain("getHostDashboard");
  });
});

describe("pages fetch only what the branch they render actually uses", () => {
  const read = (f: string) => readFileSync(f, "utf-8");

  it("the landing page does not fetch venues unconditionally", () => {
    const src = read("src/app/page.tsx");

    // The default branch renders FoxerLandingPage, which takes no venues, so an
    // unconditional fetch here is wasted work on the most visited route.
    expect(src).toMatch(/isSearchMode \? getVenues\(\)/);
    expect(src).not.toMatch(/const venues = await getVenues\(\)/);
  });

  it("the landing page fetches in parallel, not as a waterfall", () => {
    const src = read("src/app/page.tsx");
    expect(src).toMatch(/await Promise\.all\(/);
    expect(src).not.toMatch(
      /const featuredTemplates = await getFeaturedEventTemplates/,
    );
  });

  it("the categories page batches its three independent fetches", () => {
    const src = read("src/app/categories/page.tsx");
    expect(src).toMatch(/await Promise\.all\(/);
    expect(src).not.toMatch(/const categories = await getCategories\(\)/);
  });
});
