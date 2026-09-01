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
  bookings: [["host-data"], ["user-upcoming-events"], ["admin-data"]],
  waitlist: [["waitlist"]],
  // An admin approving a role application changes what the applicant may do.
  // `["me"]` is the shared profile key `useProfile` and `useSessionManager` both
  // read, so the new role reaches the UI without waiting out the 5-minute poll.
  roles: [["me"]],
};
