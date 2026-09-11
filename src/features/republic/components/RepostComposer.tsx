"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { repostPost } from "@/shared/api/feed";
import type { FeedPost } from "../types";

interface RepostComposerProps {
  post: FeedPost;
  onClose: () => void;
}

// A repost is its own post (see feed.service.ts) pointing back at the
// original — this is just the small "add a caption" step before publishing
// it, same as Facebook's "Share to Feed" flow.
export function RepostComposer({ post, onClose }: RepostComposerProps) {
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await repostPost(post.id, caption);
      toast.success("Reposted to your feed!");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not repost this.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <h2 className="text-sm font-bold text-white">Repost</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something about this…"
            rows={3}
            autoFocus
            className="w-full resize-none bg-zinc-900 border border-zinc-800 focus:border-lime-400/60 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />

          <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-center gap-2.5">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
              {post.mediaUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.mediaUrls[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                post.author.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-200">
                {post.author.name}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {post.content?.trim() || "Shared a post"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 p-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-10 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {submitting ? "Reposting…" : "Repost to Feed"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
