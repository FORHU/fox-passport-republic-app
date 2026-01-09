"use client";

import { Category } from "@/data/categories";
import Link from "next/link";

interface VibeCheckSectionProps {
  categories: Category[];
}

export default function VibeCheckSection({
  categories,
}: VibeCheckSectionProps) {
  return (
    <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none"></div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end relative z-20 reveal-on-scroll">
        <div>
          <h2 className="text-3xl font-display font-bold text-white group cursor-default">
            <span className="inline-block hover:animate-wiggle">Vibe</span>{" "}
            <span className="inline-block hover:text-accent transition-colors">Check</span>
          </h2>
          <p className="text-text-muted mt-1">Browse by category</p>
        </div>
      </div>

      {/* Category Grid */}
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 reveal-on-scroll"
        style={{ transitionDelay: "100ms" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <CategoryCard key={cat.id} category={cat} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Sub-component for category cards
function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <div
      className="group relative flex flex-col justify-end rounded-3xl border border-white/5 h-[280px] overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Main Link for the entire card */}
      <Link href={`/categories/${category.id}`} className="absolute inset-0 z-20">
        <span className="sr-only">View {category.title}</span>
      </Link>
      
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src={category.image} 
          alt={category.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 transition-all duration-300 group-hover:-translate-y-2 pointer-events-none">
        <h3 className="text-xl font-bold text-white mb-1 leading-tight font-display">
          {category.title}
        </h3>
        <p className="text-sm text-white/70">{category.tagline}</p>
        <p className="text-xs text-[#ccff00] mt-2 font-bold">{category.spots}</p>
      </div>
    </div>
  );
}
