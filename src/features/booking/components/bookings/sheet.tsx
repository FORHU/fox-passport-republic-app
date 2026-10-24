import React from "react";
import { statusInk, statusLabel } from "./statusInk";

/** The forward arrow on drawing-set links, from the app's Material Symbols font. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined text-[1.15em] leading-none transition-transform ${className}`}
    >
      arrow_forward
    </span>
  );
}

/**
 * A booking's status: a dot in its ink and the word, in plain case so it
 * reads at a glance. The dot matches the marks on the month strip.
 */
export function StatusTag({ booking }: { booking: any }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-semibold ${statusInk(booking)}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden />
      {statusLabel(booking)}
    </span>
  );
}

/** A section head inside the page: a drawing title over a hairline. */
export function SectionHead({
  id,
  title,
  count,
  note,
}: {
  id: string;
  title: string;
  count?: number;
  note?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-white/15 pb-3">
      <h2
        id={id}
        className="font-landing-display text-2xl leading-[0.95] text-white sm:text-3xl"
      >
        {title}
        {count !== undefined && (
          <span className="font-landing-mono ml-3 align-middle text-xs font-bold tracking-[0.12em] text-white/55">
            {count}
          </span>
        )}
      </h2>
      {note && (
        <p className="max-w-md text-sm leading-relaxed text-white/60">{note}</p>
      )}
    </div>
  );
}
