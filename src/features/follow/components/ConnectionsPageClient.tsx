"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { getFollowers, getFollowing, type FollowListPage } from "../api/follows";
import {
  useFollowRequests,
  useAcceptFollowRequest,
  useDeclineFollowRequest,
} from "../api/useFollow";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { FollowUserRow } from "./FollowUserRow";

type Tab = "followers" | "following" | "requests";

function isTab(value: string | null): value is Tab {
  return value === "followers" || value === "following" || value === "requests";
}

export function ConnectionsPageClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const { user } = useAuthStore();
  const isMe = user?.id === id;

  const [tab, setTab] = useState<Tab>(
    isTab(initialTab) && (initialTab !== "requests" || isMe)
      ? initialTab
      : "followers",
  );

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-4">
          <Link
            href={`/user/${id}`}
            className="h-9 w-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-display font-bold text-white">
            Connections
          </h1>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3 flex gap-1">
          {(
            [
              { key: "followers", label: "Followers" },
              { key: "following", label: "Following" },
              ...(isMe
                ? [{ key: "requests" as const, label: "Requests" }]
                : []),
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                tab === t.key
                  ? "bg-lime-400 text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {tab === "requests" ? (
          <RequestsTab />
        ) : (
          <FollowListTab userId={id} tab={tab} />
        )}
      </main>
    </div>
  );
}

function FollowListTab({ userId, tab }: { userId: string; tab: "followers" | "following" }) {
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-2 w-16 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 py-8">
        {tab === "followers" ? "No followers yet." : "Not following anyone yet."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <FollowUserRow key={u.id} user={u} />
      ))}
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
  );
}

function RequestsTab() {
  const { data, isLoading } = useFollowRequests();
  const acceptRequest = useAcceptFollowRequest();
  const declineRequest = useDeclineFollowRequest();

  const requests = data?.data ?? [];

  const errorMessage = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-2 w-16 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 py-8">
        No pending follow requests.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((u) => (
        <FollowUserRow
          key={u.id}
          user={u}
          actions={
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  acceptRequest.mutate(u.id, {
                    onError: (e) =>
                      toast.error(errorMessage(e, "Could not accept request")),
                  })
                }
                disabled={acceptRequest.isPending || declineRequest.isPending}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                aria-label="Accept"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  declineRequest.mutate(u.id, {
                    onError: (e) =>
                      toast.error(errorMessage(e, "Could not decline request")),
                  })
                }
                disabled={acceptRequest.isPending || declineRequest.isPending}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                aria-label="Decline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          }
        />
      ))}
    </div>
  );
}
