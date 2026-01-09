"use client";

import { Category } from "@/data/categories";

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
    <a
      href="#"
      className="group relative flex flex-col justify-end rounded-3xl border border-white/5 h-[280px] overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={category.image} 
          alt={category.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Default Content */}
      <div className="relative z-10 p-5 transition-all duration-300 group-hover:-translate-y-2">
        <h3 className="text-xl font-bold text-white mb-1 leading-tight font-display">
          {category.title}
        </h3>
        <p className="text-sm text-white/70">{category.tagline}</p>
        <p className="text-xs text-[#ccff00] mt-2 font-bold">{category.spots}</p>
      </div>

      {/* Child Categories Overlay (Slides up) */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl p-5 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
        <h4 className="text-xs font-bold text-[#ccff00] uppercase tracking-wider mb-3">
          {category.title}
        </h4>
        <ul className="space-y-2">
          {category.children.map((child) => (
            <li
              key={child.id}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-[#ccff00] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-white/40">{child.icon}</span>
              {child.name}
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
}
