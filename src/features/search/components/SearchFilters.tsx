"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  event_template: ["corporate", "birthday", "wedding", "social", "other"],
  venue: ["indoor", "outdoor", "mix", "hotel", "beach_resort", "garden", "other"],
  service: ["design", "catering", "entertainment", "service_staff", "other"],
  asset: ["furnitures", "sound_system", "decorations", "other"],
};

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams?.get("type") || "event_template";
  const initial = {
    city: searchParams?.get("city") || "",
    category: searchParams?.get("category") || "",
    minPrice: searchParams?.get("minPrice") || "",
    maxPrice: searchParams?.get("maxPrice") || "",
  };
  const [city, setCity] = useState(initial.city);
  const [category, setCategory] = useState(initial.category);
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    setCity(params.get("city") || "");
    setCategory(params.get("category") || "");
    setMinPrice(params.get("minPrice") || "");
    setMaxPrice(params.get("maxPrice") || "");
  }, [searchParams]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const categories = CATEGORIES_BY_TYPE[type] || [];

  return (
    <div className="bg-[#11121a] border border-white/10 rounded-2xl p-6 space-y-6 h-fit sticky top-28">
      <h3 className="text-lg font-bold text-white">Filters</h3>

      {/* City */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={(e) => updateParams({ city: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ city: e.currentTarget.value })}
          placeholder="e.g. Manila"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Category</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateParams({ category: e.target.value });
          }}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00]/50"
        >
          <option value="" className="bg-[#11121a]">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#11121a] capitalize">
              {cat.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={(e) => updateParams({ minPrice: e.target.value })}
            placeholder="Min"
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50"
          />
          <span className="text-white/30">—</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={(e) => updateParams({ maxPrice: e.target.value })}
            placeholder="Max"
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50"
          />
        </div>
      </div>

      <button
        onClick={() => {
          setCity("");
          setCategory("");
          setMinPrice("");
          setMaxPrice("");
          updateParams({ city: "", category: "", minPrice: "", maxPrice: "" });
        }}
        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
}
