"use client";

import { useState, useEffect } from "react";
import { PostComment } from "../types";
import {
  getPostComments,
  addPostComment,
  deletePostComment,
} from "@/shared/api/feed";
import { useAuthStore } from "@/shared/auth/useAuthStore";

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentAdded?: () => void;
}

export function CommentSection({
  postId,
  onCommentAdded,
}: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getPostComments(postId)
      .then((data) => {
        if (mounted) setComments(data);
      })
      .catch((err) => {
        console.error("Failed to load comments:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    if (!user) {
      setError("Please log in to join the conversation");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const newComment = await addPostComment(postId, content.trim());
      setComments((prev) => [...prev, newComment]);
      setContent("");
      onCommentAdded?.();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deletePostComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  return (
    <div className="pt-3 border-t border-zinc-800/80 mt-3 space-y-3">
      {/* Existing flat comments */}
      {loading ? (
        <div className="py-2 text-center text-xs text-zinc-500">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-2 text-center text-xs text-zinc-500">
          No comments yet. Be the first to chime in!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((c) => {
            const isMyComment =
              user?.userId === c.authorId || user?.id === c.authorId;
            const initial = c.author.name
              ? c.author.name.charAt(0).toUpperCase()
              : "?";
            const dateStr = new Date(c.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={c.id}
                className="flex items-start justify-between gap-2.5 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/40 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lime-400 text-[11px] shrink-0">
                    {initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">
                        {c.author.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-zinc-300 mt-0.5 whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>

                {isMyComment && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete comment"
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      delete
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={user ? "Write a comment..." : "Log in to comment"}
          disabled={!user || submitting}
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-lime-400/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!user || !content.trim() || submitting}
          className="px-3.5 py-2 rounded-xl bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center gap-1"
        >
          {submitting ? "..." : "Send"}
          <span className="material-symbols-outlined text-[13px]">send</span>
        </button>
      </form>
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
