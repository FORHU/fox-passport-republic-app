"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { VideoPlayBadge } from "@/shared/components/ui/MediaTile";
import { useFeedVideoAutoplay } from "../hooks/useFeedVideoAutoplay";
import { useFeedVideoSound } from "../store/useFeedVideoSound";

interface FeedVideoProps {
  url: string;
  /** Classes for the `<video>`; its parent must be `relative`. */
  className?: string;
  /** Play by itself while on screen (the Republic feed). Off: a still frame
   * with the ▶ badge, as before. */
  autoplay?: boolean;
  /** Off when something else covers the video, like the grid's "+N". */
  showPlayBadge?: boolean;
}

/**
 * A drag on the volume slider that's let go over the video ends in a click on
 * the tile (the nearest element under both ends), which would open the viewer.
 * Swallow the click that ends the drag, wherever it lands.
 */
function swallowClickEndingDrag() {
  const swallow = (e: MouseEvent) => e.stopPropagation();
  const done = () => {
    // The click comes right after pointerup; drop the guard just after, in
    // case none comes, so the next real click isn't lost.
    setTimeout(() =>
      window.removeEventListener("click", swallow, { capture: true }),
    );
    window.removeEventListener("pointerup", done);
    window.removeEventListener("pointercancel", done);
  };
  window.addEventListener("click", swallow, { capture: true, once: true });
  window.addEventListener("pointerup", done);
  window.addEventListener("pointercancel", done);
}

/**
 * A video in a feed post. With `autoplay` it plays muted and loops while it's
 * the most visible video on screen, with a mute button at the bottom right.
 * With a mouse, hovering or focusing the button also shows a volume slider
 * above it. Tapping the video itself still opens the full-screen viewer (the
 * parent's click); the button and slider never do.
 */
export function FeedVideo({
  url,
  className,
  autoplay = false,
  showPlayBadge = true,
}: FeedVideoProps) {
  const { ref, autoplaying } = useFeedVideoAutoplay(autoplay);
  const muted = useFeedVideoSound((s) => s.muted);
  const setMuted = useFeedVideoSound((s) => s.setMuted);
  const volume = useFeedVideoSound((s) => s.volume);
  const setVolume = useFeedVideoSound((s) => s.setVolume);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const attach = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      ref(el);
    },
    [ref],
  );

  // React doesn't update `muted` after the first render, and has no `volume`
  // prop, so set both directly. A video that isn't autoplaying stays muted,
  // as it always was.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = autoplaying ? muted : true;
    el.volume = volume;
  }, [muted, volume, autoplaying]);

  const VolumeIcon = muted ? VolumeX : volume <= 0.5 ? Volume1 : Volume2;

  return (
    <>
      <video
        ref={attach}
        src={url}
        muted
        loop={autoplaying}
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={className}
      />
      {showPlayBadge && !playing && <VideoPlayBadge />}
      {autoplaying && (
        // Named group: the grid tile around it already uses `group` for its
        // hover zoom. Clicks anywhere in here never reach the viewer.
        <div
          className="group/volume absolute bottom-2 right-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mouse only (iOS ignores a script's volume; touch keeps the
              toggle). The padding bridges the gap so hover isn't lost on the
              way up from the button. */}
          <div className="absolute bottom-full left-1/2 hidden -translate-x-1/2 pb-1 pointer-fine:group-focus-within/volume:block pointer-fine:group-hover/volume:block">
            <div className="flex h-24 w-8 items-center justify-center rounded-full bg-black/60 py-3 backdrop-blur-sm">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                onPointerDown={swallowClickEndingDrag}
                aria-label="Volume"
                className="h-full w-4 cursor-pointer accent-white [direction:rtl] [writing-mode:vertical-lr]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 cursor-pointer"
          >
            <VolumeIcon className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}
    </>
  );
}
