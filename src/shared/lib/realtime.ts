/**
 * Event names the server sends. Mirrors
 * `fox-passport-republic-api/src/infrastructure/socket/socket.constants.ts`.
 *
 * These strings are the contract between the two repos. A typo on either side
 * fails silently - no error, no dropped connection, just a screen that never
 * updates - so neither side retypes them.
 */
export const SOCKET_EVENTS = {
  NEW_NOTIFICATION: "new_notification",
  DATA_INVALIDATE: "data:invalidate",
} as const;

/**
 * How often a screen re-checks the server when nothing has told it to.
 *
 * Polling is no longer how these screens stay current — the server emits
 * `data:invalidate` over the socket the moment the underlying data changes, and
 * `SocketProvider` turns that into a React Query invalidation. This interval is
 * the recovery path for the cases the socket cannot cover: a dropped connection
 * before it reconnects, an event emitted while the tab was closed, or Redis
 * being down so no handshake succeeds at all.
 *
 * One minute is chosen against that job, not against freshness — if the live
 * path is working, this never fires anything useful; if it has failed, a stale
 * screen corrects itself well before anyone files a bug. Every query using it is
 * also gated on tab visibility, so a hidden tab polls nothing.
 */
export const SOCKET_FALLBACK_POLL_MS = 60_000;

/** Poll only while the tab is actually in front of someone. */
export const pollWhileVisible = () => {
  if (typeof document !== "undefined" && document.hidden) return false;
  return SOCKET_FALLBACK_POLL_MS;
};

/**
 * Every topic the server can emit, and the cached queries each one makes stale.
 *
 * The server deliberately sends no data with an invalidation - only a topic - so
 * this is the single place that knows how server vocabulary maps onto React
 * Query keys. The server's topic union is closed for the same reason: a topic
 * with no entry here invalidates nothing, and the failure would look exactly
 * like "the socket is down".
 *
 * `favorites` has no topic on purpose. It only changes through the viewer's own
 * favourite/unfavourite, which `useFavorites` already invalidates locally; no
 * server-side event moves it.
 */
export const TOPIC_QUERY_KEYS: Record<string, string[][]> = {
  "admin:pending": [["admin-data"]],
  venues: [["host-venues"], ["host-venue-stats"], ["host-data"]],
  events: [["user-upcoming-events"], ["host-data"], ["admin-data"]],
  // `user-bookings` is the citizen's own list at /booking. It was the last
  // screen still fetching in a `useEffect`, which put it outside the cache and
  // out of reach of every emit above it.
  bookings: [
    ["host-data"],
    ["user-upcoming-events"],
    ["admin-data"],
    ["user-bookings"],
  ],
  // The admin disputes and refunds tables. React Query matches keys by prefix,
  // so this one entry also covers the per-type tables keyed
  // ["admin", "disputes", "asset" | "service"].
  disputes: [["admin", "disputes"]],
  waitlist: [["waitlist"]],
  // An admin approving a role application changes what the applicant may do.
  // `["me"]` is the shared profile key `useProfile` and `useSessionManager` both
  // read, so the new role reaches the UI without waiting out the 5-minute poll.
  roles: [["me"]],
};

/**
 * A one-way bus from the socket transport to whichever feature owns an event.
 *
 * `SocketProvider` lives in `shared/` and owns the connection, but the meaning
 * of a `new_notification` belongs to `features/notifications` — the store it
 * lands in, and the toast it raises. Importing that feature from `shared/`
 * inverts the dependency the architecture scan exists to protect, so the
 * provider publishes here instead and the feature subscribes.
 *
 * Deliberately tiny. Not an app-wide event system: the socket is the only
 * publisher, and anything with a real owner should be a hook in that feature
 * rather than another string on this bus.
 */
type Listener = (payload: never) => void;

const listeners = new Map<string, Set<Listener>>();

/** Publish a socket payload to whoever owns this event. Transport side. */
export function publishRealtime<T>(event: string, payload: T): void {
  const set = listeners.get(event);
  if (!set) return;
  // Copied before iterating: a listener that unsubscribes itself while handling
  // would otherwise mutate the set mid-loop.
  for (const fn of [...set]) (fn as (p: T) => void)(payload);
}

/** Subscribe to a socket event. Returns the unsubscribe. Feature side. */
export function subscribeRealtime<T>(
  event: string,
  fn: (payload: T) => void,
): () => void {
  const set = listeners.get(event) ?? new Set<Listener>();
  listeners.set(event, set);
  set.add(fn as Listener);
  return () => {
    set.delete(fn as Listener);
    if (set.size === 0) listeners.delete(event);
  };
}
