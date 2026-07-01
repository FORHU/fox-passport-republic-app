"use client";

import { useSearch } from "@/features/search/hooks/useSearch";
import SearchResultCard from "@/features/search/components/SearchResultCard";

function SkeletonCard() {
  return (
    <div className="bg-[#11121a] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-4 bg-white/5 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const { data, isLoading, error, type } = useSearch();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
        <p className="text-white/60 text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-[56px] text-white/20">search_off</span>
        <h3 className="text-2xl font-bold text-white">No results found</h3>
        <p className="text-white/60 max-w-sm">Try adjusting your filters to find what you&apos;re looking for.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item: any) => (
        <SearchResultCard key={item.id} item={item} type={type} />
      ))}
    </div>
  );
}