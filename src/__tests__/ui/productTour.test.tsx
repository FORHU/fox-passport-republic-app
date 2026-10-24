import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ProductTour, startTour } from "@/shared/components/ui/ProductTour";

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
