"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { X, ArrowUpRight } from "lucide-react";
import {
  getFollowers,
  getFollowing,
  type FollowListPage,
} from "../api/follows";
import { FollowUserRow } from "./FollowUserRow";

type FollowTab = "followers" | "following";

interface FollowListModalProps {
  userId: string;
  initialTab: FollowTab;
  onClose: () => void;
}

export function FollowListModal({
  userId,
  initialTab,
  onClose,
}: FollowListModalProps) {
  const [tab, setTab] = useState<FollowTab>(initialTab);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery<FollowListPage>({
      queryKey: ["followList", tab, userId],
      queryFn: ({ pageParam }) =>
        tab === "followers"
          ? getFollowers(userId, pageParam as number, 20)
          : getFollowing(userId, pageParam as number, 20),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    });

  const users = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <div className="flex gap-1 bg-zinc-900 rounded-full p-1">
            <button
              onClick={() => setTab("followers")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                tab === "followers"
                  ? "bg-lime-400 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setTab("following")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                tab === "following"
                  ? "bg-lime-400 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Following
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/user/${userId}/connections?tab=${tab}`}
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-lime-400 transition-colors"
            >
              Full page
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-zinc-800 rounded" />
                  <div className="h-2 w-16 bg-zinc-800 rounded" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-8">
              {tab === "followers"
                ? "No followers yet."
                : "Not following anyone yet."}
            </p>
          ) : (
            users.map((u) => (
              <FollowUserRow key={u.id} user={u} onNavigate={onClose} />
            ))
          )}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
