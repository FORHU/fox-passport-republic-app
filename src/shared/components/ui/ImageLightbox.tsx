"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { toast } from "sonner";
import { MediaTagOverlay } from "@/shared/components/ui/MediaTagOverlay";
import type { MediaTag } from "@/shared/types/feed";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];
const isVideoUrl = (url: string) => {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
};

// A swipe past this many pixels commits to a prev/next, rather than
// snapping back — matches the feel of a native mobile gallery without
// pulling in a carousel library.
const SWIPE_THRESHOLD_PX = 50;

interface ImageLightboxProps {
  /** Accepts either a single url (chat attachments) or the full gallery
   * (feed posts) — passing the whole array lets prev/next stay within it. */
  urls: string[];
  startIndex?: number;
  onClose: () => void;
  /** Feed posts only — chat attachments never carry tags, so this is
   * omitted there and the overlay simply doesn't render. */
  tagsByUrl?: MediaTag[];
}

// Full-screen media viewer — blurred backdrop, download button, prev/next
// through the rest of the gallery (via arrow buttons, arrow keys, or a
// touch swipe), click-outside/Escape to close. Handles video the same as
// images (native <video controls> instead of <img>). Lives under shared/
// (not a features/* folder) since it's genuinely feature-agnostic — used by
// both the messages feature (chat attachments) and the republic feature
// (post photo galleries), and neither may import the other's code directly.
export function ImageLightbox({
  urls,
  startIndex = 0,
  onClose,
  tagsByUrl,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => setMounted(true), []);

  const url = urls[index];
  const hasMultiple = urls.length > 1;

  const goPrev = () => setIndex((i) => (i - 1 + urls.length) % urls.length);
  const goNext = () => setIndex((i) => (i + 1) % urls.length);

  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD_PX) goPrev();
    else if (delta < -SWIPE_THRESHOLD_PX) goNext();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (hasMultiple && e.key === "ArrowLeft") goPrev();
      if (hasMultiple && e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, hasMultiple]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // A plain <a download> is ignored cross-origin (MinIO/S3 is a
      // different origin from the app) — fetching the bytes ourselves and
      // downloading from a same-origin blob URL works regardless of host.
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop()?.split("?")[0] || "media";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Could not download this file.");
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Download"
          className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
            {urls.map((u, i) => (
              <button
                key={u + i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {isVideoUrl(url) ? (
        <video
          src={url}
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl"
        />
      ) : (
        <div
          className="relative max-h-[85vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Deliberately a plain <img>, not next/image: this is a single
              on-demand full-view image (not a list rendering many at once),
              and next/image's `fill` would need a fixed-size ancestor,
              which would grow this div's click-catching hitbox past the
              image's real letterboxed bounds and swallow backdrop clicks
              that should close the lightbox. The real fix for large images
              here is at the upload source (S3Svc.optimizeImage resizes to
              1600px/WebP), which already applies regardless of this tag. */}
          <img
            src={url}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
          <MediaTagOverlay
            tags={tagsByUrl?.filter((t) => t.mediaUrl === url) ?? []}
            defaultRevealed
          />
        </div>
      )}
    </div>,
    document.body,
  );
}
