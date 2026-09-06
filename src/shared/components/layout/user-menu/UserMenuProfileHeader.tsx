/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

import {
  MapPin,
  Calendar,
  Wrench,
  Briefcase,
  DollarSign,
  Shield,
  User,
} from "lucide-react";

interface UserMenuProfileHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    imgId?: string | null;
    roleType?: string[];
  } | null;
}

const roleIcons: Record<string, React.ReactNode> = {
  venuefoxer: <MapPin className="w-3.5 h-3.5" />,
  eventfoxer: <Calendar className="w-3.5 h-3.5" />,
  gearfoxer: <Wrench className="w-3.5 h-3.5" />,
  servicefoxer: <Briefcase className="w-3.5 h-3.5" />,
  investor: <DollarSign className="w-3.5 h-3.5" />,
  admin: <Shield className="w-3.5 h-3.5" />,
};

const getRoleIcon = (role: string) =>
  roleIcons[role.toLowerCase()] || <User className="w-3.5 h-3.5" />;

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
          <div className="flex flex-wrap gap-1.5 mt-2">
            {roleTypes.map((r) => (
              <button
                key={r}
                type="button"
                title={r}
                aria-label={r}
                className="group relative flex items-center justify-center w-6 h-6 rounded-full bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 cursor-pointer hover:bg-[#ccff00]/20 focus:bg-[#ccff00]/20 active:bg-[#ccff00]/20 transition-colors"
              >
                {getRoleIcon(r)}
                <div className="pointer-events-none absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity whitespace-nowrap bg-black border border-white/10 text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded shadow-xl z-50 capitalize">
                  {r}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
