"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  EyeOff,
  Flag,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { deletePost, hidePost, toggleSavePost } from "@/shared/api/feed";
import { ReportModal } from "@/shared/components/ReportModal";
import type { FeedPost } from "../types";

interface PostOptionsMenuProps {
  post: FeedPost;
  isOwner: boolean;
  onEdit: () => void;
  /** Fires after a successful delete or hide — either way, this viewer
   * shouldn't see the post anymore. */
  onRemoved: (postId: string) => void;
  onCopyLink: () => void;
}

export function PostOptionsMenu({
  post,
  isOwner,
  onEdit,
  onRemoved,
  onCopyLink,
}: PostOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [saved, setSaved] = useState(post.isSavedByMe ?? false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggleSave = async () => {
    setOpen(false);
    try {
      const res = await toggleSavePost(post.id);
      setSaved(res.saved);
      toast.success(res.saved ? "Saved" : "Removed from saved");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not save this post.",
      );
    }
  };

  const handleHide = async () => {
    setOpen(false);
    setBusy(true);
    try {
      await hidePost(post.id);
      toast("Post hidden", {
        description: "You'll see fewer posts like this.",
      });
      onRemoved(post.id);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not hide this post.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setOpen(false);
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deletePost(post.id);
      toast.success("Post deleted");
      onRemoved(post.id);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not delete this post.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-label="Post options"
        className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20 py-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCopyLink();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Copy Link
          </button>
          <button
            type="button"
            onClick={handleToggleSave}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Bookmark
              className="w-4 h-4"
              fill={saved ? "currentColor" : "none"}
            />
            {saved ? "Unsave" : "Save Post"}
          </button>

          {isOwner ? (
            <>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Post
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleHide}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                Hide Post
              </button>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowReport(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report Post
              </button>
            </>
          )}
        </div>
      )}

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
