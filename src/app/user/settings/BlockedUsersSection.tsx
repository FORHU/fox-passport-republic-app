"use client";

import React from "react";
import { useBlockedUsers, useUnblockUser } from "@/features/block/api/useBlock";

export default function BlockedUsersSection() {
  const { data, isLoading } = useBlockedUsers();
  const unblockUser = useUnblockUser();
  const users = data?.data ?? [];

  return (
    <div className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-8 space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold mb-1">
          Blocked Citizens
        </h2>
        <p className="text-sm text-white/40">
          Blocked citizens can&apos;t send you a new follow request. Unblocking
          is always available.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-white/30">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-white/30">
          You haven&apos;t blocked anyone.
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                  {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {u.name || "Unknown Citizen"}
                  </p>
                  <p className="text-xs text-white/30 truncate">
                    @{u.username || "citizen"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => unblockUser.mutate(u.id)}
                disabled={unblockUser.isPending}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 shrink-0"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
