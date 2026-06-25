import React from "react";
import { Search } from "lucide-react";

interface CategoryListHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CategoryListHero: React.FC<CategoryListHeroProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-10">
        <a href="/" className="hover:text-pink-500 transition-colors">Home</a>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900">Select Category</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="max-w-xl">
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
            What's the <span className="text-pink-500 italic">vibe</span> today?
          </h2>
          <p className="text-xl text-slate-500 font-medium">
            Let's find your next core memory. Select a category to get started.
          </p>
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-none ring-1 ring-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 focus:shadow-lg transition-all outline-none"
          />
        </div>
      </div>
    </>
  );
};
