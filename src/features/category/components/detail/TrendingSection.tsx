import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Category } from "@/features/category/data/categories";
import Link from "next/link";

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
      {category?.venues?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {category.venues.slice(0, 4).map((item: any) => (
            <Link href={`/venues/${item.id}`} key={item.id} className="block bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:shadow-[#ccff00]/5 transition-all cursor-pointer hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop'}
                  alt={item.name}
                  width={600}
                  height={450}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <h4 className="font-bold text-white text-lg mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-1">{item.name}</h4>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description || ''}</p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-base font-bold text-white">₱{item.price?.toLocaleString()}</span>
                  <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-white/30">
          <span className="material-symbols-outlined text-5xl mb-4">explore_off</span>
          <p className="text-sm">No trending venues yet for {category.name}.</p>
        </div>
      )}
    </section>
  );
};
