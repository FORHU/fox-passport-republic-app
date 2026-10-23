import React from "react";

/** Paging as a sheet index: 1 2 3, the current one in lime. */
export function SheetPager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  const step =
    "font-landing-mono h-10 min-w-10 px-2 text-sm font-bold transition-colors";

  return (
    <nav
      aria-label="Booking pages"
      className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-white pt-4"
    >
      <p className="text-sm text-white/60">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${step} text-white/70 hover:text-white disabled:opacity-30 disabled:pointer-events-none`}
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            chevron_left
          </span>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`${step} ${
              p === page
                ? "text-(--accent-text) underline decoration-2 underline-offset-8"
                : "text-white/60 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${step} text-white/70 hover:text-white disabled:opacity-30 disabled:pointer-events-none`}
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            chevron_right
          </span>
        </button>
      </div>
    </nav>
  );
}
