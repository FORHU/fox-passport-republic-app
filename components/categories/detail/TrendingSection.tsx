import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Category } from "@/data/categories";

interface TrendingSectionProps {
  category: Category;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ category }) => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-bold text-white tracking-tight">Trending in {category.name}</h2>
        <button className="text-sm font-bold text-white hover:text-[#ccff00] transition-colors flex items-center gap-2 group">
          View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:shadow-[#ccff00]/5 transition-all cursor-pointer hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden">
                  <Image 
                    src={[
                      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop"
                    ][i-1]}
                    alt="Event"
                    width={600}
                    height={450}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse"></span>
                    Live
                  </div>
              </div>
              <div className="p-6">
                  <h4 className="font-bold text-white text-lg mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-1">
                    {[
                      "Neon Jungle Rave 2024",
                      "Summer Music Festival", 
                      "Midnight Jazz Club",
                      "Rooftop Sunset Party"
                    ][i-1]}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    Experience the ultimate vibe with amazing music and great company.
                  </p>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-base font-bold text-white">₱1,500</span>
                    <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                        <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};
