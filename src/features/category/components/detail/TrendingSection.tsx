import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface TrendingSectionProps {
  category: any;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ category }) => {
  const trending: any[] = category?.trending ?? [];

  // Only render once at least one template has a confirmed booking
  if (trending.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mb-24">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          Trending in {category.name}
        </h2>
        <Link
          href={`/categories/${category.slug ?? category.id}`}
          className="text-sm font-bold text-white hover:text-[#ccff00] transition-colors flex items-center gap-2 group"
        >
          View all{" "}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trending.slice(0, 4).map((template: any, i: number) => {
          const img =
            template.images?.[0]?.url ??
            template.images?.[0] ??
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop";
          const location = [template.targetCity, template.targetState]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={template.id}
              href={`/event/${template.id}`}
              className="group bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ccff00]/5 transition-all duration-300 block"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={img}
                  alt={template.name}
                  width={600}
                  height={450}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                {template.bookingCount > 0 && (
                  <div className="absolute top-3 left-3 bg-[#ccff00] text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                    🔥 {template.bookingCount} booked
                  </div>
                )}
              </div>

              <div className="p-5">
                <h4 className="font-bold text-white text-base mb-1 group-hover:text-[#ccff00] transition-colors line-clamp-1">
                  {template.name}
                </h4>
                {location && (
                  <p className="text-gray-500 text-xs flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {location}
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs text-gray-500">
                    by {template.owner?.name ?? "Organizer"}
                  </span>
                  <span className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
