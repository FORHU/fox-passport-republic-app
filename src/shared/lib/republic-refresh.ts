/**
 * "Republic was clicked": the nav's Republic button (header pill, mobile
 * bottom bar) asks the feed for a fresh For You mix (app#308).
 *
 * A signal rather than a direct call: the nav lives in shared layout and must
 * not import the republic feature. The click can also come from another page,
 * before the feed has mounted to hear it, so it leaves a pending flag that the
 * feed takes when it mounts.
 */

const EVENT = "republic:refresh";

let pending = false;

/** Called by the nav when Republic is clicked, wherever the user is. */
export function requestRepublicRefresh(): void {
  pending = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

/** True once per request: the feed takes a request made before it mounted. */
export function takePendingRepublicRefresh(): boolean {
  const was = pending;
  pending = false;
  return was;
}

/** Runs `fn` on each click of Republic while the feed is open. Returns the unsubscribe. */
export function onRepublicRefresh(fn: () => void): () => void {
  const handler = () => {
    pending = false;
    fn();
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
