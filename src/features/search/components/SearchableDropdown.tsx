"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";

interface SearchableDropdownProps {
  value: string;
  options?: string[];
  // When set, options are fetched live (e.g. Mapbox geocoding) instead of
  // filtered from a static list — used when no static data exists.
  asyncSearch?: (query: string) => Promise<string[]>;
  asyncHint?: string;
  placeholder: string;
  searchPlaceholder: string;
}

export default function SearchableDropdown({
  value,
  options,
  asyncSearch,
  asyncHint = "Type to search...",
  placeholder,
  searchPlaceholder,
  onChange,
}: SearchableDropdownProps & { onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [asyncResults, setAsyncResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setAsyncResults([]);
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [open]);

  useEffect(() => {
    if (!asyncSearch) return;
    const q = query.trim();
    if (q.length < 2) {
      setAsyncResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await asyncSearch(q);
        if (!controller.signal.aborted) setAsyncResults(results);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, asyncSearch]);

  const filtered = useMemo(() => {
    if (asyncSearch) return asyncResults;
    const list = options ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 150);

    // Cities starting with what was typed lead the list; cities that merely
    // contain it elsewhere (e.g. "Anchorage" for "c") trail behind instead of
    // burying the prefix match the user actually typed toward.
    const starts: string[] = [];
    const contains: string[] = [];
    for (const o of list) {
      const lower = o.toLowerCase();
      if (lower.startsWith(q)) starts.push(o);
      else if (lower.includes(q)) contains.push(o);
    }
    return [...starts, ...contains].slice(0, 150);
  }, [options, query, asyncSearch, asyncResults]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00]/50 transition-all"
      >
        <span className={value ? "text-white" : "text-white/30"}>
          {value || placeholder}
        </span>
        <span
          className={`material-symbols-outlined text-[18px] text-white/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-101 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
            }}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-1.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50"
                />
                {loading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
                )}
              </div>
              <div className="max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    !value
                      ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {placeholder}
                </button>
                {filtered.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      value === opt
                        ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                {filtered.length === 0 && asyncSearch && !loading && (
                  <div className="px-3 py-2 text-sm text-white/30">
                    {query.trim().length < 2 ? asyncHint : "No matches"}
                  </div>
                )}
                {filtered.length === 0 && !asyncSearch && (
                  <div className="px-3 py-2 text-sm text-white/30">
                    No matches
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
