import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useFeedVideoSound } from "@/features/republic/store/useFeedVideoSound";
import { __resetFeedVideoAutoplay } from "@/features/republic/hooks/useFeedVideoAutoplay";
import { FeedVideo } from "../FeedVideo";

/** A feed video's volume button (app#385 follow-up): bottom right, starts
 * muted, and the choice carries to the next video. It never opens the viewer. */

class FakeIO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIO);
  __resetFeedVideoAutoplay();
  useFeedVideoSound.setState({ muted: true });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

  it("without autoplay, stays a muted still with the play badge", () => {
    useFeedVideoSound.setState({ muted: false });
    const { container } = render(<FeedVideo url="https://cdn.test/a.mp4" />);
    expect(screen.queryByRole("button", { name: /mute/i })).toBeNull();
    expect(screen.getByTestId("video-play-badge")).toBeTruthy();
    expect(video(container).muted).toBe(true);
  });
});
