"use client";

import { useEffect } from "react";
import { ComposePostBox } from "./ComposePostBox";

interface ComposePostModalProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

// Facebook-style "click the box, get a full compose modal" — same overlay
// pattern as PostDetailModal (esc-to-close, click-outside-to-close, locks
// body scroll) so the two modals in this feed feel consistent.
export function ComposePostModal({
  onClose,
  onPostCreated,
}: ComposePostModalProps) {
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
      <div className="relative min-h-screen w-full bg-zinc-950 sm:min-h-0 sm:max-h-[92vh] sm:w-full sm:max-w-2xl sm:overflow-y-auto sm:rounded-2xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:rounded-t-2xl sm:px-5">
          <h2 className="text-sm font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <ComposePostBox
            embedded
            onClose={onClose}
            onPostCreated={onPostCreated}
          />
        </div>
      </div>
    </div>
  );
}
