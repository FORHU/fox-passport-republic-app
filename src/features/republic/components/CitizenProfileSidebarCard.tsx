/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { isPartnerUser } from "@/shared/auth/roles";

export function CitizenProfileSidebarCard() {
  const { user, openLogin } = useAuthStore();

  if (!user) {
    return (
      <div className="w-full rounded-3xl bg-zinc-900/70 border border-zinc-800/80 p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 font-black shadow-inner">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Welcome, Guest</h3>
            <p className="text-[11px] text-zinc-400">
              Join the Republic network
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Sign in to interact, publish offerings, connect with partner venues,
          and earn Passport XP.
        </p>
        <button
          onClick={openLogin}
          className="w-full py-2.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">login</span>
          Sign In as Citizen
        </button>
      </div>
    );
  }

  const roleTypes = user.roleType ?? [];
  const isPartner = isPartnerUser(user);
  const userInitial =
    user.name?.charAt(0).toUpperCase() ||
    user.username?.charAt(0).toUpperCase() ||
    "C";

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 border border-zinc-800/80 p-5 shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-lime-400/5 blur-2xl pointer-events-none group-hover:bg-lime-400/10 transition-all" />

      {/* Top Identity Row */}
      <div className="flex items-center gap-3.5">
        <Link href={`/user/${user.id}`} className="relative shrink-0 block">
          {user.imgId ? (
            <img
              src={user.imgId}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-lime-400/50 shadow-md ring-2 ring-lime-400/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 text-black flex items-center justify-center font-black text-lg shadow-md">
              {userInitial}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-lime-400 border-2 border-black" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/user/${user.id}`}
            className="text-sm font-black text-white hover:text-lime-400 transition-colors truncate block"
          >
            {user.name}
          </Link>
          <p className="text-[11px] text-zinc-400 truncate">
            @{user.username || user.email.split("@")[0]}
          </p>
          {user.city && (
            <p className="text-[10px] text-zinc-500 truncate flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[11px]">
                location_on
              </span>
              {user.city}, {user.country || "Republic"}
            </p>
          )}
        </div>
      </div>

      {/* Role Badges */}
      <div className="flex flex-wrap gap-1">
        {isPartner && (
          <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Partner Foxer
          </span>
        )}
        {roleTypes
          .filter((r) => r !== "investor")
          .map((role) => (
            <span
              key={role}
              className="px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 text-[10px] font-semibold capitalize"
            >
              {role.replace("Foxer", " Foxer")}
            </span>
          ))}
        {roleTypes.length === 0 && (
          <span className="px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[10px] font-bold">
            Verified Citizen
          </span>
        )}
      </div>

      {/* Link to public passport */}
      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
        <Link
          href={`/user/${user.id}`}
          className="text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-1 group/link"
        >
          View Passport Profile
          <span className="material-symbols-outlined text-[14px] group-hover/link:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </Link>
        <Link
          href="/progress"
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          XP Status
        </Link>
      </div>
    </div>
  );
}
