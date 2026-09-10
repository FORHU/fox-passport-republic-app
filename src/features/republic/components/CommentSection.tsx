"use client";

import { useState, useEffect } from "react";
import { Heart, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PostComment } from "../types";
import {
  getPostComments,
  addPostComment,
  deletePostComment,
  toggleCommentLike,
} from "@/shared/api/feed";
import { useAuthStore } from "@/shared/auth/useAuthStore";

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentAdded?: () => void;
}

function isMine(user: any, authorId: string) {
  return user?.userId === authorId || user?.id === authorId;
}

function CommentRow({
  comment,
  postId,
  isReply,
  onDeleted,
  onReply,
}: {
  comment: PostComment;
  postId: string;
  isReply: boolean;
  onDeleted: (id: string) => void;
  onReply?: (comment: PostComment) => void;
}) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(comment.isLikedByMe ?? false);
  const [likesCount, setLikesCount] = useState(comment.likesCount ?? 0);
  const [deleting, setDeleting] = useState(false);

  const initial = comment.author.name
    ? comment.author.name.charAt(0).toUpperCase()
    : "?";
  const dateStr = new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await toggleCommentLike(postId, comment.id);
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch {
      setLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      toast.error("Could not like this comment.");
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deletePostComment(postId, comment.id);
      onDeleted(comment.id);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={isReply ? "ml-8" : ""}>
      <div className="flex items-start justify-between gap-2.5 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/40 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lime-400 text-[11px] shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">
                {comment.author.name}
              </span>
              <span className="text-[10px] text-zinc-500">{dateStr}</span>
            </div>
            <p className="text-zinc-300 mt-0.5 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
                  liked ? "text-rose-400" : "text-zinc-500 hover:text-white"
                }`}
              >
                <Heart
                  className="h-3 w-3"
                  strokeWidth={2}
                  fill={liked ? "currentColor" : "none"}
                />
                {likesCount > 0 ? likesCount : "Like"}
              </button>
              {!isReply && onReply && (
                <button
                  type="button"
                  onClick={() => onReply(comment)}
                  className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>

        {isMine(user, comment.authorId) && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete comment"
            className="text-zinc-500 hover:text-rose-400 transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
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
  const [replyTarget, setReplyTarget] = useState<PostComment | null>(null);

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
      const newComment = await addPostComment(
        postId,
        content.trim(),
        replyTarget?.id,
      );
      if (replyTarget) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTarget.id
              ? { ...c, replies: [...(c.replies ?? []), newComment] }
              : c,
          ),
        );
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      setContent("");
      setReplyTarget(null);
      onCommentAdded?.();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleted = (id: string, parentId?: string) => {
    setComments((prev) => {
      if (parentId) {
        return prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== id) }
            : c,
        );
      }
      return prev.filter((c) => c.id !== id);
    });
  };

  return (
    <div className="pt-3 border-t border-zinc-800/80 mt-3 space-y-3">
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
          {comments.map((c) => (
            <div key={c.id} className="space-y-2">
              <CommentRow
                comment={c}
                postId={postId}
                isReply={false}
                onDeleted={(id) => handleDeleted(id)}
                onReply={setReplyTarget}
              />
              {(c.replies ?? []).map((r) => (
                <CommentRow
                  key={r.id}
                  comment={r}
                  postId={postId}
                  isReply
                  onDeleted={(id) => handleDeleted(id, c.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mt-2 space-y-1.5">
        {replyTarget && (
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>
              Replying to{" "}
              <span className="font-bold text-zinc-300">
                {replyTarget.author.name}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setReplyTarget(null)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              user
                ? replyTarget
                  ? "Write a reply..."
                  : "Write a comment..."
                : "Log in to comment"
            }
            disabled={!user || submitting}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-lime-400/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!user || !content.trim() || submitting}
            className="px-3.5 py-2 rounded-xl bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center gap-1"
          >
            {submitting ? "..." : "Send"}
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </form>
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
