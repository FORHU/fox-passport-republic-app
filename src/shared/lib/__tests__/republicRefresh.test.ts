import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  onRepublicRefresh,
  requestRepublicRefresh,
  takePendingRepublicRefresh,
} from "../republic-refresh";

/**
 * app#308: clicking Republic in the nav refreshes the feed. Heard live while
 * the feed is open; taken once on mount when clicked from another page.
 */
describe("republic refresh signal", () => {
  beforeEach(() => {
    takePendingRepublicRefresh(); // start clean
  });

  it("reaches an open feed at once, and leaves nothing pending", () => {
    const fn = vi.fn();
    const off = onRepublicRefresh(fn);
    requestRepublicRefresh();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(takePendingRepublicRefresh()).toBe(false);
    off();
  });

  it("waits for a feed that isn't open yet, and is taken only once", () => {
    requestRepublicRefresh();
    expect(takePendingRepublicRefresh()).toBe(true);
    expect(takePendingRepublicRefresh()).toBe(false);
  });

  it("stops after unsubscribing", () => {
    const fn = vi.fn();
    onRepublicRefresh(fn)();
    requestRepublicRefresh();
    expect(fn).not.toHaveBeenCalled();
  });
});
