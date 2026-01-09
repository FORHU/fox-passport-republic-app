import React from "react";
import { Category } from "@/data/categories";

interface CategoryHeroProps {
  category: Category;
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({ category }) => {
  const gradientColors = category?.color || "from-gray-700 to-black";

  return (
    <div className="mb-20 relative">
      {/* Glow Effect */}
      <div className={`absolute -top-32 -left-20 w-[500px] h-[500px] bg-linear-to-br ${gradientColors} rounded-full blur-[150px] opacity-30 pointer-events-none`}></div>
      
      <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">        
        <h1 className="text-5xl md:text-8xl font-black font-display text-white mb-8 leading-tight tracking-tight">
          Explore <br />
          <span className={`text-transparent bg-clip-text bg-linear-to-r ${gradientColors}`}>
            {category.title}
          </span>
        </h1>
        
        <p className="text-2xl text-gray-400 max-w-2xl leading-relaxed font-light">
          {category.tagline} <br/>
          <span className="text-gray-500 text-lg mt-2 block">
              Choose a subcategory below to find your specific vibe.
          </span>
        </p>
      </div>
    </div>
  );
};
