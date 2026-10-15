import { describe, it, expect } from "vitest";
import { createElement, useEffect } from "react";
import { render } from "@testing-library/react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import QueryProvider from "@/shared/providers/QueryProvider";

/**
 * The app's QueryClient was constructed bare, so React Query's own defaults
 * applied: `staleTime: 0` and `refetchOnWindowFocus: true`. Every query that
 * did not set its own `staleTime` refetched on every mount and every window
 * focus — which is what made `/admin` fire its three approval-queue requests
 * every time the window regained focus.
 *
 * The first version of these assertions read the source of the provider rather
 * than the client it builds, and that gap cost something: the defaults object
 * was declared and never passed to `new QueryClient`, so React Query's own
 * defaults went on applying while every assertion here passed. The defaults are
 * now read off the client itself, which is the only thing the app actually
 * uses.
 *
 * The source-text scans that remain below are about *other* files and are still
 * the weaker kind of test - they would survive a behaviour-preserving rewrite -
 * but they are cheap and the failure mode they guard is silent.
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

/**
 * Hands back the client `QueryProvider` really builds. The capture happens in
 * an effect rather than during render: reassigning an outer variable mid-render
 * is a side effect, and the lint rule that forbids it is right to.
 */
function Probe({ onClient }: { onClient: (client: QueryClient) => void }) {
  const client = useQueryClient();
  useEffect(() => {
    onClient(client);
  }, [client, onClient]);
  return null;
}

function renderedClient(): QueryClient {
  let captured: QueryClient | undefined;
  render(
    createElement(
      QueryProvider,
      null,
      createElement(Probe, {
        onClient: (client: QueryClient) => {
          captured = client;
        },
      }),
    ),
  );
  expect(captured, "QueryProvider rendered no client").toBeDefined();
  return captured!;
}

describe("global React Query defaults", () => {
  it("sets a non-zero staleTime", () => {
    const { staleTime } = renderedClient().getDefaultOptions().queries ?? {};
    expect(staleTime).toBeGreaterThan(0);
  });

  it("does not refetch on window focus by default", () => {
    const queries = renderedClient().getDefaultOptions().queries ?? {};
    expect(queries.refetchOnWindowFocus).toBe(false);
  });

  it("keeps the retry policy it was given", () => {
    // Unrelated to freshness, and the reason the defaults object has to be
    // merged rather than passed whole - it was dropped once already.
    const queries = renderedClient().getDefaultOptions().queries ?? {};
    expect(queries.retry).toBe(1);
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
