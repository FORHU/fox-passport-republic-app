/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useFollowing } from "@/features/follow/api/useFollow";
import { AccountOptionsMenu } from "./AccountOptionsMenu";

export function FollowingWidget() {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useFollowing(user?.id);
  const following = data?.data ?? [];

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="h-full rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 space-y-4 animate-pulse">
        <div className="h-3 w-32 bg-zinc-800 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-zinc-800 rounded"></div>
              <div className="h-2 w-16 bg-zinc-800 rounded"></div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return null;

  return (
    // h-full so this panel stretches to fill whatever height its sticky
    // container gives it, instead of shrink-wrapping to just its content —
    // the list scrolls internally if it's longer than that; the card itself
    // still reaches the bottom of the available space either way.
    <div className="h-full flex flex-col rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-[16px] text-lime-400">
          how_to_reg
        </span>
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Accounts You Follow
        </div>
      </div>

      {following.length === 0 ? (
        <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
          You&apos;re not following anyone yet. Follow citizens and partners
          from their posts or profiles to see them here.
        </p>
      ) : (
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {following.map((followedUser) => (
            <div
              key={followedUser.id}
              className="flex items-center justify-between gap-2"
            >
              <Link
                href={`/user/${followedUser.id}`}
                className="flex items-center gap-3 min-w-0 group"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50 group-hover:border-lime-500/50 transition-colors">
                  {followedUser.imgId ? (
                    <img
                      src={
                        followedUser.imgId.startsWith("http://") ||
                        followedUser.imgId.startsWith("https://")
                          ? followedUser.imgId
                          : `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${followedUser.imgId}`
                      }
                      alt={followedUser.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {followedUser.name
                        ? followedUser.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-lime-400 transition-colors">
                    {followedUser.name || "Unknown Citizen"}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    @
                    {followedUser.username ||
                      (followedUser.name
                        ? followedUser.name.toLowerCase().replace(/\s/g, "")
                        : "citizen")}
                  </span>
                </div>
              </Link>

              <AccountOptionsMenu
                targetId={followedUser.id}
                targetName={followedUser.name || "Citizen"}
                targetImgId={followedUser.imgId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
