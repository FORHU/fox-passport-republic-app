"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useId,
  useCallback,
} from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";

// Options rendered per page; the next page is added as the list nears its end.
const PAGE = 150;

interface SearchableDropdownProps {
  value: string;
  options?: string[];
  // When set, options are fetched live (e.g. Mapbox geocoding) instead of
  // filtered from a static list — used when no static data exists.
  asyncSearch?: (query: string) => Promise<string[]>;
  asyncHint?: string;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
  /** Offer what was typed as a value of its own when nothing matches it —
   * for lists that can't be complete (e.g. every town in a country). */
  allowCustom?: boolean;
  /** The trigger's id, so a `<label htmlFor>` can point at it. */
  id?: string;
  /**
   * The visible label's id. The trigger is then named "label, value"
   * (e.g. "Country, Philippines") instead of by its value alone.
   */
  labelId?: string;
}

export default function SearchableDropdown({
  value,
  options,
  asyncSearch,
  asyncHint = "Type to search...",
  placeholder,
  searchPlaceholder,
  disabled = false,
  allowCustom = false,
  id,
  labelId,
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
  // Inside a modal dialog (the mobile Filters sheet), a panel portaled to
  // <body> sits outside the dialog: its focus trap pulls focus back out of the
  // search box and it blocks pointer events outside itself, so nothing can be
  // typed or tapped. There the panel renders in place instead.
  const [inDialog, setInDialog] = useState(false);
  // The highlighted option - what Enter picks. Never the placeholder row.
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(PAGE);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Focuses the search box as it mounts - the portaled panel mounts a render
  // after `open`, once it's been measured. preventScroll: on iOS focusing
  // scrolls the page, which would trip the close-on-scroll listener below the
  // moment the panel opens.
  const focusOnMount = useCallback((el: HTMLInputElement | null) => {
    el?.focus({ preventScroll: true });
  }, []);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const openMenu = () => {
    const list = options ?? [];
    const selected = value ? list.indexOf(value) : -1;
    setInDialog(!!ref.current?.closest('[role="dialog"]'));
    setQuery("");
    setAsyncResults([]);
    // Start on the current value, with enough of the list rendered to show it.
    setActive(Math.max(selected, 0));
    setShown(Math.max(PAGE, selected + 1));
    setOpen(true);
  };

  const close = (refocus = false) => {
    setOpen(false);
    // The panel unmounts with focus inside it; hand focus back to the trigger
    // so Tab carries on through the form instead of restarting at <body>.
    if (refocus) triggerRef.current?.focus();
  };

  const select = (val: string, refocus = false) => {
    onChange(val);
    close(refocus);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || inDialog || !ref.current) return;
    const measure = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    measure();
    // The panel is a fixed-position portal, so it doesn't move with the
    // trigger on its own. Re-measuring on every scroll event is laggy —
    // React's render is a frame or more behind the actual scroll, so the
    // panel visibly chases the trigger and snaps back once it catches up.
    // Closing on scroll (what most portaled dropdowns do) avoids that
    // entirely: the panel just stays put until it's dismissed.
    // Scrolling the option list itself must not close it - this listens in the
    // capture phase, so it hears the list's own scroll events too.
    const handleScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    // A resize re-measures rather than closes: a phone's on-screen keyboard
    // resizes the viewport as soon as the search box is focused.
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, [open, inDialog]);

  // The static list, filtered by what was typed. Cities starting with it lead;
  // cities that merely contain it elsewhere (e.g. "Anchorage" for "c") trail
  // behind instead of burying the prefix match the user actually typed toward.
  const matches = useMemo(() => {
    const list = options ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    const starts: string[] = [];
    const contains: string[] = [];
    for (const o of list) {
      const lower = o.toLowerCase();
      if (lower.startsWith(q)) starts.push(o);
      else if (lower.includes(q)) contains.push(o);
    }
    return [...starts, ...contains];
  }, [options, query]);

  // Rendered a page at a time, the next page added as the list is scrolled
  // near its end - so all 250 countries are reachable without typing, and a
  // country's thousands of cities don't all mount at once.
  const listed = useMemo(() => matches.slice(0, shown), [matches, shown]);

  // With both a list and `asyncSearch`, the live search only fills in when the
  // list has nothing for what was typed - so a listed city costs no request.
  const searchLive = !!asyncSearch && (!options || matches.length === 0);

  useEffect(() => {
    if (!asyncSearch || !searchLive) return;
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
  }, [query, asyncSearch, searchLive]);

  const filtered = searchLive ? asyncResults : listed;

  // What was typed, offered as its own value when nothing listed matches it.
  const typed = query.trim();
  const custom =
    allowCustom &&
    typed.length > 0 &&
    !filtered.some((o) => o.toLowerCase() === typed.toLowerCase())
      ? typed
      : null;
  // Everything Enter can pick, in display order: the options, then the typed
  // value. The placeholder ("Select country…") row is deliberately not in it.
  const items = custom === null ? filtered : [...filtered, custom];
  const activeIndex = items.length ? Math.min(active, items.length - 1) : -1;

  const onQueryChange = (q: string) => {
    setQuery(q);
    // The first match leads as the user types.
    setActive(0);
    setShown(PAGE);
  };

  const move = (by: number) => {
    if (!items.length) return;
    const next = Math.max(0, Math.min(activeIndex + by, items.length - 1));
    // Arrowing onto the last rendered option brings in the next page.
    if (!searchLive && next >= listed.length - 1 && shown < matches.length)
      setShown((n) => n + PAGE);
    setActive(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Enter":
        // Never submit a surrounding form; pick the highlighted match.
        e.preventDefault();
        if (activeIndex >= 0) select(items[activeIndex], true);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // don't let an ancestor's Escape handler fire too
        close(true);
        break;
    }
  };

  // Keep the highlighted option in view as it moves.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  const optionClass = (selected: boolean, highlighted: boolean) =>
    `w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
      selected
        ? "bg-accent/15 text-accent font-bold"
        : highlighted
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
    } ${selected && highlighted ? "ring-1 ring-accent/50" : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-labelledby={labelId && id ? `${labelId} ${id}-value` : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) close();
          else openMenu();
        }}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span
          id={id ? `${id}-value` : undefined}
          className={value ? "text-white" : "text-white/30"}
        >
          {value || placeholder}
        </span>
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-[18px] text-white/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open &&
        (() => {
          const panel = (
            <div
              ref={menuRef}
              // In place, the glass card's backdrop blur has nothing to blur
              // inside the sheet, so the fields below would show through its
              // translucent fill; the sheet's own surface goes under it.
              className={`${
                inDialog
                  ? "absolute left-0 right-0 top-full mt-1 rounded-xl bg-surface"
                  : "fixed"
              } z-101 animate-in fade-in zoom-in-95 duration-150`}
              style={
                inDialog || !rect
                  ? undefined
                  : { top: rect.top, left: rect.left, width: rect.width }
              }
            >
              <div className="glass-card rounded-xl border border-white/10 p-1.5">
                <div className="relative">
                  <input
                    ref={focusOnMount}
                    type="text"
                    role="combobox"
                    aria-label={searchPlaceholder}
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      activeIndex >= 0 ? optionId(activeIndex) : undefined
                    }
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={searchPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-1.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                  />
                  {loading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
                <div
                  id={listId}
                  role="listbox"
                  aria-label={searchPlaceholder}
                  className="max-h-56 overflow-y-auto"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    if (
                      el.scrollTop + el.clientHeight >= el.scrollHeight - 48 &&
                      shown < matches.length
                    ) {
                      setShown((n) => n + PAGE);
                    }
                  }}
                >
                  {/* Clears the value. Mouse only: Enter never lands here. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => select("")}
                    // Shown as current only before typing, so it never looks
                    // like what Enter will pick.
                    className={optionClass(!value && !typed, false)}
                  >
                    {placeholder}
                  </button>
                  {items.map((opt, i) => {
                    const isCustom = custom !== null && i === items.length - 1;
                    return (
                      <button
                        key={isCustom ? "\u0000custom" : opt}
                        id={optionId(i)}
                        type="button"
                        role="option"
                        tabIndex={-1}
                        aria-selected={i === activeIndex}
                        data-active={i === activeIndex || undefined}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => select(opt)}
                        className={
                          isCustom
                            ? `w-full text-left px-3 py-2 rounded-lg text-sm text-accent transition-all ${
                                i === activeIndex
                                  ? "bg-white/10"
                                  : "hover:bg-white/10"
                              }`
                            : optionClass(value === opt, i === activeIndex)
                        }
                      >
                        {isCustom ? <>Use &ldquo;{opt}&rdquo;</> : opt}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && searchLive && !loading && (
                    <div className="px-3 py-2 text-sm text-white/30">
                      {typed.length < 2 ? asyncHint : "No matches"}
                    </div>
                  )}
                  {filtered.length === 0 && !searchLive && (
                    <div className="px-3 py-2 text-sm text-white/30">
                      No matches
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
          if (inDialog) return panel;
          return rect ? createPortal(panel, document.body) : null;
        })()}
    </div>
  );
}
