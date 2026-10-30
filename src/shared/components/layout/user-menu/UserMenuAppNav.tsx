"use client";

import React, { useId } from "react";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAV, isNavActive } from "@/shared/lib/app-nav";

interface UserMenuAppNavProps {
  onClose: () => void;
}

/**
 * The app's main places, for headers that don't show the app nav themselves
 * (creator dashboard, admin console), so shared pages stay one click away from
 * any dashboard. Foxers is left out: it's first in "My Dashboards" above.
 */
export function UserMenuAppNav({ onClose }: UserMenuAppNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const labelId = useId();
  const places = APP_NAV.filter((item) => item.href !== "/search");

  return (
    <div className="px-2 py-2 border-b border-white/5">
      <p
        id={labelId}
        className="px-2 py-1.5 text-[10px] text-white/30 uppercase tracking-widest font-bold"
      >
        Go to
      </p>
      <div role="group" aria-labelledby={labelId} className="mt-1 space-y-0.5">
        {places.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <button
              key={item.href}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => {
                onClose();
                router.push(item.href);
              }}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors group cursor-pointer ${
                active ? "bg-accent/10" : "hover:bg-white/5"
              }`}
            >
              <span
                aria-hidden
                className={`material-symbols-outlined text-[18px] shrink-0 ${
                  active
                    ? "text-accent"
                    : "text-white/40 group-hover:text-accent"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-sm transition-colors ${
                  active
                    ? "text-accent"
                    : "text-white/70 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
