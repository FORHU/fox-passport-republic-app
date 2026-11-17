"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PublicCitizenProfile } from "@/shared/api/citizen";
import { isVideoUrl } from "@/shared/lib/media";

export type CitizenPost = NonNullable<PublicCitizenProfile["posts"]>[number];

// A swipe past this many pixels changes the item (or post), same as
// ImageLightbox.
const SWIPE_THRESHOLD_PX = 50;

interface ProfilePostViewerProps {
  /** The profile's media posts, in grid order. */
  posts: CitizenPost[];
  startIndex: number;
  onClose: () => void;
}

/**
 * Opens a profile post in place, so the visitor stays on the profile: the
 * media on top, and the description and counts below, like TikTok. The ◀ ▶
 * buttons step through the posts; a post with several items gets dots to
 * flip through its own items.
 */
export function ProfilePostViewer({
  posts,
  startIndex,
  onClose,
}: ProfilePostViewerProps) {
  const [postIndex, setPostIndex] = useState(startIndex);
  const [itemIndex, setItemIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const post = posts[postIndex];
  const urls = post?.mediaUrls ?? [];
  const url = urls[itemIndex] ?? urls[0];
  const hasPrev = postIndex > 0;
  const hasNext = postIndex < posts.length - 1;

  const goToPost = (i: number) => {
    if (i < 0 || i >= posts.length) return;
    setPostIndex(i);
    setItemIndex(0);
  };
  const goPrev = () => goToPost(postIndex - 1);
  const goNext = () => goToPost(postIndex + 1);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && postIndex > 0) {
        setPostIndex(postIndex - 1);
        setItemIndex(0);
      }
      if (e.key === "ArrowRight" && postIndex < posts.length - 1) {
        setPostIndex(postIndex + 1);
        setItemIndex(0);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, postIndex, posts.length]);

  // Swipe flips through a post's own items first; a single-item post swipes
  // to the next or previous post.
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    // Dragging the video's seek bar is not a swipe.
    touchStartX.current =
      (e.target as HTMLElement).tagName === "VIDEO"
        ? null
        : e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    const step = delta < 0 ? 1 : -1;
    if (urls.length > 1) {
      setItemIndex((i) => (i + step + urls.length) % urls.length);
    } else if (step > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  if (!mounted || !post) return null;

  const description = post.content?.trim() ?? "";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={description ? `Post: ${description.slice(0, 60)}` : "Post"}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous post"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">
            chevron_left
          </span>
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Next post"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">
            chevron_right
          </span>
        </button>
      )}

      <div className="flex w-full max-w-lg flex-col px-14 sm:px-0 max-h-[100dvh] py-16 sm:py-10">
        {/* Media */}
        <div className="flex min-h-0 flex-col items-center">
          {isVideoUrl(url) ? (
            <video
              key={url}
              src={url}
              controls
              autoPlay
              playsInline
              className="max-h-[60vh] w-full rounded-xl bg-black object-contain"
            />
          ) : (
            // A plain <img>, as in ImageLightbox: one on-demand full view,
            // sized to the image's own bounds. The zinc backing (as on the
            // grid tile) keeps a dark logo on a transparent PNG visible.
            <img
              key={url}
              src={url}
              alt=""
              className="max-h-[60vh] w-full rounded-xl bg-zinc-900 object-contain"
            />
          )}
          {urls.length > 1 && (
            <div className="mt-3 flex items-center gap-1.5">
              {urls.map((u, i) => (
                <button
                  key={u + i}
                  type="button"
                  onClick={() => setItemIndex(i)}
                  aria-label={`Show item ${i + 1}`}
                  aria-current={i === itemIndex}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === itemIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Caption: description, then the counts */}
        <div className="mt-4 min-h-0 overflow-y-auto text-white">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 font-bold uppercase text-[10px]">
              {post.type.replace(/_/g, " ")}
            </span>
            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {description && (
            <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-100">
              {post.content}
            </p>
          )}
          <div className="mt-3 flex items-center gap-5 text-sm text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">
                favorite
              </span>
              <span data-testid="viewer-likes">{post.likesCount}</span>
              <span className="sr-only">likes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">
                chat_bubble
              </span>
              <span data-testid="viewer-comments">{post.commentsCount}</span>
              <span className="sr-only">comments</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
