import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Category } from "@/data/categories";
import { getIconComponent } from "@/components/categories/icon-utils";

interface CategoryGridProps {
  category: Category;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ category }) => {
  const router = useRouter();
  const gradientColors = category?.color || "from-gray-700 to-black";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
      {category.children.map((sub) => {
        const SubIcon = getIconComponent(sub.icon);
        return (
          <div 
            key={sub.id} 
            className="group relative bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-64"
            onClick={() => router.push(`/categories?type=${encodeURIComponent(sub.name)}`)}
          >
            {/* Background Image */}
            {sub.image && (
              <>
                <Image
                  src={sub.image}
                  alt={sub.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                />
                <div className="absolute inset-0 bg-black/60 z-0" />
              </>
            )}

            {/* Hover Gradient Bloom - Made subtle if image is visible */}
            <div className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-br ${gradientColors} blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none z-1`}></div>
            
            <div className="relative z-10 mb-8 flex items-start justify-between">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/10 backdrop-blur-md">
                <SubIcon className="w-8 h-8" />
              </div>
              {/* Mock Count Badge */}
              <div className="h-8 px-4 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400 backdrop-blur-md">
                {/* Generates a stable pseudo-random number based on name length */}
                {(sub.name.length * 7) % 20 + 5} events
              </div>
            </div>
            
            <div className="relative z-10 mt-auto">
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#ccff00] transition-colors drop-shadow-md">{sub.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors font-medium">
                <span>View listings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
