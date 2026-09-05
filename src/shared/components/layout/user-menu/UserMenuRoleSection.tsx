"use client";

import React from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { RoleDef, ROLE_DEFS } from "./types";

interface UserMenuRoleSectionProps {
  isAdmin: boolean;
  hasRoleAccess: (def: RoleDef) => boolean;
  onSelectRole: (def: RoleDef, unlocked: boolean) => void;
  onSelectAdmin: () => void;
}

export function UserMenuRoleSection({
  isAdmin,
  hasRoleAccess,
  onSelectRole,
  onSelectAdmin,
}: UserMenuRoleSectionProps) {
  return (
    <div className="px-2 py-2 border-b border-white/5">
      <p className="px-2 text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">
        My Dashboards
      </p>
      {ROLE_DEFS.map((def) => {
        const unlocked = hasRoleAccess(def);
        const Icon = def.icon;
        return (
          <button
            key={def.key}
            onClick={() => onSelectRole(def, unlocked)}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all group cursor-pointer ${
              unlocked ? "hover:bg-white/5" : "opacity-50 hover:opacity-70"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                unlocked
                  ? "bg-[#ccff00]/10 border border-[#ccff00]/20"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {unlocked ? (
                <Icon className="w-4 h-4 text-[#ccff00]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-white/40" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  unlocked
                    ? "text-white group-hover:text-[#ccff00]"
                    : "text-white/40"
                }`}
              >
                {def.label}
              </p>
              <p className="text-[10px] text-white/30 truncate">
                {def.description}
              </p>
            </div>
            {!unlocked && (
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider shrink-0">
                Apply
              </span>
            )}
          </button>
        );
      })}
      {isAdmin && (
        <button
          onClick={onSelectAdmin}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 border border-red-500/20">
            <ShieldCheck className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white group-hover:text-red-400">
              Admin Dashboard
            </p>
            <p className="text-[10px] text-white/30">Platform management</p>
          </div>
        </button>
      )}
    </div>
  );
}
