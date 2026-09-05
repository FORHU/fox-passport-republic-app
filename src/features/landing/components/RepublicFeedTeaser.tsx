"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FeedPost } from "@/shared/types/feed";
import { getFeed } from "@/shared/api/feed";

export function RepublicFeedTeaser() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeed({ limit: 4 })
      .then((res) => {
        if (mounted) setPosts(res.data);
      })
      .catch((err) => {
        console.error("Failed to load teaser posts:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <div className="w-full my-6 px-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(204,255,0,0.5)]">
            🦊
          </span>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              From Republic Foxer
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Real experiences, spaces & gear straight from the community
            </p>
          </div>
        </div>

        <Link
          href="/republic"
          className="text-xs font-bold text-lime-400 hover:text-lime-300 flex items-center gap-0.5 transition-colors"
        >
          <span>View All</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>

      {/* Horizontal Cards Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-64 sm:w-72 h-36 rounded-2xl bg-zinc-900/80 border border-zinc-800 animate-pulse shrink-0 snap-start"
              />
            ))
          : posts.map((post) => {
              const initial = post.author.name
                ? post.author.name.charAt(0).toUpperCase()
                : "?";
              const isPartner = post.type === "partner_announcement";

              return (
                <Link
                  key={post.id}
                  href={`/republic?postId=${post.id}`}
                  className={`w-64 sm:w-72 p-3.5 rounded-2xl flex flex-col justify-between shrink-0 snap-start transition-all hover:scale-[1.02] ${
                    isPartner
                      ? "bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.15)]"
                      : "bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 shadow-md"
                  }`}
                >
                  <div>
                    {/* Author pill */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-lime-400 shrink-0">
                        {initial}
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {post.author.name}
                      </span>
                      {isPartner && (
                        <span className="text-[9px] font-black uppercase text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                          Partner
                        </span>
                      )}
                    </div>

                    {/* Content Snippet */}
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Footer engagement */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                    <span className="capitalize text-[10px] font-medium text-zinc-500">
                      {post.type.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-zinc-400">
                        <span className="material-symbols-outlined text-[13px]">favorite</span>
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-0.5 text-zinc-400">
                        <span className="material-symbols-outlined text-[13px]">chat_bubble</span>
                        {post.commentsCount}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
