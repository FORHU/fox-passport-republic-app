"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Handshake,
  MessageCircle,
  PlayCircle,
  Pin,
  Repeat2,
  Send,
  Share2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { FeedPost, ReactionType } from "../types";
import { AuthorPassportPopover } from "./AuthorPassportPopover";
import { CommentSection } from "./CommentSection";
import { ReactionButton } from "./ReactionButton";
import { PostOptionsMenu } from "./PostOptionsMenu";
import { RepostComposer } from "./RepostComposer";
import { MediaTagOverlay } from "@/shared/components/ui/MediaTagOverlay";
import { setPostReaction, editPost } from "@/shared/api/feed";
import { renderUsernameMentions } from "@/shared/lib/mentions";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { Badge } from "@/shared/components/ui/badge";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];
const isVideoUrl = (url: string) => {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
};

interface PostCardProps {
  post: FeedPost;
  onPostDeleted?: (id: string) => void;
  /** "feed" (default): content/media/comment-count open the detail modal via
   * onOpenDetail. "modal": rendered inside PostDetailModal itself — clicking
   * the post again would be pointless, and comments should already be open. */
  variant?: "feed" | "modal";
  onOpenDetail?: (post: FeedPost) => void;
  onMessageFoxerClick?: (params: {
    authorId: string;
    authorName: string;
    authorImgId?: string | null;
    contextLabel: string;
    contextType: string;
    contextId: string;
  }) => void;
  renderShareModal?: (postToShare: any, onClose: () => void) => React.ReactNode;
  renderImageLightbox?: (
    urls: string[],
    startIndex: number,
    tagsByUrl: any,
    onClose: () => void,
  ) => React.ReactNode;
}

export function PostCard({
  post,
  onOpenDetail,
  onPostDeleted,
  variant = "feed",
  onMessageFoxerClick,
  renderShareModal,
  renderImageLightbox,
}: PostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [myReaction, setMyReaction] = useState<ReactionType | null>(
    post.myReaction ?? (post.isLikedByMe ? "like" : null),
  );
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(variant === "modal");
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [textExpanded, setTextExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editedAt, setEditedAt] = useState(post.editedAt ?? null);
  const [content, setContent] = useState(post.content);
  const [removed, setRemoved] = useState(false);

  const handleReact = async (type: ReactionType | null) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const prevReaction = myReaction;
    const prevCount = likesCount;

    // Optimistic update
    setMyReaction(type);
    setLikesCount((prev) => {
      if (prevReaction && !type) return Math.max(0, prev - 1);
      if (!prevReaction && type) return prev + 1;
      return prev;
    });

    try {
      const res = await setPostReaction(post.id, type);
      setMyReaction(res.reaction);
      setLikesCount(res.likesCount);
    } catch (err) {
      setMyReaction(prevReaction);
      setLikesCount(prevCount);
      console.error("Reaction failed:", err);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/republic?postId=${post.id}`;
    try {
      if (!navigator?.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link. Copy it manually: " + url);
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.error("Post content cannot be empty.");
      return;
    }
    try {
      const updated = await editPost(post.id, { content: trimmed });
      setContent(updated.content);
      setEditedAt(updated.editedAt ?? new Date().toISOString());
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not save changes.");
    }
  };

  const handleSendClick = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setShowShareModal(true);
  };

  // Opens the chat panel directly (no page navigation) and attaches
  // whichever specific listing/event the clicked button came from as the
  // conversation's context, instead of just the generic post.
  const handleMessageFoxer = (
    contextLabel: string,
    contextType: string,
    contextId: string,
  ) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    onMessageFoxerClick?.({
      authorId: post.author.id,
      authorName: post.author.name,
      authorImgId: post.author.imgId,
      contextLabel,
      contextType,
      contextId,
    });
  };

  const handleRemoved = (postId: string) => {
    setRemoved(true);
    onPostDeleted?.(postId);
  };

  const isOwner =
    !!user &&
    ((user as any).id === post.authorId ||
      (user as any).userId === post.authorId);
  const isPartnerPost = post.type === "partner_announcement";
  const openable = variant === "feed" && Boolean(onOpenDetail);
  const handleOpenDetail = () => onOpenDetail?.(post);

  if (removed) return null;

  // Long posts truncate with a "See more" that expands inline — only in the
  // feed, where a wall of text would otherwise dominate the whole card.
  // PostDetailModal (variant="modal") always shows the full text.
  const TRUNCATE_LENGTH = 280;
  const isLongText = variant === "feed" && content.length > TRUNCATE_LENGTH;
  const displayedContent =
    isLongText && !textExpanded
      ? content.slice(0, TRUNCATE_LENGTH).trimEnd()
      : content;

  return (
    <article
      className={`relative w-full rounded-2xl transition-all duration-300 ${
        isPartnerPost
          ? "bg-gradient-to-b from-amber-950/20 via-zinc-900/90 to-zinc-900 border-2 border-amber-500/40 shadow-[0_4px_30px_rgba(245,158,11,0.15)]"
          : "bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 shadow-lg"
      } p-4 sm:p-5`}
    >
      {/* Top Banner for Pinned or Partner Posts */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-xs text-lime-400 font-bold mb-3 pb-2 border-b border-zinc-800/60">
          <Pin className="h-4 w-4" strokeWidth={2} />
          <span>Featured in Republic</span>
        </div>
      )}

      {/* Author Header */}
      <AuthorPassportPopover
        author={post.author}
        createdAt={post.createdAt}
        isFollowingAuthor={post.isFollowingAuthor}
        optionsMenu={
          <PostOptionsMenu
            post={post}
            isOwner={isOwner}
            onEdit={() => {
              setEditContent(content);
              setIsEditing(true);
            }}
            onRemoved={handleRemoved}
            onCopyLink={handleShare}
          />
        }
      />

      {/* Post Text Content */}
      {isEditing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            className="w-full resize-none bg-zinc-900 border border-zinc-800 focus:border-lime-400/60 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3.5 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs transition-all cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={openable ? handleOpenDetail : undefined}
          className={`mt-3 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed ${openable ? "cursor-pointer" : ""}`}
        >
          {renderUsernameMentions(displayedContent)}
          {isLongText && !textExpanded && (
            <>
              …{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTextExpanded(true);
                }}
                className="font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                See more
              </button>
            </>
          )}
          {isLongText && textExpanded && (
            <>
              {" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTextExpanded(false);
                }}
                className="font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                See less
              </button>
            </>
          )}
          {editedAt && (
            <span className="ml-1.5 text-[11px] text-zinc-500">(edited)</span>
          )}
        </div>
      )}

      {/* Repost embed — the reposter's own caption (above, if any) plus a
          compact quoted card of the original post. */}
      {post.originalPost && (
        <Link
          href={`/republic?postId=${post.originalPost.id}`}
          className="mt-3 flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-800/40 p-3 hover:bg-zinc-800/60 transition-colors"
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
            {post.originalPost.mediaUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.originalPost.mediaUrls[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              post.originalPost.author.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-200">
              {post.originalPost.author.name}
            </p>
            <p className="text-[11px] text-zinc-500 line-clamp-2">
              {post.originalPost.content}
            </p>
          </div>
        </Link>
      )}

      {/* Verified Venue Stamp Badge (if linked to a stamp) */}
      {post.stamp && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs shadow-sm">
          {post.stamp.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.stamp.imageUrl}
              alt="Stamp"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400/50"
            />
          ) : (
            <Award className="h-4 w-4" strokeWidth={2} />
          )}
          <span className="font-bold">Verified Venue Stamp:</span>
          <span>{post.stamp.venue?.name || post.stamp.eventName}</span>
          {post.stamp.venue?.city && (
            <span className="text-amber-400/80">• {post.stamp.venue.city}</span>
          )}
        </div>
      )}

      {/* Photo Gallery Grid */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div
          onClick={openable ? handleOpenDetail : undefined}
          className={`mt-3.5 grid gap-2 rounded-xl overflow-hidden ${openable ? "cursor-pointer" : ""} ${
            post.mediaUrls.length === 1
              ? "grid-cols-1"
              : post.mediaUrls.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {post.mediaUrls.map((url, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(idx);
              }}
              className={`relative overflow-hidden bg-zinc-800 rounded-lg group cursor-pointer ${
                post.mediaUrls.length === 3 && idx === 0
                  ? "col-span-2 sm:col-span-1 h-48 sm:h-40"
                  : "h-40"
              }`}
            >
              {isVideoUrl(url) ? (
                <video
                  src={url}
                  muted
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              {isVideoUrl(url) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="h-10 w-10 rounded-full bg-black/50 flex items-center justify-center">
                    <PlayCircle
                      className="h-6 w-6 text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              )}
              <MediaTagOverlay
                tags={post.mediaTags?.filter((t) => t.mediaUrl === url) ?? []}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── TYPE-SPECIFIC COMMERCIAL EMBED CARDS ────────────────── */}

      {/* 1. Review Share Embed */}
      {post.type === "review_share" && post.review && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                  fill={i < post.review!.rating ? "currentColor" : "none"}
                />
              ))}
              <span className="text-xs font-bold text-white ml-1">
                {post.review.rating}.0 / 5
              </span>
            </div>
            <Badge variant="success">Verified Booking</Badge>
          </div>
          {post.review.comment && (
            <p className="text-xs text-zinc-300 italic">
              &ldquo;{post.review.comment}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* 2. Venue Spotlight Embed */}
      {post.type === "venue_spotlight" && post.venue && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-zinc-800/80 to-zinc-900 border border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {post.venue.name}
              </span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                {post.venue.category}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span>📍 {post.venue.city}</span>
              <span>👥 Up to {post.venue.capacity} guests</span>
              <span className="text-lime-400 font-bold">
                ₱{Number(post.venue.price).toLocaleString()} /{" "}
                {post.venue.billingRate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/venues/${post.venue.id}`}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs text-center transition-all shadow-md"
            >
              Book Venue
            </Link>
            <button
              onClick={() =>
                handleMessageFoxer(
                  `About ${post.venue!.name}`,
                  "venue",
                  post.venue!.id,
                )
              }
              title="Chat with Venue Foxer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <MessageCircle className="h-[15px] w-[15px]" strokeWidth={2} />
              <span className="hidden sm:inline">Message</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Gear Offering Embed */}
      {post.type === "gear_offering" && post.asset && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {post.asset.name}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {post.asset.condition}
              </span>
            </div>
            <p className="text-xs text-lime-400 font-bold mt-1">
              ₱{Number(post.asset.price).toLocaleString()} /{" "}
              {post.asset.billingRate}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/categories`}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-black font-extrabold text-xs text-center transition-all shadow-md"
            >
              Rent Gear
            </Link>
            <button
              onClick={() =>
                handleMessageFoxer(
                  `About ${post.asset!.name}`,
                  "asset",
                  post.asset!.id,
                )
              }
              title="Chat with Equipment Foxer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <MessageCircle className="h-[15px] w-[15px]" strokeWidth={2} />
              <span className="hidden sm:inline">Message</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Service Offering Embed */}
      {post.type === "service_offering" && post.service && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {post.service.name}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {post.service.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span>📍 {post.service.city}</span>
              <span className="text-lime-400 font-bold">
                ₱{Number(post.service.price).toLocaleString()} /{" "}
                {post.service.billingRate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/categories`}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs text-center transition-all shadow-md"
            >
              Book Service
            </Link>
            <button
              onClick={() =>
                handleMessageFoxer(
                  `About ${post.service!.name}`,
                  "service",
                  post.service!.id,
                )
              }
              title="Chat with Talent Foxer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <MessageCircle className="h-[15px] w-[15px]" strokeWidth={2} />
              <span className="hidden sm:inline">Message</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Event Announcement Embed */}
      {post.type === "event_announcement" && post.event && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {post.event.name}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {post.event.eventCategory}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span>
                📅 {new Date(post.event.startAt).toLocaleDateString()}
              </span>
              <span>👥 {post.event.guestCount} Guests</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/event/${post.event.id}`}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs text-center transition-all shadow-md"
            >
              Get Tickets
            </Link>
            <button
              onClick={() =>
                handleMessageFoxer(
                  `About ${post.event!.name}`,
                  "event",
                  post.event!.id,
                )
              }
              title="Chat with Event Organizer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <MessageCircle className="h-[15px] w-[15px]" strokeWidth={2} />
              <span className="hidden sm:inline">Message</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Partner Announcement Embed */}
      {post.type === "partner_announcement" && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
              <Handshake className="h-[15px] w-[15px]" strokeWidth={2} />
              Official Partner Foxer Opportunity
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Available for funding, package allocations & co-host production.
            </p>
          </div>

          <button
            onClick={() =>
              handleMessageFoxer(
                post.content?.trim().slice(0, 60) || "Partner opportunity",
                "post",
                post.id,
              )
            }
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            Contact Partner
          </button>
        </div>
      )}

      {/* ── ENGAGEMENT ACTION BAR ──────────────────────────────── */}
      <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <ReactionButton
            myReaction={myReaction}
            likesCount={likesCount}
            onReact={handleReact}
          />

          {/* Comment Toggle — in the feed, this opens the post detail modal
              (Facebook-style) instead of expanding comments inline. */}
          <button
            onClick={
              openable
                ? handleOpenDetail
                : () => setShowComments((prev) => !prev)
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
              showComments
                ? "text-lime-400 bg-lime-400/10 font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Share2 className="h-[18px] w-[18px]" strokeWidth={2} />
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Share"}
            </span>
          </button>

          {/* Send in Message — Messenger-style share to a person/conversation,
              distinct from the copy-link Share above. */}
          <button
            onClick={handleSendClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Send className="h-[18px] w-[18px]" strokeWidth={2} />
            <span className="hidden sm:inline">Send</span>
          </button>

          {/* Repost — publishes a new post of your own quoting this one,
              distinct from Share/Send which don't touch your own feed. */}
          {!post.originalPostId && (
            <button
              onClick={() => {
                if (!user) {
                  router.push("/auth/login");
                  return;
                }
                setShowRepostModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            >
              <Repeat2 className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="hidden sm:inline">Repost</span>
            </button>
          )}
        </div>
      </div>

      {showShareModal &&
        renderShareModal?.(
          {
            id: post.id,
            content: post.content,
            mediaUrls: post.mediaUrls,
            author: {
              id: post.author.id,
              name: post.author.name,
              imgId: post.author.imgId,
            },
          },
          () => setShowShareModal(false),
        )}

      {lightboxIndex !== null &&
        renderImageLightbox?.(
          post.mediaUrls,
          lightboxIndex,
          post.mediaTags,
          () => setLightboxIndex(null),
        )}

      {showRepostModal && (
        <RepostComposer post={post} onClose={() => setShowRepostModal(false)} />
      )}

      {/* Flat Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          commentsCount={commentsCount}
          onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
        />
      )}
    </article>
  );
}
