"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
 * A video in a feed post. With `autoplay` it plays muted and loops while it's
 * the most visible video on screen, with a volume button at the bottom
 * right. Tapping the video itself still opens the full-screen viewer (the
 * parent's click); the volume button never does.
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const attach = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      ref(el);
    },
    [ref],
  );

  // React doesn't update `muted` after the first render, so set it directly.
  // A video that isn't autoplaying stays muted, as it always was.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = autoplaying ? muted : true;
  }, [muted, autoplaying]);

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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 cursor-pointer"
        >
          {muted ? (
            <VolumeX className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Volume2 className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      )}
    </>
  );
}
