import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { publishRealtime, SOCKET_EVENTS } from "@/shared/lib/realtime";

/**
 * app#308: the "New posts" count. A `feed:new` event (coalesced) triggers a
 * count request; without a live socket it polls every minute while the page
 * is visible; disabled or without `since`, it stays at 0.
 */

const getNewPostsCount = vi.hoisted(() => vi.fn());
vi.mock("@/shared/api/feed", () => ({ getNewPostsCount }));

const socket = vi.hoisted(() => ({ current: null as { connected: boolean } | null }));
vi.mock("@/shared/lib/socket", () => ({ getSocket: () => socket.current }));

const { useNewPostsCount, NEW_POSTS_POLL_MS } = await import(
  "../useNewPostsCount"
);

const SINCE = "2026-11-18T12:00:00.000Z";

beforeEach(() => {
  vi.useFakeTimers();
  getNewPostsCount.mockReset().mockResolvedValue(2);
  socket.current = { connected: true };
});
afterEach(() => vi.useRealTimers());

/** Runs pending timers and lets the count promise resolve. */
async function flush(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("useNewPostsCount", () => {
  it("asks for the count once per burst of feed:new events", async () => {
    const { result } = renderHook(() =>
      useNewPostsCount(SINCE, "all", true),
    );
    expect(result.current).toBe(0);

    act(() => {
      publishRealtime(SOCKET_EVENTS.FEED_NEW, { tab: "community" });
      publishRealtime(SOCKET_EVENTS.FEED_NEW, { tab: "marketplace" });
    });
    await flush(2_000);

    expect(getNewPostsCount).toHaveBeenCalledTimes(1);
    expect(getNewPostsCount).toHaveBeenCalledWith({ since: SINCE, tab: "all" });
    expect(result.current).toBe(2);
  });

  it("ignores posts on another tab", async () => {
    renderHook(() => useNewPostsCount(SINCE, "community", true));
    act(() => publishRealtime(SOCKET_EVENTS.FEED_NEW, { tab: "marketplace" }));
    await flush(2_000);
    expect(getNewPostsCount).not.toHaveBeenCalled();
  });

  it("polls every minute when the socket isn't connected, not when it is", async () => {
    renderHook(() => useNewPostsCount(SINCE, "all", true));
    await flush(NEW_POSTS_POLL_MS);
    expect(getNewPostsCount).not.toHaveBeenCalled();

    socket.current = null; // signed out, or dropped
    await flush(NEW_POSTS_POLL_MS);
    expect(getNewPostsCount).toHaveBeenCalledTimes(1);
  });

  it("stays at 0 while disabled or before `since` is known", async () => {
    socket.current = null;
    const disabled = renderHook(() => useNewPostsCount(SINCE, "all", false));
    const noSince = renderHook(() => useNewPostsCount(null, "all", true));
    act(() => publishRealtime(SOCKET_EVENTS.FEED_NEW, { tab: "community" }));
    await flush(NEW_POSTS_POLL_MS + 2_000);
    expect(getNewPostsCount).not.toHaveBeenCalled();
    expect(disabled.result.current).toBe(0);
    expect(noSince.result.current).toBe(0);
  });

  it("starts again from 0 when `since` moves on", async () => {
    const { result, rerender } = renderHook(
      ({ since }) => useNewPostsCount(since, "all", true),
      { initialProps: { since: SINCE } },
    );
    act(() => publishRealtime(SOCKET_EVENTS.FEED_NEW, { tab: "community" }));
    await flush(2_000);
    expect(result.current).toBe(2);

    rerender({ since: "2026-11-18T12:05:00.000Z" });
    expect(result.current).toBe(0);
  });
});
