"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import SearchFilters from "@/features/search/components/SearchFilters";
import SearchResults from "@/features/search/components/SearchResults";

const Pill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-bold text-sm transition-all border whitespace-nowrap ${
      active ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
    }`}
  >
    {label}
  </button>
);

const CategoryPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all border whitespace-nowrap ${
      active
        ? "bg-transparent text-[#ccff00] border-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.2)]"
        : "bg-white/5 text-white/60 border-transparent hover:bg-white/10"
    }`}
  >
    {label}
  </button>
);

const getCategoriesForType = (t: string) => {
  switch (t) {
    case "event_template": return ["Corporate", "Birthday", "Wedding", "Social", "Other"];
    case "venue": return ["Indoor", "Outdoor", "Mix", "Hotel", "Beach Resort", "Garden", "Other"];
    case "service": return ["Design", "Catering", "Entertainment", "Service Staff", "Other"];
    case "asset": return ["Furnitures", "Sound System", "Decorations", "Other"];
    default: return [];
  }
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams?.get("type") || "event_template";
  const category = searchParams?.get("category") || "";
  const q = searchParams?.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams?.get("q") || "";
      if (searchQuery !== currentQ) {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        router.replace(`/search?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("type", newType);
    params.delete("category");
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (newCategory: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0c0d14] text-white pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-0 w-full border-b border-white/5 bg-[#0c0d14] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="material-symbols-outlined text-black text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                explore
              </span>
            </div>
            <span className="text-2xl font-black font-display tracking-tight text-white">Discover</span>
          </Link>

          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ANYTHING..."
              className="w-[450px] bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-6 text-sm font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all tracking-wider"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4">
            <div className="flex gap-8">
              <button
                onClick={() => handleTypeChange("event_template")}
                className={`text-2xl font-bold pb-4 relative ${type === "event_template" ? "text-white" : "text-white/50 hover:text-white/80"}`}
              >
                Experiences
                {type === "event_template" && (
                  <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ccff00] rounded-t-lg shadow-[0_0_10px_#ccff00]" />
                )}
              </button>
              <button
                onClick={() => handleTypeChange("pros")}
                className={`text-2xl font-bold pb-4 relative ${
                  ["venue", "service", "asset", "pros"].includes(type) ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                Pros & Gear
                {["venue", "service", "asset", "pros"].includes(type) && (
                  <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ccff00] rounded-t-lg shadow-[0_0_10px_#ccff00]" />
                )}
              </button>
            </div>
            <div className="text-sm italic text-white/50 font-light mb-4">
              {type === "event_template"
                ? "Curated moments for your main character energy."
                : "Hire the infrastructure you need to build your own."}
            </div>
          </div>

          {["venue", "service", "asset", "pros"].includes(type) && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Pill label="All" active={type === "pros"} onClick={() => handleTypeChange("pros")} />
              <Pill label="Venue" active={type === "venue"} onClick={() => handleTypeChange("venue")} />
              <Pill label="Service" active={type === "service"} onClick={() => handleTypeChange("service")} />
              <Pill label="Gear" active={type === "asset"} onClick={() => handleTypeChange("asset")} />
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {type === "event_template" ? (
              <>
                <Pill label="All" active={!category} onClick={() => handleCategoryChange("")} />
                {getCategoriesForType(type).map((cat) => (
                  <Pill key={cat} label={cat} active={category === cat.toLowerCase()} onClick={() => handleCategoryChange(cat.toLowerCase())} />
                ))}
              </>
            ) : type !== "pros" ? (
              <>
                <CategoryPill label="All" active={!category} onClick={() => handleCategoryChange("")} />
                {getCategoriesForType(type).map((cat) => {
                  const catValue = cat.toLowerCase().replace(/ /g, "_");
                  return (
                    <CategoryPill key={cat} label={cat} active={category === catValue} onClick={() => handleCategoryChange(catValue)} />
                  );
                })}
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <SearchFilters />
          </aside>
          <main className="flex-1 min-w-0">
            <SearchResults />
          </main>
        </div>
      </div>
    </div>
  );
}
