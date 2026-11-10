import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "../usePostStatsStore";

/** BUG-25: like and comment counts drifted between the feed card and the
 * post detail modal. Both now read one shared copy per post. */

const post = (over: Record<string, unknown> = {}) => ({
  id: "p1",
  likesCount: 5,
  commentsCount: 2,
  myReaction: null,
  isLikedByMe: false,
  ...over,
});

const stats = () => usePostStatsStore.getState().stats.p1;
const store = () => usePostStatsStore.getState();

beforeEach(() => {
  store().reset();
  vi.useFakeTimers();
  vi.setSystemTime(1_000);
});
afterEach(() => vi.useRealTimers());

describe("usePostStatsStore", () => {
  it("seeds a post once, so a stale copy can't overwrite newer counts", () => {
    store().seed(post());
    store().react("p1", "like");
    store().seed(post()); // the modal's stale copy of the same post
    expect(stats()).toEqual({ likesCount: 6, commentsCount: 2, myReaction: "like" });
  });

  it("reads isLikedByMe when myReaction is missing", () => {
    store().seed(post({ myReaction: undefined, isLikedByMe: true }));
    expect(stats().myReaction).toBe("like");
  });

  it("takes fresh server counts", () => {
    store().seed(post());
    store().syncFromServer([post({ likesCount: 9, commentsCount: 4 })], 2_000);
    expect(stats()).toMatchObject({ likesCount: 9, commentsCount: 4 });
  });

  it("ignores server data while a reaction is in flight", () => {
    store().seed(post());
    store().beginReaction("p1");
    store().react("p1", "like");
    vi.setSystemTime(5_000);
    store().syncFromServer([post()], 4_000);
    expect(stats()).toMatchObject({ likesCount: 6, myReaction: "like" });
  });

  it("ignores a response to a request started before the last local change", () => {
    store().seed(post());
    const requestedAt = Date.now();
    vi.setSystemTime(2_000);
    store().beginReaction("p1");
    store().react("p1", "like");
    store().setReaction("p1", { reaction: "like", likesCount: 6 });
    store().endReaction("p1");
    store().syncFromServer([post()], requestedAt); // read before the like
    expect(stats()).toMatchObject({ likesCount: 6, myReaction: "like" });

    vi.setSystemTime(3_000);
    store().syncFromServer([post({ likesCount: 7, myReaction: "like" })], 3_000);
    expect(stats().likesCount).toBe(7);
  });

  it("counts a like, keeps the count on a reaction swap, and rolls back", () => {
    store().seed(post());
    const before = store().react("p1", "like");
    expect(stats().likesCount).toBe(6);
    store().react("p1", "love");
    expect(stats()).toMatchObject({ likesCount: 6, myReaction: "love" });
    store().restore("p1", before!);
    expect(stats()).toEqual({ likesCount: 5, commentsCount: 2, myReaction: null });
  });

  it("takes the server's count after a reaction", () => {
    store().seed(post());
    store().react("p1", "like");
    store().setReaction("p1", { reaction: "like", likesCount: 12 });
    expect(stats().likesCount).toBe(12);
  });

  it("adjusts the comment count and never goes below zero", () => {
    store().seed(post());
    store().adjustComments("p1", 1);
    expect(stats().commentsCount).toBe(3);
    store().adjustComments("p1", -10);
    expect(stats().commentsCount).toBe(0);
  });

  it("forgets every post when the account changes", () => {
    useAuthStore.setState({ user: { id: "u1" } as never });
    store().seed(post());
    useAuthStore.setState({ user: { id: "u2" } as never });
    expect(stats()).toBeUndefined();
    useAuthStore.setState({ user: null });
  });
});
