import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TOPIC_QUERY_KEYS,
  SOCKET_FALLBACK_POLL_MS,
  SOCKET_EVENTS,
} from "@/shared/lib/realtime";

/**
 * Polling is no longer how these screens stay current - the socket is. Two ways
 * that can regress silently, and neither shows up as a failing request:
 *
 *   - the server emits a topic the client has no mapping for, so nothing
 *     refetches and the screen just sits there;
 *   - someone reintroduces a fast interval, and the poll quietly becomes the
 *     mechanism again while the socket rots unnoticed.
 */

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf-8");

/** The closed union in the API's `socket.types.ts`. Kept in step by hand. */
const SERVER_TOPICS = [
  "admin:pending",
  "venues",
  "events",
  "bookings",
  "disputes",
  "waitlist",
  "roles",
];

const POLLING_HOOKS = [
  "src/features/admin/hooks/useAdminData.ts",
  "src/features/admin/components/AdminDisputesPanel.tsx",
  "src/features/booking/components/BookingListClient.tsx",
  "src/features/booking/components/MobileBookingsView.tsx",
  "src/features/dashboard/hooks/useHostDashboard.ts",
  "src/features/dashboard/hooks/useHostData.ts",
  "src/features/dashboard/hooks/useUserDashboard.ts",
  "src/features/booking/hooks/useWaitlist.ts",
];

describe("every server topic invalidates something", () => {
  it.each(SERVER_TOPICS)("%s is mapped", (topic) => {
    expect(TOPIC_QUERY_KEYS[topic], `no mapping for "${topic}"`).toBeDefined();
    expect(TOPIC_QUERY_KEYS[topic].length).toBeGreaterThan(0);
  });

  it("maps nothing the server cannot emit", () => {
    expect(Object.keys(TOPIC_QUERY_KEYS).sort()).toEqual(
      [...SERVER_TOPICS].sort(),
    );
  });

  it("invalidates the keys the polling hooks actually use", () => {
    const mapped = new Set(
      Object.values(TOPIC_QUERY_KEYS).flatMap((keys) => keys.map((k) => k[0])),
    );
    // Each of these is a live query that used to depend on a fast interval -
    // except ["admin"], the disputes tables, which depended on nothing at all
    // and refreshed only on mount and on their own mutation.
    for (const key of [
      "admin-data",
      "admin",
      "host-venues",
      "host-data",
      "user-upcoming-events",
      "user-bookings",
      "waitlist",
      "me",
    ]) {
      expect(mapped.has(key), `"${key}" has no topic that invalidates it`).toBe(
        true,
      );
    }
  });
});

describe("polling is a fallback, not the mechanism", () => {
  it("keeps the fallback slow", () => {
    expect(SOCKET_FALLBACK_POLL_MS).toBeGreaterThanOrEqual(60_000);
  });

  it.each(POLLING_HOOKS)("%s sets no interval of its own", (path) => {
    const source = read(path);
    // A literal interval here means the hook stopped relying on the socket.
    expect(source).not.toMatch(/refetchInterval:\s*\d/);
    expect(source).not.toMatch(/return\s+\d{4,};/);
  });
});

describe("the event names both repos agree on", () => {
  // Mirrors socket.constants.ts in the API. If either side is edited alone the
  // socket still connects and simply goes quiet, so the literals are pinned.
  it("matches the server's socket.constants.ts", () => {
    expect(SOCKET_EVENTS.NEW_NOTIFICATION).toBe("new_notification");
    expect(SOCKET_EVENTS.DATA_INVALIDATE).toBe("data:invalidate");
  });

  it("is referenced, never retyped, in the provider", () => {
    const provider = read("src/shared/providers/SocketProvider.tsx");
    expect(provider).not.toMatch(/["']data:invalidate["']/);
    expect(provider).not.toMatch(/["']new_notification["']/);
    expect(provider).toMatch(/SOCKET_EVENTS\.DATA_INVALIDATE/);
  });
});
