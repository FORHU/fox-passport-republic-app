"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface EntitySearchPickerProps {
  selected: PickerItem | null;
  onSelect: (item: PickerItem | null) => void;
  search: (query: string) => Promise<PickerItem[]>;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
}

// A search-as-you-type picker that resolves to an {id, label} pair rather
// than a bare string — modeled on SearchableDropdown's portal/debounce/
// scroll-close behavior, but that component only round-trips a string
// (fine for city names, where the label IS the value; not fine here, where
// we need the id underneath the name the user picked).
export function EntitySearchPicker({
  selected,
  onSelect,
  search,
  placeholder,
  searchPlaceholder,
  disabled = false,
}: EntitySearchPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickerItem[]>([]);
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
    setResults([]);
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
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await search(q);
        if (!controller.signal.aborted) setResults(found);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {selected ? (
          <span className="min-w-0 text-left">
            <span className="block truncate text-white">
              {selected.label}
            </span>
            {selected.sublabel && (
              <span className="block truncate text-[11px] text-white/40">
                {selected.sublabel}
              </span>
            )}
          </span>
        ) : (
          <span className="text-white/30">{placeholder}</span>
        )}
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="material-symbols-outlined text-[16px] text-white/30 hover:text-white/70 transition-colors"
            >
              close
            </span>
          )}
          <span
            className={`material-symbols-outlined text-[18px] text-white/40 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </span>
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-101 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-1.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                />
                {loading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              <div className="max-h-56 overflow-y-auto">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selected?.id === item.id
                        ? "bg-accent/15 text-accent font-bold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="block truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="block truncate text-[11px] opacity-60">
                        {item.sublabel}
                      </span>
                    )}
                  </button>
                ))}
                {!loading && results.length === 0 && (
                  <div className="px-3 py-2 text-sm text-white/30">
                    {query.trim().length < 2
                      ? "Type at least 2 characters to search"
                      : "No matches"}
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
