import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useFeedVideoSound } from "@/features/republic/store/useFeedVideoSound";
import { __resetFeedVideoAutoplay } from "@/features/republic/hooks/useFeedVideoAutoplay";
import { FeedVideo } from "../FeedVideo";

/** A feed video's volume button (app#385 follow-up): bottom right, starts
 * muted, and the choice carries to the next video. With a mouse, a volume
 * slider sits above it (hidden by CSS on touch, so jsdom always finds it).
 * Neither opens the viewer. */

class FakeIO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIO);
  __resetFeedVideoAutoplay();
  useFeedVideoSound.setState({ muted: true, volume: 1 });
  localStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const video = (container: HTMLElement) =>
  container.querySelector("video") as HTMLVideoElement;

describe("FeedVideo", () => {
  it("starts muted, looping and inline", async () => {
    const { container } = render(<FeedVideo url="https://cdn.test/a.mp4" autoplay />);
    expect(await screen.findByRole("button", { name: "Unmute" })).toBeTruthy();
    expect(video(container).muted).toBe(true);
    expect(video(container).loop).toBe(true);
    expect(video(container).hasAttribute("playsinline")).toBe(true);
  });

  it("unmutes, and the next video starts with sound", async () => {
    const onOpen = vi.fn();
    const { container } = render(
      <div onClick={onOpen}>
        <FeedVideo url="https://cdn.test/a.mp4" autoplay />
      </div>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Unmute" }));
    expect(onOpen).not.toHaveBeenCalled();
    expect(useFeedVideoSound.getState().muted).toBe(false);
    expect(video(container).muted).toBe(false);
    expect(screen.getByRole("button", { name: "Mute" })).toBeTruthy();

    const next = render(<FeedVideo url="https://cdn.test/b.mp4" autoplay />);
    expect(video(next.container).muted).toBe(false);
  });

  it("sets the volume from the slider, unmuting, without opening the viewer", async () => {
    const onOpen = vi.fn();
    const { container } = render(
      <div onClick={onOpen}>
        <FeedVideo url="https://cdn.test/a.mp4" autoplay />
      </div>,
    );
    const slider = (await screen.findByRole("slider", {
      name: "Volume",
    })) as HTMLInputElement;
    expect(slider.value).toBe("0");

    fireEvent.change(slider, { target: { value: "0.4" } });
    fireEvent.click(slider);
    expect(onOpen).not.toHaveBeenCalled();
    expect(useFeedVideoSound.getState()).toMatchObject({
      muted: false,
      volume: 0.4,
    });
    expect(video(container).muted).toBe(false);
    expect(video(container).volume).toBe(0.4);
    expect(slider.value).toBe("0.4");
    expect(screen.getByRole("button", { name: "Mute" })).toBeTruthy();
  });

  it("mutes at 0 and unmuting brings the last volume back", async () => {
    useFeedVideoSound.setState({ muted: false, volume: 0.6 });
    const { container } = render(<FeedVideo url="https://cdn.test/a.mp4" autoplay />);
    const slider = (await screen.findByRole("slider", {
      name: "Volume",
    })) as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "0" } });
    expect(useFeedVideoSound.getState()).toMatchObject({ muted: true, volume: 0.6 });
    expect(video(container).muted).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Unmute" }));
    expect(slider.value).toBe("0.6");
    expect(video(container).volume).toBe(0.6);
  });

  it("a slider drag let go over the video doesn't open the viewer", async () => {
    const onOpen = vi.fn();
    render(
      <div data-testid="tile" onClick={onOpen}>
        <FeedVideo url="https://cdn.test/a.mp4" autoplay />
      </div>,
    );
    const slider = await screen.findByRole("slider", { name: "Volume" });
    const tile = screen.getByTestId("tile");
    vi.useFakeTimers({ toFake: ["setTimeout"] });

    // The click that ends the drag lands on the tile.
    fireEvent.pointerDown(slider);
    fireEvent.pointerUp(tile);
    fireEvent.click(tile);
    expect(onOpen).not.toHaveBeenCalled();

    // A drag that ends with no click doesn't eat the next real one.
    fireEvent.pointerDown(slider);
    fireEvent.pointerUp(tile);
    vi.runAllTimers();
    fireEvent.click(tile);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps the volume in this browser, but not the unmute", () => {
    useFeedVideoSound.getState().setVolume(0.3);
    const saved = JSON.parse(localStorage.getItem("feed-video-volume") ?? "{}");
    expect(saved.state).toEqual({ volume: 0.3 });
  });

  it("ignores a saved volume the video can't take", async () => {
    for (const bad of [0, 2, "loud", null]) {
      useFeedVideoSound.setState({ volume: 1 });
      localStorage.setItem(
        "feed-video-volume",
        JSON.stringify({ state: { volume: bad }, version: 0 }),
      );
      await useFeedVideoSound.persist.rehydrate();
      expect(useFeedVideoSound.getState().volume).toBe(1);
    }
    localStorage.setItem(
      "feed-video-volume",
      JSON.stringify({ state: { volume: 0.25 }, version: 0 }),
    );
    await useFeedVideoSound.persist.rehydrate();
    expect(useFeedVideoSound.getState().volume).toBe(0.25);
  });

  it("without autoplay, stays a muted still with the play badge", () => {
    useFeedVideoSound.setState({ muted: false });
    const { container } = render(<FeedVideo url="https://cdn.test/a.mp4" />);
    expect(screen.queryByRole("button", { name: /mute/i })).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.getByTestId("video-play-badge")).toBeTruthy();
    expect(video(container).muted).toBe(true);
  });
});
