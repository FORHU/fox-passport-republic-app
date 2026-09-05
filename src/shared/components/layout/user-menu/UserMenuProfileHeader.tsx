/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

interface UserMenuProfileHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    imgId?: string | null;
    roleType?: string[];
  } | null;
}

export function UserMenuProfileHeader({ user }: UserMenuProfileHeaderProps) {
  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const avatarUrl = user?.imgId || null;
  const roleTypes: string[] = user?.roleType ?? [];

  return (
    <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#ccff00] flex items-center justify-center">
            <span className="text-black text-sm font-bold">{userInitial}</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-bold text-sm truncate">
          {user?.name || user?.email}
        </p>
        <p className="text-white/40 text-xs truncate">{user?.email}</p>
        {roleTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {roleTypes.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 rounded-full bg-[#ccff00]/10 text-[#ccff00] text-[10px] font-bold border border-[#ccff00]/20 capitalize"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
