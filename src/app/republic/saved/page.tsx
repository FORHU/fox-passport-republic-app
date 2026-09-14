"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, CheckCircle2 } from "lucide-react";
import { FeedPost } from "@/features/republic/types";
import { getSavedPosts } from "@/shared/api/feed";
import { PostCard } from "@/features/republic/components/PostCard";
import { PostDetailModal } from "@/features/republic/components/PostDetailModal";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);

  const fetchSaved = useCallback(async (cursor?: string) => {
    try {
      if (!cursor) setLoading(true);
      const res = await getSavedPosts({ limit: 10, cursor });
      if (cursor) {
        setPosts((prev) => [...prev, ...res.data]);
      } else {
        setPosts(res.data);
      }
      setNextCursor(res.nextCursor ?? null);
    } catch (err) {
      console.error("Failed to load saved posts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    fetchSaved(nextCursor);
  }, [nextCursor, loadingMore, loading, fetchSaved]);

  const handleLoadMoreRef = useRef(handleLoadMore);
  useEffect(() => {
    handleLoadMoreRef.current = handleLoadMore;
  }, [handleLoadMore]);

  // Same first-callback-skip pattern as the main feed's sentinel — see
  // app/republic/page.tsx for the full rationale.
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null);
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    sentinelObserverRef.current?.disconnect();
    sentinelObserverRef.current = null;
    if (!node) return;

    let isInitialCallback = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isInitialCallback) {
          isInitialCallback = false;
          return;
        }
        const [entry] = entries;
        if (entry.isIntersecting) {
          handleLoadMoreRef.current();
        }
      },
      { root: null, rootMargin: "350px", threshold: 0.1 },
    );

    observer.observe(node);
    sentinelObserverRef.current = observer;
  }, []);

  // A post unsaved from within its own card should disappear from this
  // list immediately rather than waiting for a refetch.
  const handleUnsaved = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-[#09090e] text-white pt-16 sm:pt-28 selection:bg-lime-400 selection:text-black">
      <LandingHeader />

      <div className="max-w-2xl mx-auto px-3 sm:px-6 w-full pb-16 pt-5">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/republic"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Back to Republic feed"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </Link>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-lime-400" strokeWidth={2} />
            <h1 className="text-base font-black text-white">Saved Posts</h1>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-52 rounded-3xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full rounded-3xl bg-zinc-950/60 border border-zinc-800/80 p-12 text-center space-y-3 shadow-xl">
            <Bookmark
              className="h-[52px] w-[52px] text-zinc-600 mx-auto"
              strokeWidth={1.5}
            />
            <h3 className="text-base font-bold text-zinc-300">
              Nothing saved yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Save a post from its options menu to find it here later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={setActivePost}
                onPostDeleted={handleUnsaved}
                onPostUnsaved={handleUnsaved}
              />
            ))}

            <div ref={sentinelCallbackRef} className="h-1 w-full" />

            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 py-6 text-zinc-400 text-xs">
                <span className="w-5 h-5 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : nextCursor ? (
              <div className="text-center py-6">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Scroll for more
                </span>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-bold text-zinc-500">
                  <CheckCircle2
                    className="h-[15px] w-[15px] text-lime-400"
                    strokeWidth={2}
                  />
                  That&apos;s all your saved posts
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {activePost && (
        <PostDetailModal
          post={activePost}
          onClose={() => setActivePost(null)}
          onPostDeleted={(id) => {
            handleUnsaved(id);
            setActivePost(null);
          }}
        />
      )}
    </div>
  );
}
