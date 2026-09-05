"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryField } from "./CategoryField";
import { DateField } from "./DateField";
import { LocationField } from "./LocationField";

export function HeroSearchForm() {
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
    const parts = locationVal.split(",").map((p) => p.trim());
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
    <div className="w-full max-w-[950px] mx-auto lg:mx-0 flex flex-col gap-4 z-20 relative">
      <form
        onSubmit={handleSearch}
        className="w-full relative group z-20 px-2 sm:px-0"
      >
        {/* 1. Outer Glow */}
        <div className="absolute -inset-x-1 sm:-inset-1 bg-linear-to-r from-primary via-purple-600 to-secondary rounded-full sm:rounded-[2.5rem] blur opacity-40 group-hover:opacity-70 transition duration-500 group-hover:duration-200 animate-pulse"></div>

        {/* Outer Capsule Glass Panel */}
        <div className="relative glass-panel bg-[#151326]/85 backdrop-blur-2xl p-1 sm:p-2.5 rounded-full sm:rounded-[2.5rem] border border-white/10 group-hover:border-white/20 transition-all shadow-[0_0_35px_rgba(139,92,246,0.3)]">
          <div className="flex flex-row items-center gap-0.5 sm:gap-1 lg:gap-2 px-0.5 sm:px-1">
            {/* 1. CATEGORY */}
            <CategoryField
              value={category}
              error={errors.category}
              onChange={setCategory}
              onClearError={() =>
                setErrors((prev) => ({ ...prev, category: undefined }))
              }
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
                setErrors((prev) => ({
                  ...prev,
                  startDate: undefined,
                  endDate: undefined,
                }));
              }}
              onClearError={() =>
                setErrors((prev) => ({ ...prev, startDate: undefined }))
              }
            />

            {/* Divider */}
            <div className="w-px h-6 sm:h-8 bg-white/10 shrink-0"></div>

            {/* 3. END */}
            <DateField
              label="END"
              value={endDate}
              error={errors.endDate}
              onSelect={setEndDate}
              onClearError={() =>
                setErrors((prev) => ({ ...prev, endDate: undefined }))
              }
            />

            {/* Divider */}
            <div className="w-px h-6 sm:h-8 bg-white/10 shrink-0"></div>

            {/* 4. LOCATION */}
            <LocationField
              value={locationVal}
              error={errors.location}
              onChange={setLocationVal}
              onClearError={() =>
                setErrors((prev) => ({ ...prev, location: undefined }))
              }
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
    </div>
  );
}
