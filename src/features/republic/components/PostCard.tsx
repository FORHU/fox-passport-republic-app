"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedPost } from "../types";
import { AuthorPassportPopover } from "./AuthorPassportPopover";
import { CommentSection } from "./CommentSection";
import { toggleLikePost } from "@/shared/api/feed";
import { useAuthStore } from "@/shared/auth/useAuthStore";

interface PostCardProps {
  post: FeedPost;
  onPostDeleted?: (id: string) => void;
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.isLikedByMe ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (likeLoading) return;

    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    setLikeLoading(true);

    try {
      const res = await toggleLikePost(post.id);
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      // Revert on error
      setLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      console.error("Like toggle failed:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator?.clipboard) {
      const url = `${window.location.origin}/republic?postId=${post.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMessageFoxer = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const label = post.content?.trim().slice(0, 60) || post.type;
    router.push(
      `/messages?userId=${post.author.id}&contextType=post&contextId=${post.id}&contextLabel=${encodeURIComponent(label)}`,
    );
  };

  const isPartnerPost = post.type === "partner_announcement";

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
          <span className="material-symbols-outlined text-[16px]">push_pin</span>
          <span>Featured in Republic</span>
        </div>
      )}

      {/* Author Header */}
      <AuthorPassportPopover author={post.author} createdAt={post.createdAt} />

      {/* Post Text Content */}
      <div className="mt-3 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>

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
            <span className="material-symbols-outlined text-[16px]">military_tech</span>
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
          className={`mt-3.5 grid gap-2 rounded-xl overflow-hidden ${
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
              className={`relative overflow-hidden bg-zinc-800 rounded-lg group ${
                post.mediaUrls.length === 3 && idx === 0
                  ? "col-span-2 sm:col-span-1 h-48 sm:h-40"
                  : "h-40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                <span
                  key={i}
                  className="material-symbols-outlined text-[18px]"
                  style={{
                    fontVariationSettings:
                      i < post.review!.rating ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  star
                </span>
              ))}
              <span className="text-xs font-bold text-white ml-1">
                {post.review.rating}.0 / 5
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Booking
            </span>
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
                ₱{Number(post.venue.price).toLocaleString()} / {post.venue.billingRate}
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
              onClick={handleMessageFoxer}
              title="Chat with Venue Foxer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
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
              ₱{Number(post.asset.price).toLocaleString()} / {post.asset.billingRate}
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
              onClick={handleMessageFoxer}
              title="Chat with Gear Foxer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
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
                ₱{Number(post.service.price).toLocaleString()} / {post.service.billingRate}
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
              onClick={handleMessageFoxer}
              title="Chat with Service Foxer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
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
              <span>📅 {new Date(post.event.startAt).toLocaleDateString()}</span>
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
              onClick={handleMessageFoxer}
              title="Chat with Event Organizer"
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
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
              <span className="material-symbols-outlined text-[15px]">handshake</span>
              Official Partner Foxer Opportunity
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Available for funding, package allocations & co-host production.
            </p>
          </div>

          <button
            onClick={handleMessageFoxer}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Contact Partner
          </button>
        </div>
      )}

      {/* ── ENGAGEMENT ACTION BAR ──────────────────────────────── */}
      <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
              liked
                ? "text-rose-400 bg-rose-500/10 font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            <span>{likesCount}</span>
          </button>

          {/* Comment Toggle */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
              showComments
                ? "text-lime-400 bg-lime-400/10 font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
            <span>{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

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
