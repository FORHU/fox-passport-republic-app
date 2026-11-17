import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { isVideoUrl } from "@/shared/lib/media";

/** The ▶ marker over a video preview. Playback happens in ImageLightbox. */
export function VideoPlayBadge() {
  return (
    <div
      data-testid="video-play-badge"
      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20"
    >
      <div className="h-10 w-10 rounded-full bg-black/50 flex items-center justify-center">
        <PlayCircle className="h-6 w-6 text-white" strokeWidth={2} />
      </div>
    </div>
  );
}

interface MediaTileProps {
  url: string;
  /** For next/image: how wide the tile renders at each breakpoint. */
  sizes: string;
  /** Extra classes for the image or video, e.g. a hover zoom. */
  className?: string;
  /** Off when something else covers the tile, like the feed's "+N". */
  showPlayBadge?: boolean;
}

/**
 * One post media item, cropped to fill its parent. The parent sets the size
 * and must be `relative`. A video shows its first frame (muted, no controls)
 * with a ▶ badge, since an <img> can't display one.
 */
export function MediaTile({
  url,
  sizes,
  className = "",
  showPlayBadge = true,
}: MediaTileProps) {
  if (isVideoUrl(url)) {
    return (
      <>
        <video
          src={url}
          muted
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover ${className}`}
        />
        {showPlayBadge && <VideoPlayBadge />}
      </>
    );
  }
  return (
    <Image
      src={url}
      alt=""
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
    />
  );
}
