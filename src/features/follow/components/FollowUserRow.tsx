"use client";

import Link from "next/link";
import { FollowButton } from "./FollowButton";
import type { FollowListUser } from "../api/follows";

interface FollowUserRowProps {
  user: FollowListUser;
  onNavigate?: () => void;
  /** Renders Accept/Decline instead of the FollowButton (the Requests tab). */
  actions?: React.ReactNode;
}

export function FollowUserRow({ user, onNavigate, actions }: FollowUserRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        href={`/user/${user.id}`}
        onClick={onNavigate}
        className="flex items-center gap-3 min-w-0 group"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50 group-hover:border-lime-500/50 transition-colors">
          {user.imgId ? (
            // eslint-disable-next-line @next/next/no-img-element
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
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-zinc-200 truncate group-hover:text-lime-400 transition-colors">
            {user.name || "Unknown Citizen"}
          </span>
          <span className="text-xs text-zinc-500 truncate">
            @
            {user.username ||
              (user.name ? user.name.toLowerCase().replace(/\s/g, "") : "citizen")}
          </span>
        </div>
      </Link>
      {actions ?? <FollowButton targetId={user.id} compact />}
    </div>
  );
}
