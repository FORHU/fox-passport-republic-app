import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, screen } from "@testing-library/react";
import { useFeedVideoSound } from "@/features/republic/store/useFeedVideoSound";
import {
  useFeedVideoAutoplay,
  useSuspendFeedAutoplay,
  __resetFeedVideoAutoplay,
} from "../useFeedVideoAutoplay";

/** app#385 follow-up: like Instagram, the most visible feed video (at least
 * half on screen) plays by itself; every other one pauses. */

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let ioCallback: IOCallback = () => {};

class FakeIO {
  constructor(cb: IOCallback) {
    ioCallback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom has no media playback: track it here.
const playing = new Set<HTMLMediaElement>();
let playImpl: (el: HTMLMediaElement) => Promise<void>;

function Video({ id, enabled = true }: { id: string; enabled?: boolean }) {
  const { ref, autoplaying } = useFeedVideoAutoplay(enabled);
  return (
    <video data-testid={id} data-autoplaying={String(autoplaying)} ref={ref} />
  );
}

function Overlay({ open }: { open: boolean }) {
  useSuspendFeedAutoplay(open);
  return null;
}

const show = (id: string, ratio: number) =>
  act(() =>
    ioCallback([
      {
        target: screen.getByTestId(id),
        isIntersecting: ratio > 0,
        intersectionRatio: ratio,
      },
    ]),
  );

const isPlaying = (id: string) =>
  playing.has(screen.getByTestId(id) as HTMLMediaElement);

const setVisibility = (state: "visible" | "hidden") => {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
};

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIO);
  __resetFeedVideoAutoplay();
  playing.clear();
  useFeedVideoSound.setState({ muted: true });
  playImpl = async () => {};
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(
    function (this: HTMLMediaElement) {
      return !playing.has(this);
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    playing.add(this);
    return playImpl(this);
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    playing.delete(this);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useFeedVideoAutoplay", () => {
  it("plays a video once half of it is on screen, and pauses it after", () => {
    render(<Video id="a" />);
    expect(screen.getByTestId("a").dataset.autoplaying).toBe("true");

    show("a", 0.3);
    expect(isPlaying("a")).toBe(false);
    show("a", 0.6);
    expect(isPlaying("a")).toBe(true);
    show("a", 0.2);
    expect(isPlaying("a")).toBe(false);
  });

  it("plays only the most visible video", () => {
    render(
      <>
        <Video id="a" />
        <Video id="b" />
      </>,
    );
    show("a", 0.6);
    show("b", 0.9);
    expect(isPlaying("b")).toBe(true);
    expect(isPlaying("a")).toBe(false);

    show("b", 0.1);
    expect(isPlaying("a")).toBe(true);
  });

  it("waits while an overlay is open, then resumes", () => {
    const { rerender } = render(
      <>
        <Video id="a" />
        <Overlay open={false} />
      </>,
    );
    show("a", 1);
    rerender(
      <>
        <Video id="a" />
        <Overlay open />
      </>,
    );
    expect(isPlaying("a")).toBe(false);
    rerender(
      <>
        <Video id="a" />
        <Overlay open={false} />
      </>,
    );
    expect(isPlaying("a")).toBe(true);
  });

  it("pauses while the tab is hidden", () => {
    render(<Video id="a" />);
    show("a", 1);
    setVisibility("hidden");
    expect(isPlaying("a")).toBe(false);
    setVisibility("visible");
    expect(isPlaying("a")).toBe(true);
  });

  it("falls back to muted when sound is refused", async () => {
    useFeedVideoSound.setState({ muted: false });
    playImpl = async (el) => {
      if (!el.muted) {
        playing.delete(el);
        throw Object.assign(new Error("no"), { name: "NotAllowedError" });
      }
    };
    render(<Video id="a" />);
    (screen.getByTestId("a") as HTMLVideoElement).muted = false;
    show("a", 1);
    await act(async () => {});
    expect(useFeedVideoSound.getState().muted).toBe(true);
    expect(isPlaying("a")).toBe(true);
  });

  it("doesn't autoplay for reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true }) as unknown as MediaQueryList),
    );
    render(<Video id="a" />);
    expect(screen.getByTestId("a").dataset.autoplaying).toBe("false");
    show("a", 1);
    expect(isPlaying("a")).toBe(false);
  });

  it("doesn't autoplay when the browser saves data", () => {
    vi.spyOn(window, "navigator", "get").mockReturnValue({
      ...navigator,
      connection: { saveData: true },
    } as Navigator);
    render(<Video id="a" />);
    expect(screen.getByTestId("a").dataset.autoplaying).toBe("false");
  });

  it("does nothing where it's turned off", () => {
    render(<Video id="a" enabled={false} />);
    expect(screen.getByTestId("a").dataset.autoplaying).toBe("false");
    show("a", 1);
    expect(isPlaying("a")).toBe(false);
  });
});
