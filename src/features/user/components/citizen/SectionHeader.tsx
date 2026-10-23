import React from "react";
import Link from "next/link";

interface SectionHeaderProps {
  id: string;
  title: string;
  icon: string;
  /** Muted text after the title, such as an item count. */
  meta?: React.ReactNode;
  link?: { href: string; label: string };
  /** Controls that sit at the right instead of (or before) the link. */
  children?: React.ReactNode;
}

/** The one heading row every dashboard section uses. */
export function SectionHeader({
  id,
  title,
  icon,
  meta,
  link,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4">
      <div className="flex items-baseline gap-3 min-w-0">
        <h2
          id={id}
          className="text-xl font-display font-bold text-white flex items-center gap-2"
        >
          <span
            className="material-symbols-outlined text-[20px] text-white/40"
            aria-hidden="true"
          >
            {icon}
          </span>
          {title}
        </h2>
        {meta && <span className="text-xs text-text-muted">{meta}</span>}
      </div>
      <div className="flex items-center gap-3 min-w-0">
        {children}
        {link && (
          <Link
            href={link.href}
            className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors shrink-0"
          >
            {link.label}
            <span
              className="material-symbols-outlined text-[16px]"
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
