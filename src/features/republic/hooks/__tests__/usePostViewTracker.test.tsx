import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";

const api = vi.hoisted(() => ({ recordPostViews: vi.fn() }));
vi.mock("@/shared/api/feed", () => ({
  recordPostViews: api.recordPostViews,
}));

import {
  usePostViewTracker,
  __resetPostViewTracker,
  VIEW_DWELL_MS,
  VIEW_FLUSH_MS,
} from "../usePostViewTracker";

/** app#303: a view counts after a post is at least half on screen for ~1 s,
 * once per viewer, batched. */

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let ioCallback: IOCallback = () => {};
const observed = new Set<Element>();

class FakeIO {
  constructor(cb: IOCallback) {
    ioCallback = cb;
  }
  observe(el: Element) {
    observed.add(el);
  }
  unobserve(el: Element) {
    observed.delete(el);
  }
  disconnect() {
    observed.clear();
  }
}

function Card({ ids, enabled = true }: { ids: string[]; enabled?: boolean }) {
  const ref = usePostViewTracker(ids, enabled);
  return <div data-testid={ids.join(",")} ref={ref} />;
}

const show = (el: Element, ratio: number) =>
  act(() =>
    ioCallback([
      { target: el, isIntersecting: ratio > 0, intersectionRatio: ratio },
    ]),
  );

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", FakeIO);
  __resetPostViewTracker();
  observed.clear();
  usePostStatsStore.getState().reset();
  api.recordPostViews.mockReset();
  api.recordPostViews.mockImplementation(async (ids: string[]) => ids);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("usePostViewTracker", () => {
  it("counts a post on screen for a second, after the flush delay", async () => {
    usePostStatsStore.getState().seed({
      id: "p1",
      likesCount: 0,
      commentsCount: 0,
      myReaction: null,
      viewsCount: 4,
    });
    const { getByTestId } = render(<Card ids={["p1"]} />);
    show(getByTestId("p1"), 0.6);

    await advance(VIEW_DWELL_MS);
    expect(api.recordPostViews).not.toHaveBeenCalled();
    await advance(VIEW_FLUSH_MS);

    expect(api.recordPostViews).toHaveBeenCalledWith(["p1"]);
    expect(usePostStatsStore.getState().stats.p1.viewsCount).toBe(5);
  });

  it("doesn't count a post scrolled past in under a second", async () => {
    const { getByTestId } = render(<Card ids={["p1"]} />);
    const el = getByTestId("p1");
    show(el, 0.8);
    await advance(VIEW_DWELL_MS - 100);
    show(el, 0);
    await advance(VIEW_DWELL_MS + VIEW_FLUSH_MS);
    expect(api.recordPostViews).not.toHaveBeenCalled();
  });

  it("doesn't count a post less than half on screen", async () => {
    const { getByTestId } = render(<Card ids={["p1"]} />);
    show(getByTestId("p1"), 0.3);
    await advance(VIEW_DWELL_MS + VIEW_FLUSH_MS);
    expect(api.recordPostViews).not.toHaveBeenCalled();
  });

  it("sends several posts in one batch, and each only once", async () => {
    const { getByTestId, unmount } = render(
      <>
        <Card ids={["p1"]} />
        <Card ids={["p2", "orig"]} />
      </>,
    );
    show(getByTestId("p1"), 1);
    show(getByTestId("p2,orig"), 1);
    await advance(VIEW_DWELL_MS + VIEW_FLUSH_MS);
    expect(api.recordPostViews).toHaveBeenCalledTimes(1);
    expect(api.recordPostViews).toHaveBeenCalledWith(["p1", "p2", "orig"]);
    unmount();

    // Seen again later in the session (e.g. in the detail modal).
    const again = render(<Card ids={["p1"]} />);
    expect(observed.has(again.getByTestId("p1"))).toBe(false);
  });

  it("does nothing when disabled (signed out, or the viewer's own post)", async () => {
    const { getByTestId } = render(<Card ids={["p1"]} enabled={false} />);
    expect(observed.has(getByTestId("p1"))).toBe(false);
  });
});
