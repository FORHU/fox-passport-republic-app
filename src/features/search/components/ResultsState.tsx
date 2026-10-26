"use client";

/**
 * What a result list shows when it has nothing to list: the request failed
 * (with a retry), or it worked and nothing matched (naming what to change).
 * Kept apart so an outage never reads as "no results".
 */

export function ResultsError({
  what,
  onRetry,
}: {
  /** "Event Foxers", "gear" … */
  what: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center"
    >
      <p className="text-lg font-bold text-white">
        We couldn&apos;t load {what}.
      </p>
      <p className="mt-1 text-sm text-white/70">
        Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}

export function ResultsEmpty({
  what,
  filtered,
  onClear,
}: {
  what: string;
  /** Whether any search or filter is narrowing the list. */
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
      <p className="text-lg font-bold text-white">No {what} found</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-white/70">
        {filtered
          ? "Nothing matches this search and these filters. Remove a filter or try another city."
          : `There are no ${what} listed yet.`}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-full border border-white/15 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          Clear search and filters
        </button>
      )}
    </div>
  );
}
