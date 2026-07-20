"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
      setPos({ top: rect.bottom + 6, left: rect.left });
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
    <div className="flex-1 w-auto px-4 py-3 text-left cursor-pointer group/item hover:bg-white/10 transition-colors relative" ref={ref}>
      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 ml-1">{label}</span>
      <button
        type="button"
        onClick={toggle}
        className={`bg-transparent border-none text-white text-xs font-bold w-full h-6 outline-none text-left ${
          value ? "" : "text-white/40"
        } ${error ? "text-red-400" : ""}`}
      >
        {display || "Select date"}
      </button>
      {error && (
        <span className="block text-[10px] font-bold text-red-400 mt-1 ml-1 animate-pulse">{error}</span>
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
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="flex-1 w-auto px-4 py-3 text-left cursor-pointer group/item hover:bg-white/10 transition-colors relative" ref={ref}>
      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 ml-1">Category</span>
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center justify-between w-full bg-transparent border-none text-white text-xs font-bold h-6 outline-none text-left ${
          value ? "" : "text-white/40"
        } ${error ? "text-red-400" : ""}`}
      >
        <span className="capitalize truncate">{value || "Select..."}</span>
        <span className={`material-symbols-outlined text-[16px] text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>
      {error && (
        <span className="block text-[10px] font-bold text-red-400 mt-1 ml-1 animate-pulse">{error}</span>
      )}

      {open &&
        createPortal(
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onChange(cat);
                    onClearError();
                    close();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${
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


export default function HeroSection() {
  const router = useRouter();
  const [locationVal, setLocationVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<{
    location?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    if (!locationVal || locationVal.length < 2) {
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${config.apiUrl}/locations/search?q=${encodeURIComponent(locationVal)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setCities(data.data.locations);
          }
        })
        .catch(err => console.error("Failed to fetch locations:", err));
    }, 300);

    return () => clearTimeout(timer);
  }, [locationVal]);

  const filteredLocations = cities;

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left reveal-on-scroll">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#ccff00]/50 shadow-[0_0_25px_rgba(204,255,0,0.3),0_0_50px_rgba(204,255,0,0.1)] mx-auto lg:mx-0 backdrop-blur-sm animate-bounce duration-1000">
                <span className="flex h-3 w-3 rounded-full bg-[#ccff00] shadow-[0_0_15px_#ccff00,0_0_30px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display">
                  Fresh Drops Daily
                </span>
              </div>

              {/* Title */}
              <h1 className="text-6xl font-display font-bold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95] group cursor-default">
                Find your <br />
                <span
                  className="text-gradient relative inline-block hover:scale-105 transition-transform duration-500 cursor-cell"
                  style={{ textShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                >
                  Core Memory.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Curated experiences for the main character energy. Underground gigs, secret spots, and adventures that actually matter.
              </p>
            </div>

            {/* Search Area */}
            <div className="w-full max-w-3xl mx-auto lg:mx-0 flex flex-col gap-4 z-20 relative">


              {/* Search Box */}
              <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto lg:mx-0 relative group z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-secondary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                <div className="relative glass-panel bg-black/80 backdrop-blur-2xl px-6 py-2 rounded-full border border-white/10 group-hover:border-white/20 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  <div className="flex flex-row items-center gap-0">
                    
                    {/* Category */}
                    <CategoryField
                      value={category}
                      error={errors.category}
                      onChange={setCategory}
                      onClearError={() => setErrors((prev) => ({ ...prev, category: undefined }))}
                    />

                    <div className="h-8 w-px bg-white/10"></div>

                    {/* Start Date */}
                    <DateField
                      label="Start"
                      value={startDate}
                      error={errors.startDate}
                      onSelect={(d) => {
                        setStartDate(d);
                        setErrors((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
                      }}
                      onClearError={() => setErrors((prev) => ({ ...prev, startDate: undefined }))}
                    />

                    <div className="h-8 w-px bg-white/10"></div>

                    {/* End Date */}
                    <DateField
                      label="End"
                      value={endDate}
                      error={errors.endDate}
                      onSelect={setEndDate}
                      onClearError={() => setErrors((prev) => ({ ...prev, endDate: undefined }))}
                    />

                    <div className="h-8 w-px bg-white/10"></div>

                    {/* Location */}
                    <div className="flex-[1.5] w-auto px-6 py-3 text-left relative" ref={locationRef}>
                      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 ml-1">Location</span>
                      <input 
                        id="locationInput"
                        className={`bg-transparent border-none text-white placeholder:text-white/20 placeholder:text-[10px] focus:ring-0 text-xs font-bold w-full h-6 outline-none text-left ${errors.location ? "text-red-400" : ""}`} 
                        placeholder="Search location..." 
                        type="text" 
                        autoComplete="off"
                        value={locationVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocationVal(val);
                        setShowSuggestions(true);
                        setErrors((prev) => ({ ...prev, location: undefined }));
                        if (val.length < 2) {
                          setCities([]);
                        }
                      }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      {showSuggestions && filteredLocations.length > 0 && (
                        <ul id="locationSuggestions" className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-[#11121a] border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 overflow-hidden max-h-60 overflow-y-auto">
                          {filteredLocations.map(loc => (
                            <li
                              key={loc}
                              className="px-4 py-3 text-sm text-white hover:bg-[#ccff00] hover:text-black cursor-pointer font-bold transition-colors"
                              onClick={() => {
                                setLocationVal(loc);
                                setShowSuggestions(false);
                              }}
                            >
                              {loc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button type="submit" className="btn-neon h-12 w-32 rounded-full bg-white text-black font-bold transition-all duration-300 flex items-center justify-center text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] ml-4 hover:scale-105 active:scale-95">
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
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex -space-x-4 hover:space-x-0 transition-all duration-500">
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM"
                />
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU"
                />
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-xs font-bold hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer">
                  +2k
                </div>
              </div>
              <div className="text-sm font-medium text-text-muted group cursor-default">
                <div className="flex text-[#ccff00] text-lg mb-1 group-hover:gap-1 transition-all">
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-75">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-100">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-150">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-200">star</span>
                </div>
                Verified by Citizens
              </div>
            </div>
          </div>

          {/* Right Image Grid */}
          <div className="lg:col-span-5 relative mt-16 lg:mt-0 perspective-1000">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4 translate-y-12 animate-float">
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
                  <img
                    alt="Weddings & Commitments"
                    className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Weddings
                  </span>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <span className="material-symbols-outlined text-white text-[16px]">arrow_outward</span>
                  </div>
                </div>
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img
                    alt="Private Experiences"
                    className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Private Dining
                  </span>
                </div>
              </div>
              <div className="space-y-4 animate-float-delayed">
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img
                    alt="Celebrations"
                    className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Celebrations
                  </span>
                </div>
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
                  <img
                    alt="Signature Places"
                    className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Signature Places
                  </span>
                </div>
              </div>
              {/* Trending Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="bg-[#ccff00] text-black px-6 py-3 rounded-full font-display font-bold uppercase tracking-widest shadow-[0_0_30px_#ccff00] transform animate-pulse border border-white/20 pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  Trending
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
