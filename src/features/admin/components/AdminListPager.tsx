"use client";

/**
 * Previous / next pager for a server-paginated admin list, styled like the
 * one in `AdminReportsPanel`. Renders nothing for a single page.
 */
export function AdminListPager({
  page,
  totalPages,
  busy,
  label,
  onPage,
}: {
  page: number;
  totalPages: number;
  busy: boolean;
  /** What the list holds, for the buttons' accessible names. */
  label: string;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="px-6 sm:px-8 py-4 border-t border-white/5 flex items-center justify-end gap-3">
      <span className="text-xs text-white/40">
        {busy ? "Loading..." : `Page ${page} of ${totalPages}`}
      </span>
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1 || busy}
        className="h-8 w-8 rounded-lg bg-white/5 text-white/60 disabled:opacity-30"
        aria-label={`Previous ${label} page`}
      >
        <span className="material-symbols-outlined text-[16px]">
          chevron_left
        </span>
      </button>
      <button
        type="button"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages || busy}
        className="h-8 w-8 rounded-lg bg-white/5 text-white/60 disabled:opacity-30"
        aria-label={`Next ${label} page`}
      >
        <span className="material-symbols-outlined text-[16px]">
          chevron_right
        </span>
      </button>
    </div>
  );
}
