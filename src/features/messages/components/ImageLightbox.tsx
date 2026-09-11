/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
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
// through the rest of the gallery, click-outside/Escape to close. Handles
// video the same as images (native <video controls> instead of <img>).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {index + 1} / {urls.length}
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
