"use client";

interface SearchPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const WINDOW_SIZE = 5;

export default function SearchPagination({
  page,
  totalPages,
  onPageChange,
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

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-all"
      >
        Previous
      </button>
      {pages.map((p, i) => (
        // Keyed by slot, not page number: as the centered window slides by
        // one, the same 5 buttons get their label swapped in place instead
        // of the edge buttons unmounting/mounting, which previously caused
        // a visible tick as colors cross-faded during the layout shift.
        <button
          key={i}
          onClick={() => onPageChange(p)}
          className={`h-9 w-9 rounded-full text-sm font-bold ${
            p === page
              ? "bg-white text-black"
              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-all"
      >
        Next
      </button>
    </div>
  );
}
