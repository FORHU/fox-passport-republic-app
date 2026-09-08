"use client";

import { useEffect } from "react";
import { FeedPost } from "../types";
import { PostCard } from "./PostCard";

interface PostDetailModalProps {
  post: FeedPost;
  onClose: () => void;
  onPostDeleted?: (id: string) => void;
}

// Facebook-style "click a post, see it full-screen with comments" modal.
// Reuses PostCard itself (variant="modal") rather than re-implementing the
// post body/embed rendering — it just forces comments open and disables the
// click-to-open behavior so clicking inside doesn't try to open a second
// copy of itself.
export function PostDetailModal({
  post,
  onClose,
  onPostDeleted,
}: PostDetailModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative min-h-screen w-full bg-zinc-950 sm:min-h-0 sm:max-h-[94vh] sm:w-full sm:max-w-3xl sm:overflow-y-auto sm:rounded-2xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:rounded-t-2xl sm:px-5">
          <h2 className="text-sm font-bold text-white">Post</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <PostCard post={post} variant="modal" onPostDeleted={onPostDeleted} />
        </div>
      </div>
    </div>
  );
}
