"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  isCreatorLinkActive,
  type CreatorNavLink,
} from "@/features/dashboard/hooks/useCreatorNavLinks";

/**
 * The "More" tab of a mobile dashboard bar: the sections that don't fit as
 * tabs, in a bottom sheet, so a phone reaches every section the desktop shows.
 */
export function CreatorNavMoreSheet({
  links,
  iconSize = 20,
  labelClassName = "text-[9px] font-bold",
}: {
  links: CreatorNavLink[];
  iconSize?: number;
  labelClassName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = links.some((l) => isCreatorLinkActive(pathname, l.href));
  const color = active ? "#C4E85A" : "rgba(255,255,255,0.45)";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1 cursor-pointer"
        >
          <span
            aria-hidden
            className="material-symbols-outlined"
            style={{
              fontSize: iconSize,
              color,
              fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            more_horiz
          </span>
          <span className={labelClassName} style={{ color }}>
            More
          </span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="bg-canvas border-white/10 text-white rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="px-6 pt-6 text-lg font-display font-bold text-white">
          More
        </SheetTitle>
        <nav className="grid grid-cols-3 gap-2 px-4">
          {links.map((link) => {
            const isActive = isCreatorLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-accent text-black"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <span
                  aria-hidden
                  className="material-symbols-outlined text-[22px]"
                >
                  {link.icon}
                </span>
                <span className="truncate max-w-full">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
