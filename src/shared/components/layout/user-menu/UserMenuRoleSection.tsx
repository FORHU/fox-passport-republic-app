"use client";

import React, { useId } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { RoleDef, ROLE_DEFS } from "./types";

interface UserMenuRoleSectionProps {
  isAdmin: boolean;
  roleTypes: string[];
  hasRoleAccess: (def: RoleDef) => boolean;
  onSelectRole: (def: RoleDef) => void;
  onSelectAdmin: () => void;
}

export function UserMenuRoleSection({
  isAdmin,
  roleTypes,
  hasRoleAccess,
  onSelectRole,
  onSelectAdmin,
}: UserMenuRoleSectionProps) {
  const labelId = useId();
  const pathname = usePathname() ?? "";

  // Only the dashboards this user can open. Locked ones used to sit here
  // greyed out with an "Apply" tag, duplicating "Apply for a Role" below.
  const dashboards = ROLE_DEFS.filter(hasRoleAccess);

  // Segment-safe prefix match, so "/user" doesn't light up on "/users".
  const matches = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Longest match wins, so a dashboard nested under another's path is the one
  // marked. Only listed dashboards count.
  const activeKey = dashboards
    .filter((def) => matches(def.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.key;
  const adminActive = isAdmin && matches("/admin");

  // Always open: a collapsed list hid from first-time users where their
  // dashboards are.
  return (
    <div className="px-2 py-2 border-b border-white/5">
      <p
        id={labelId}
        className="px-2 py-1.5 text-[10px] text-white/30 uppercase tracking-widest font-bold"
      >
        My Dashboards
      </p>
      <div role="group" aria-labelledby={labelId} className="mt-1 space-y-0.5">
        {dashboards.map((def) => {
          const active = def.key === activeKey;
          const Icon = def.icon;
          const label = def.labelFor?.(roleTypes) ?? def.label;
          const description =
            def.descriptionFor?.(roleTypes) ?? def.description;
          return (
            <button
              key={def.key}
              onClick={() => onSelectRole(def)}
              aria-current={active ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all group cursor-pointer ${
                active
                  ? "bg-accent/10 ring-1 ring-inset ring-accent/25"
                  : "hover:bg-white/5"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  active
                    ? "bg-accent border border-accent"
                    : "bg-accent/10 border border-accent/20"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-black" : "text-accent"}`}
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    active
                      ? "text-accent"
                      : "text-white group-hover:text-accent"
                  }`}
                >
                  {label}
                </p>
                <p className="text-[10px] text-white/30 truncate">
                  {description}
                </p>
              </div>
              {active && (
                <span className="text-[10px] text-accent bg-accent/15 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider shrink-0">
                  Current
                </span>
              )}
            </button>
          );
        })}
        {isAdmin && (
          <button
            onClick={onSelectAdmin}
            aria-current={adminActive ? "page" : undefined}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all group cursor-pointer ${
              adminActive
                ? "bg-red-500/10 ring-1 ring-inset ring-red-500/25"
                : "hover:bg-white/5"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                adminActive
                  ? "bg-red-500 border-red-500"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 ${adminActive ? "text-white" : "text-red-400"}`}
              />
            </div>
            <div className="flex-1 text-left">
              <p
                className={`text-sm font-medium ${
                  adminActive
                    ? "text-red-400"
                    : "text-white group-hover:text-red-400"
                }`}
              >
                Admin Dashboard
              </p>
              <p className="text-[10px] text-white/30">Platform management</p>
            </div>
            {adminActive && (
              <span className="text-[10px] text-red-400 bg-red-500/15 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider shrink-0">
                Current
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
