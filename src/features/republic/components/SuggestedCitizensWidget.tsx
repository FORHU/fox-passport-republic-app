"use client";

import Link from "next/link";
import { useFollowSuggestions } from "@/features/follow/api/useFollow";
import { FollowButton } from "@/features/follow/components/FollowButton";

export function SuggestedCitizensWidget() {
  const { data: suggestions, isLoading, error } = useFollowSuggestions();

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 space-y-4 animate-pulse">
        <div className="h-3 w-32 bg-zinc-800 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-zinc-800 rounded"></div>
              <div className="h-2 w-16 bg-zinc-800 rounded"></div>
            </div>
            <div className="w-16 h-6 rounded-full bg-zinc-800"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !suggestions || suggestions.length === 0) {
    return null; // Don't show anything if there are no suggestions or an error
  }

  return (
    <div className="rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-lime-400">
          group_add
        </span>
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Citizens You Might Know
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-2"
          >
            <Link
              href={`/user/${user.id}`}
              className="flex items-center gap-3 min-w-0 group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50 group-hover:border-lime-500/50 transition-colors">
                {user.imgId ? (
                  <img
                    src={
                      user.imgId.startsWith("http://") ||
                      user.imgId.startsWith("https://")
                        ? user.imgId
                        : `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${user.imgId}`
                    }
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-lime-400 transition-colors">
                  {user.name || "Unknown Citizen"}
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  @
                  {user.username ||
                    (user.name
                      ? user.name.toLowerCase().replace(/\s/g, "")
                      : "citizen")}
                </span>
              </div>
            </Link>

            <FollowButton targetId={user.id} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
