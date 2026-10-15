"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query defaults for the whole app.
 *
 * This used to be a bare `new QueryClient()`, which meant React Query's own
 * defaults applied: `staleTime: 0` and `refetchOnWindowFocus: true`. Every
 * query was stale the instant it resolved, so any query that did not set its
 * own `staleTime` refetched on every mount and every time the window regained
 * focus — clicking into devtools, alt-tabbing, or clicking back into the page.
 *
 * Fifteen of the app's thirty-six `useQuery` call sites relied on that default,
 * including the three admin approval queues, which is why `/admin` produced a
 * burst of `/admin/*​/pending` requests on every focus change on top of its
 * deliberate 5s `/events` poll.
 *
 * Hooks that genuinely want live data still say so and win over these defaults:
 * `refetchInterval` is untouched, and the seven hooks that explicitly set
 * `refetchOnWindowFocus: true` keep it.
 *
 * These were declared here and then never passed to the client, so React
 * Query's own defaults went on applying and the fix described above was not in
 * force. The test that guards this file matched on its source text, so the
 * object being present was enough to satisfy it; it now reads the client's
 * resolved defaults instead.
 */
const queryDefaults = {
  queries: {
    // Long enough that remounts and focus changes reuse the cache; short
    // enough that a stale dashboard corrects itself well within a minute.
    staleTime: 30_000,
    // Opt-in rather than opt-out. Polling hooks that need it set it themselves.
    refetchOnWindowFocus: false,
  },
} as const;

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...queryDefaults.queries,
            // Unrelated to the refetch problem above, and deliberately not part
            // of `queryDefaults`: this is about failure, not freshness.
            retry: 1,
            retryDelay: 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
