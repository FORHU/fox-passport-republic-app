import React from "react";
import { Category } from "@/types/category";

interface CategoryHeroProps {
  category: Category;
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({ category }) => {
  // Default to a visible gradient if none provided (e.g. gray to white) rather than dark-to-black
  const gradientColors = category?.gradient || "from-white to-gray-500";



  return (
    <div className="mb-20 relative">
      {/* Force-include dynamic gradient classes for Tailwind JIT */}
      <div className="hidden">
        from-lime-300 via-green-400 to-emerald-500
        from-pink-300 via-rose-400 to-red-400
        from-amber-200 via-yellow-400 to-orange-500
        from-emerald-400 via-teal-500 to-cyan-500
        from-indigo-400 via-purple-500 to-pink-500
      </div>

      {/* Glow Effect */}
      <div className={`absolute -top-32 -left-20 w-[500px] h-[500px] bg-linear-to-br ${gradientColors} rounded-full blur-[150px] opacity-30 pointer-events-none`}></div>
      
      <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider uppercase text-gray-500">
          <span>Categories</span>  
          <span className="text-gray-700">&gt;</span>
          <span className={`inline-block text-transparent bg-clip-text bg-linear-to-r ${gradientColors}`}>
            {category.name.toUpperCase()}
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black font-display text-white mb-8 leading-tight tracking-tight">
          Explore <br />
          <span className={`inline-block text-transparent bg-clip-text bg-linear-to-r ${gradientColors}`}>
            {category.name}
          </span>
        </h1>
        
        <p className="text-2xl text-gray-400 max-w-2xl leading-relaxed font-light">
          {category.tagline}
        </p>
      </div>
    </div>
  );
};
