import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  ProductTour,
  startTour,
  TourHeaderButton,
} from "@/shared/components/ui/ProductTour";

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (
    selector: (s: {
      user: { id: string };
      isLoading: boolean;
      isOpen: boolean;
    }) => unknown,
  ) => selector({ user: { id: "u1" }, isLoading: false, isOpen: false }),
}));

const KEY = "test-tour";
const STEPS = [
  { title: "Welcome", body: "A quick look around." },
  { target: "stats", title: "Your numbers", body: "Bookings at a glance." },
  { target: "list", title: "Your list", body: "Everything you run." },
];

/**
 * The tour's Skip, Back and Next live in one bar fixed to the bottom of the
 * screen rather than inside the step card that moves to each element.
 */
describe("ProductTour controls", () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom lays nothing out; the tour skips steps whose target has no size.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      left: 100,
      width: 200,
      height: 80,
    } as DOMRect);
    HTMLElement.prototype.scrollIntoView = vi.fn();
    render(
      <>
        <div data-tour="stats" />
        <div data-tour="list" />
        <ProductTour tourKey={KEY} steps={STEPS} autoStart={false} />
      </>,
    );
    act(() => startTour(KEY));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const prev = () => screen.getByRole("button", { name: "Previous step" });

  it("groups Skip, Previous and Next, with Previous off on the first step", () => {
    expect(screen.getByRole("button", { name: "Skip tour" })).toBeTruthy();
    expect(prev()).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Next step" })).toBeTruthy();
  });

  it("steps forward and back", async () => {
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(await screen.findByText("Step 2 of 3")).toBeTruthy();
    expect(prev()).toHaveProperty("disabled", false);
    fireEvent.click(prev());
    expect(await screen.findByText("Step 1 of 3")).toBeTruthy();
  });

  it("finishes from the last step and remembers it was seen", async () => {
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    await screen.findByText("Step 2 of 3");
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    await screen.findByText("Step 3 of 3");
    fireEvent.click(screen.getByRole("button", { name: "Finish tour" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem(`fp-tour-seen:u1:${KEY}`)).toBe("1");
  });

  it("closes on Skip and on Escape", () => {
    fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    act(() => startTour(KEY));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

/**
 * One "Take the tour" button in the shared top bar (app#366): it plays the
 * tour of whichever page is open, and isn't there on pages without one.
 */
describe("TourHeaderButton", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      left: 100,
      width: 200,
      height: 80,
    } as DOMRect);
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const button = () => screen.queryByRole("button", { name: "Take the tour" });

  it("is not shown on a page without a tour", () => {
    render(<TourHeaderButton />);
    expect(button()).toBeNull();
  });

  it("starts the page's tour, and goes when the page does", () => {
    const { rerender } = render(
      <>
        <TourHeaderButton />
        <div data-tour="stats" />
        <ProductTour tourKey={KEY} steps={STEPS} autoStart={false} />
      </>,
    );
    fireEvent.click(button()!);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Step 1 of 2")).toBeTruthy();

    rerender(<TourHeaderButton />);
    expect(button()).toBeNull();
  });
});

describe("ProductTour on a phone", () => {
  const { innerWidth, innerHeight } = window;

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Object.assign(window, { innerWidth, innerHeight });
  });

  // The step card docks above the control bar, unless the element it points
  // at is down there too (e.g. the map's fixed List/Map toggle).
  it.each([
    [200, true],
    [700, false],
  ])("element at top %i: card docked at the bottom is %s", (top, bottom) => {
    Object.assign(window, { innerWidth: 390, innerHeight: 800 });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top,
      left: 100,
      width: 200,
      height: 48,
    } as DOMRect);
    HTMLElement.prototype.scrollIntoView = vi.fn();
    render(
      <>
        <div data-tour="stats" />
        <ProductTour tourKey={KEY} steps={[STEPS[1]]} autoStart={false} />
      </>,
    );
    act(() => startTour(KEY));
    const card = screen.getByText("Step 1 of 1").parentElement!;
    expect(card.style.bottom !== "").toBe(bottom);
  });
});

describe("ProductTour scrolling", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // A feed or results list taller than the screen is shown from its start,
  // not scrolled to somewhere in its middle.
  it.each([
    [80, "center"],
    [5000, "start"],
  ])("element %ipx tall scrolls to its %s", (height, block) => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      left: 100,
      width: 200,
      height,
    } as DOMRect);
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    render(
      <>
        <div data-tour="stats" />
        <ProductTour tourKey={KEY} steps={[STEPS[1]]} autoStart={false} />
      </>,
    );
    act(() => startTour(KEY));
    expect(scroll).toHaveBeenCalledWith({ block });
  });
});
