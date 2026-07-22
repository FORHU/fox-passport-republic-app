"use client";

import { motion } from "motion/react";
import { Category } from "@/features/category/types/category";
import Link from "next/link";

// Default image for categories without images
const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";

interface VibeCheckSectionProps {
  categories: Category[];
}

export default function VibeCheckSection({
  categories,
}: VibeCheckSectionProps) {
  return (
    <section className="py-4 sm:py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background z-10 pointer-events-none"></div>

      {/* Header */}
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end relative z-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white group cursor-default">
            <span className="inline-block hover:animate-wiggle">Vibe</span>{" "}
            <span className="inline-block hover:text-accent transition-colors">Check</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Browse by category</p>
        </div>
      </motion.div>

      {/* Category Grid */}
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        <div className="flex overflow-x-auto gap-4 pb-3 snap-x snap-mandatory hide-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:pb-6 sm:overflow-visible">
          {categories.map((cat, idx) => (
            <CategoryCard key={cat.name || idx} category={cat} index={idx} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// Sub-component for category cards
function CategoryCard({ category }: { category: Category; index: number }) {
  return (
    <motion.div
      className="group relative flex flex-col justify-end rounded-3xl border border-white/5 shrink-0 w-[65vw] max-w-60 h-50 sm:w-auto sm:max-w-none sm:h-70 snap-center overflow-hidden hover:border-white/20 transition-colors duration-300"
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] } } }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Main Link for the entire card */}
      <Link href={`/categories/${category.name.toLowerCase()}`} className="absolute inset-0 z-20">
        <span className="sr-only">View {category.name}</span>
      </Link>

      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={category.image || DEFAULT_CATEGORY_IMAGE}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-5 transition-all duration-300 group-hover:-translate-y-2 pointer-events-none">
        <h3 className="text-sm sm:text-xl font-bold mb-1 leading-tight font-display capitalize text-white">
          {category.name}
        </h3>
        <p className="text-xs sm:text-sm text-white/70 line-clamp-2">{category.tagline || category.description || "Explore experiences"}</p>
        {category.spotLabel && (
          <p className="text-xs sm:text-sm mt-2 font-bold text-white/60">{category.spotLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
