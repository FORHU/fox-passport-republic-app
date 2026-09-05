/* eslint-disable @next/next/no-img-element -- user.imgId is a CloudFront URL
   outside next.config's image remotePatterns, same as AdminCitizenTable and
   UserMenuButton. */
"use client";

import React from "react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { FOXER_ROLES, type RoleType } from "@/shared/constants/roles";

const ROLE_BADGE: Record<RoleType, { label: string; color: string }> = {
  venueFoxer: { label: "Venue Foxer", color: "#ec4899" },
  eventFoxer: { label: "Event Foxer", color: "#a78bfa" },
  gearFoxer: { label: "Gear Foxer", color: "#38bdf8" },
  serviceFoxer: { label: "Service Foxer", color: "#34d399" },
  investor: { label: "Investor", color: "#10b981" },
};

/**
 * Who this person is, as the server actually says so — not a template of
 * every capability that exists.
 *
 * Every account is a Citizen first: that badge always shows. A Foxer pill
 * only ever renders for a role present in `user.roleType`, which only ever
 * gains an entry once an admin approves the matching RoleRequest. Someone
 * with zero approved roles still gets a real card, just with one badge on
 * it — that is the correct state, not a loading or broken one.
 */
export function UserIdentityCard() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const roleTypes: readonly string[] = user.roleType ?? [];
  const heldFoxerRoles = FOXER_ROLES.filter((r) => roleTypes.includes(r));
  const displayName = user.name || user.email || "Citizen";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 mb-8 reveal-on-scroll">
      <div className="shrink-0">
        {user.imgId ? (
          <img
            src={user.imgId}
            alt=""
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover"
          />
        ) : (
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#ccff00] flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-display font-bold text-black">
              {initial}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-base sm:text-lg font-display font-bold text-white truncate">
          {displayName}
        </h2>
        <p className="text-xs sm:text-sm text-white/40 truncate">
          {user.email}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-white/5 border border-white/10 text-white/60">
            Citizen
          </span>
          {heldFoxerRoles.map((rt) => {
            const meta = ROLE_BADGE[rt];
            return (
              <span
                key={rt}
                className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide border"
                style={{
                  color: meta.color,
                  borderColor: `${meta.color}40`,
                  background: `${meta.color}1a`,
                }}
              >
                {meta.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserIdentityCard;
