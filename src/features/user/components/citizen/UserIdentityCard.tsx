"use client";

import React from "react";
import {
  FOXER_ROLES,
  ROLE_BADGE,
  roleTextColor,
} from "@/shared/constants/roles";

interface IdentityUser {
  name?: string | null;
  email?: string | null;
  imgId?: string | null;
  roleType?: readonly string[] | null;
}

/** The person's photo, or their initial on lime when there is none. */
export function UserAvatar({ user }: { user: IdentityUser }) {
  const displayName = user.name || user.email || "Citizen";
  const initial = displayName.charAt(0).toUpperCase();

  return user.imgId ? (
    <img
      src={user.imgId}
      alt=""
      className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover shrink-0"
    />
  ) : (
    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-accent flex items-center justify-center shrink-0">
      <span className="text-2xl sm:text-3xl font-display font-bold text-black">
        {initial}
      </span>
    </div>
  );
}

/**
 * Who this person is, as the server actually says so — not a template of
 * every capability that exists.
 *
 * Every account is a Citizen first: that badge always shows. A Foxer pill
 * only ever renders for a role present in `user.roleType`, which only ever
 * gains an entry once an admin approves the matching RoleRequest. Someone
 * with zero approved roles still gets a real badge row, just with one badge
 * in it — that is the correct state, not a loading or broken one.
 */
export function UserRoleBadges({ user }: { user: IdentityUser }) {
  const roleTypes: readonly string[] = user.roleType ?? [];
  const heldFoxerRoles = FOXER_ROLES.filter((r) => roleTypes.includes(r));

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Your roles">
      <li className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-white/5 border border-white/10 text-white/60">
        Citizen
      </li>
      {heldFoxerRoles.map((rt) => {
        const meta = ROLE_BADGE[rt];
        return (
          <li
            key={rt}
            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border"
            style={{
              color: roleTextColor(meta.color),
              borderColor: `color-mix(in srgb, ${meta.color} 25%, transparent)`,
              background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
            }}
          >
            {meta.label}
          </li>
        );
      })}
    </ul>
  );
}
