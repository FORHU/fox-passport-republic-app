"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { config } from "@/shared/lib/config";

const CATEGORIES = ["Wedding", "Corporate", "Birthday", "Social", "Other"];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function CompactCalendar({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [viewYear, setViewYear] = useState(
    value ? new Date(value + "T00:00:00").getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    value ? new Date(value + "T00:00:00").getMonth() : today.getMonth()
  );

  const dim = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offset = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="glass-card rounded-xl border border-white/10 p-3 w-[260px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#ccff00] active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
        <p className="text-xs font-bold text-[#ccff00] tracking-wide select-none">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#ccff00] active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[9px] text-white/60 font-bold py-1 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past = ds < todayStr;
          const sel = ds === value;
          return (
            <button
              key={ds}
              type="button"
              disabled={past}
              onClick={() => onSelect(ds)}
              className={[
                "h-8 w-full text-[13px] font-semibold transition-all duration-150 flex items-center justify-center",
                sel ? "bg-[#ccff00] text-black rounded-full z-10 shadow-[0_0_12px_rgba(204,255,0,0.4)] scale-105" : "",
                !sel && !past ? "text-white/90 hover:bg-white/10 hover:rounded-full hover:scale-105 cursor-pointer active:scale-95" : "",
                past ? "text-white/20 cursor-not-allowed" : "",
              ].filter(Boolean).join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  error,
  onSelect,
  onClearError,
}: {
  label: string;
  value: string;
  error?: string;
  onSelect: (d: string) => void;
  onClearError: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const safeLeft = Math.min(rect.left, window.innerWidth - 268);
      setPos({ top: rect.bottom + 6, left: Math.max(8, safeLeft) });
    }
    setOpen((o) => !o);
  };

  const display = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex-1 min-w-0 md:min-w-[100px] px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-left cursor-pointer group/item hover:bg-white/10 rounded-2xl transition-colors relative" ref={ref}>
      <span className="block text-[7px] md:text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-0.5 ml-1">{label}</span>
      <button
        type="button"
        onClick={toggle}
        className={`bg-transparent border-none text-[9px] sm:text-xs md:text-sm font-semibold w-full outline-none text-left cursor-pointer truncate ${
          value ? "text-white" : "text-white/40"
        } ${error ? "text-red-400" : ""}`}
      >
        {display || "Select"}
      </button>
      {error && (
        <span className="block text-[7px] md:text-[9px] font-bold text-red-400 mt-0.5 ml-1 animate-pulse truncate">{error}</span>
      )}

      {open &&
        createPortal(
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CompactCalendar
              value={value}
              onSelect={(d) => {
                onSelect(d);
                onClearError();
                close();
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

function CategoryField({
  value,
  error,
  onChange,
  onClearError,
}: {
  value: string;
  error?: string;
  onChange: (val: string) => void;
  onClearError: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(160, rect.width) });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="flex-1 min-w-0 md:min-w-[100px] px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-left cursor-pointer group/item hover:bg-white/10 rounded-2xl transition-colors relative" ref={ref}>
      <span className="block text-[7px] md:text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-0.5 ml-1">CATEGORY</span>
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center justify-between w-full bg-transparent border-none text-[9px] sm:text-xs md:text-sm font-semibold outline-none text-left cursor-pointer ${
          value ? "text-white" : "text-white/40"
        } ${error ? "text-red-400" : ""}`}
      >
        <span className="capitalize truncate">{value || "Select"}</span>
        <span className={`hidden sm:inline-block material-symbols-outlined text-[16px] text-white/40 shrink-0 transition-transform duration-200 ml-1 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>
      {error && (
        <span className="block text-[7px] md:text-[9px] font-bold text-red-400 mt-0.5 ml-1 animate-pulse truncate">{error}</span>
      )}

      {open &&
        createPortal(
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#11121a]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onChange(cat);
                    onClearError();
                    close();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm capitalize transition-all ${
                    value === cat
                      ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function LocationField({
  value,
  error,
  onChange,
  onClearError,
}: {
  value: string;
  error?: string;
  onChange: (val: string) => void;
  onClearError: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [cities, setCities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!value || value.length < 2) {
      setCities([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${config.apiUrl}/locations/search?q=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setCities(data.data.locations);
          }
        })
        .catch(err => console.error("Failed to fetch locations:", err));
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: Math.max(16, rect.left), width: Math.max(180, rect.width) });
    }
    setOpen((o) => !o);
  };

  const locations = ["All Locations", "Baguio", "Manila", "Cebu", "Siargao", "Boracay", "Palawan"];

  return (
    <div className="flex-1 min-w-0 md:min-w-[110px] px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-left cursor-pointer group/item hover:bg-white/10 rounded-2xl transition-colors relative" ref={ref}>
      <span className="block text-[7px] md:text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-0.5 ml-1">LOCATION</span>
      <div className="flex items-center justify-between w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClearError();
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search..."
          className={`bg-transparent border-none text-white placeholder:text-white/40 text-[9px] sm:text-xs md:text-sm font-semibold outline-none focus:ring-0 w-full min-w-0 text-ellipsis p-0 ${error ? "text-red-400" : ""}`}
        />
        <button
          type="button"
          onClick={toggle}
          className="bg-transparent border-none outline-none cursor-pointer p-0 shrink-0 text-white/40 hover:text-white transition-colors"
        >
          <span className={`hidden sm:inline-block material-symbols-outlined text-[16px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>
      </div>
      {error && (
        <span className="block text-[7px] md:text-[9px] font-bold text-red-400 mt-0.5 ml-1 animate-pulse truncate">{error}</span>
      )}

      {showSuggestions && cities.length > 0 && (
        <ul className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-[#11121a] border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 overflow-hidden max-h-60 overflow-y-auto p-0 list-none m-0">
          {cities.map((loc) => (
            <li
              key={loc}
              className="px-4 py-3 text-sm text-white hover:bg-[#ccff00] hover:text-black cursor-pointer font-bold transition-colors list-none"
              onClick={() => {
                onChange(loc);
                onClearError();
                setShowSuggestions(false);
              }}
            >
              {loc}
            </li>
          ))}
        </ul>
      )}

      {open && !showSuggestions &&
        createPortal(
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#11121a]">
              {locations.map((loc) => {
                const val = loc === "All Locations" ? "" : loc;
                const isSelected = value === val;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      onChange(val);
                      onClearError();
                      close();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-[#ccff00]/15 text-[#ccff00]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  birthday:  "bg-lime-400/20 text-lime-300",
  wedding:   "bg-pink-400/20 text-pink-300",
  corporate: "bg-cyan-400/20 text-cyan-300",
  social:    "bg-purple-400/20 text-purple-300",
  other:     "bg-amber-400/20 text-amber-300",
};

interface HeroSectionProps {
  featuredTemplates?: any[];
}

export default function HeroSection({ featuredTemplates = [] }: HeroSectionProps) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const [errors, setErrors] = useState<{
    location?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!locationVal.trim()) nextErrors.location = "Required";
    if (!category) nextErrors.category = "Required";
    if (!startDate) nextErrors.startDate = "Required";
    if (!endDate) nextErrors.endDate = "Required";

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      nextErrors.endDate = "Invalid date";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const params = new URLSearchParams();
    params.set("category", category.toLowerCase());
    const parts = locationVal.split(",").map(p => p.trim());
    if (parts.length > 1) {
      params.set("country", parts[0]);
      params.set("city", parts.slice(1).join(", "));
    } else {
      params.set("city", locationVal);
    }
    params.set("label", locationVal);
    params.set("startDate", startDate);
    params.set("endDate", endDate);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative pt-24 sm:pt-36 lg:pt-40 pb-6 sm:pb-20 lg:pb-32 overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <div className="space-y-6">
              {/* Badge */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } } }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#ccff00]/50 shadow-[0_0_25px_rgba(204,255,0,0.3),0_0_50px_rgba(204,255,0,0.1)] mx-auto lg:mx-0 backdrop-blur-sm animate-bounce duration-1000"
              >
                <span className="flex h-3 w-3 rounded-full bg-[#ccff00] shadow-[0_0_15px_#ccff00,0_0_30px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display">
                  Fresh Drops Daily
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } } }}
                className="text-4xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight text-white leading-tight sm:leading-[0.95] group cursor-default"
              >
                Find your <br />
                <span
                  className="text-gradient relative inline-block hover:scale-105 transition-transform duration-500 cursor-cell"
                  style={{ textShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                >
                  Core Memory.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } } }}
                className="text-xs sm:text-sm lg:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Curated experiences for the main character energy. <br className="block" />
                Underground gigs, secret spots, and adventures that actually matter.
              </motion.p>
            </div>

            {/* Search Area */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } } }}
              className="w-full max-w-[950px] mx-auto lg:mx-0 flex flex-col gap-4 z-20 relative"
            >
              {/* Search Box Form */}
              <form onSubmit={handleSearch} className="w-full relative group z-20 px-2 sm:px-0">
                {/* 1. Outer Glow */}
                <div className="absolute -inset-x-1 sm:-inset-1 bg-linear-to-r from-primary via-purple-600 to-secondary rounded-full sm:rounded-[2.5rem] blur opacity-40 group-hover:opacity-70 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                {/* Outer Capsule Glass Panel */}
                <div className="relative glass-panel bg-[#151326]/85 backdrop-blur-2xl p-1 sm:p-2.5 rounded-full sm:rounded-[2.5rem] border border-white/10 group-hover:border-white/20 transition-all shadow-[0_0_35px_rgba(139,92,246,0.3)]">

                  {/* Single Unified Horizontal Capsule Pill (Responsive for both Mobile & Desktop) */}
                  <div className="flex flex-row items-center gap-0.5 sm:gap-1 lg:gap-2 px-0.5 sm:px-1">
                    {/* 1. CATEGORY */}
                    <CategoryField
                      value={category}
                      error={errors.category}
                      onChange={setCategory}
                      onClearError={() => setErrors((prev) => ({ ...prev, category: undefined }))}
                    />

                    {/* Divider */}
                    <div className="w-px h-6 sm:h-8 bg-white/10 shrink-0"></div>

                    {/* 2. START */}
                    <DateField
                      label="START"
                      value={startDate}
                      error={errors.startDate}
                      onSelect={(d) => {
                        setStartDate(d);
                        setErrors((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
                      }}
                      onClearError={() => setErrors((prev) => ({ ...prev, startDate: undefined }))}
                    />

                    {/* Divider */}
                    <div className="w-px h-6 sm:h-8 bg-white/10 shrink-0"></div>

                    {/* 3. END */}
                    <DateField
                      label="END"
                      value={endDate}
                      error={errors.endDate}
                      onSelect={setEndDate}
                      onClearError={() => setErrors((prev) => ({ ...prev, endDate: undefined }))}
                    />

                    {/* Divider */}
                    <div className="w-px h-6 sm:h-8 bg-white/10 shrink-0"></div>

                    {/* 4. LOCATION */}
                    <LocationField
                      value={locationVal}
                      error={errors.location}
                      onChange={setLocationVal}
                      onClearError={() => setErrors((prev) => ({ ...prev, location: undefined }))}
                    />

                    {/* 5. "Go" Button */}
                    <button
                      type="submit"
                      className="rounded-full bg-white text-black font-extrabold text-[10px] sm:text-sm lg:text-base px-3 py-1.5 sm:px-6 sm:py-3 lg:px-8 lg:py-3.5 shrink-0 transition-all duration-300 hover:bg-white/90 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center cursor-pointer ml-1 font-display"
                    >
                      Go
                    </button>
                  </div>
                </div>
              </form>
              {Object.keys(errors).length > 0 && (
                <div className="text-red-400 text-xs mt-2 text-center lg:text-left font-bold animate-pulse">
                  Please complete all required fields before searching.
                </div>
              )}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } } }}
              className="flex items-center justify-center lg:justify-start gap-6 pt-4"
            >
              <div className="flex -space-x-4 hover:space-x-0 transition-all duration-500">
                <img
                  alt="User"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM"
                />
                <img
                  alt="User"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU"
                />
                <img
                  alt="User"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA"
                />
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-[10px] sm:text-xs font-bold hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer">
                  +2k
                </div>
              </div>
              <div className="text-xs sm:text-sm font-medium text-text-muted group cursor-default">
                <div className="flex text-[#ccff00] mb-0.5 group-hover:gap-0.5 transition-all">
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse">star</span>
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-75">star</span>
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-100">star</span>
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-150">star</span>
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-200">star</span>
                </div>
                Verified by Citizens
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Featured Event Package Cards (Hidden on mobile) */}
          <div className="hidden sm:block lg:col-span-5 relative mt-16 lg:mt-0 perspective-1000">
            <div className="relative grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3 translate-y-12 animate-float">
                {[featuredTemplates[0], featuredTemplates[1]].map((t, i) => {
                  if (!t) return null;
                  const img = t.images?.[0]?.url ?? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop";
                  const loc = [t.targetCity, t.targetState].filter(Boolean).join(", ");
                  const rotations = ["-rotate-3", "rotate-2"];
                  const heights = ["h-52", "h-48"];
                  return (
                    <Link
                      key={t.id}
                      href={`/event/${t.id}`}
                      className={`relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl ${rotations[i]} hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 block`}
                    >
                      <Image
                        src={img}
                        alt={t.name}
                        width={400}
                        height={300}
                        className={`w-full ${heights[i]} object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                      {t.category && (
                        <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${CATEGORY_COLORS[t.category] ?? "bg-white/20 text-white"}`}>
                          {t.category}
                        </span>
                      )}
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-white font-display font-bold text-sm leading-tight line-clamp-1 group-hover:translate-x-1 transition-transform">{t.name}</p>
                        {loc && <p className="text-white/50 text-[10px] mt-0.5">{loc}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Right column */}
              <div className="space-y-3 animate-float-delayed">
                {[featuredTemplates[2], featuredTemplates[3]].map((t, i) => {
                  if (!t) return null;
                  const img = t.images?.[0]?.url ?? "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";
                  const loc = [t.targetCity, t.targetState].filter(Boolean).join(", ");
                  const rotations = ["rotate-3", "-rotate-2"];
                  const heights = ["h-60", "h-52"];
                  return (
                    <Link
                      key={t.id}
                      href={`/event/${t.id}`}
                      className={`relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl ${rotations[i]} hover:rotate-0 hover:scale-105 transition-all duration-500 block`}
                    >
                      <Image
                        src={img}
                        alt={t.name}
                        width={400}
                        height={300}
                        className={`w-full ${heights[i]} object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                      {t.category && (
                        <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${CATEGORY_COLORS[t.category] ?? "bg-white/20 text-white"}`}>
                          {t.category}
                        </span>
                      )}
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-white font-display font-bold text-sm leading-tight line-clamp-1 group-hover:translate-x-1 transition-transform">{t.name}</p>
                        {loc && <p className="text-white/50 text-[10px] mt-0.5">{loc}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Book Now Button: Preserved on desktop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <Link href="/search" className="bg-[#ccff00] text-black px-6 py-3 rounded-full font-display font-bold uppercase tracking-widest text-base shadow-[0_0_30px_#ccff00] animate-pulse hover:scale-110 transition-transform block text-center">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
