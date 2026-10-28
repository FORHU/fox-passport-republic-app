"use client";

interface SearchPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Names the list being paged, for screen readers: "Gear pages". */
  label: string;
}

const WINDOW_SIZE = 5;

export default function SearchPagination({
  page,
  totalPages,
  onPageChange,
  label,
}: SearchPaginationProps) {
  if (totalPages <= 1) return null;

  // Centers the window on the current page (so the current page is rarely
  // pinned to the edge, letting you keep clicking Next/Previous without a
  // click "wasted" just revealing the next batch of numbers), clamped so the
  // window never runs past page 1 or totalPages.
  const half = Math.floor(WINDOW_SIZE / 2);
  const maxWindowStart = Math.max(1, totalPages - WINDOW_SIZE + 1);
  const windowStart = Math.min(Math.max(page - half, 1), maxWindowStart);
  const windowEnd = Math.min(windowStart + WINDOW_SIZE - 1, totalPages);
  const pages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i,
  );

  const step =
    "h-10 px-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors";

  return (
    <nav aria-label={label} className="flex items-center justify-center gap-2 pt-6">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className={step}
      >
        Previous
      </button>
      {pages.map((p, i) => (
        // Keyed by slot, not page number: as the centered window slides by
        // one, the same 5 buttons get their label swapped in place instead
        // of the edge buttons unmounting/mounting, which previously caused
        // a visible tick as colors cross-faded during the layout shift.
        <button
          type="button"
          key={i}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Page ${p}`}
          className={`h-10 w-10 rounded-full text-sm font-bold transition-colors ${
            p === page
              ? "bg-white text-black"
              : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className={step}
      >
        Next
      </button>
    </nav>
  );
}
