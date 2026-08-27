import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The app's QueryClient was constructed bare, so React Query's own defaults
 * applied: `staleTime: 0` and `refetchOnWindowFocus: true`. Every query that
 * did not set its own `staleTime` refetched on every mount and every window
 * focus — which is what made `/admin` fire its three approval-queue requests
 * every time the window regained focus.
 *
 * These assertions are on the source rather than on behaviour, which makes them
 * weaker than a real render test: they would survive a behaviour-preserving
 * rewrite and miss a regression phrased differently. They are here because the
 * failure mode is silent and the fix is a single easily-deleted object.
 */

/**
 * Comments are stripped before matching. The first version of this file did not
 * do that, and failed against correct code: the comment explaining the fix
 * quotes the very strings it forbids (`new QueryClient()`, `staleTime: 0`), so
 * the scan matched the prose rather than the code.
 */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const read = (rel: string) =>
  stripComments(readFileSync(join(process.cwd(), "src", rel), "utf-8"));

describe("global React Query defaults", () => {
  const provider = read("shared/providers/QueryProvider.tsx");

  it("does not construct the QueryClient bare", () => {
    expect(provider).not.toMatch(/new QueryClient\(\s*\)/);
  });

  it("sets a non-zero staleTime", () => {
    const match = provider.match(/staleTime:\s*([0-9_]+)/);
    expect(match, "no staleTime in the client defaults").not.toBeNull();
    expect(Number(match![1].replace(/_/g, ""))).toBeGreaterThan(0);
  });

  it("does not refetch on window focus by default", () => {
    expect(provider).toMatch(/refetchOnWindowFocus:\s*false/);
  });
});

describe("admin approval queues", () => {
  // These three were the visible symptom: no staleTime of their own, so they
  // inherited 0 and refired constantly.
  const hooks = [
    "features/admin/hooks/useAdminPendingVenues.ts",
    "features/admin/hooks/useAdminPendingAssets.ts",
    "features/admin/hooks/useAdminPendingServices.ts",
  ];

  it.each(hooks)("%s does not set refetchOnWindowFocus: true", (path) => {
    expect(read(path)).not.toMatch(/refetchOnWindowFocus:\s*true/);
  });

  it.each(hooks)("%s does not poll on an interval", (path) => {
    expect(read(path)).not.toMatch(/refetchInterval/);
  });
});
