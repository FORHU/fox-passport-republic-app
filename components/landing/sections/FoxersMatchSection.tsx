"use client";

import { FOXERS, Foxer } from "@/data/foxers";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FoxersMatchSection() {
  return (
    <section className="py-20 relative overflow-hidden bg-black/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 reveal-on-scroll">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Who&apos;s vibe matches yours?
            </h2>
            <p className="text-lg text-text-muted max-w-2xl">
              Browse Certified Foxers available for your dates at Camp John Hay. These pros know the venue inside out.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/20 shadow-glow-accent animate-pulse-slow">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                alt="User"
              />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors glass-panel">
              <span className="material-symbols-outlined text-[18px]">tune</span> Filters
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors glass-panel">
              Skills <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors glass-panel">
              Date <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors glass-panel">
              Price <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>

          <div className="rounded-full bg-surface-highlight p-1 flex border border-white/10">
            <button className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg">
              <span className="material-symbols-outlined text-[18px]">grid_view</span> Grid
            </button>
            <button className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-text-muted hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">style</span> Vibe Swipe
            </button>
          </div>
        </div>

        {/* Foxers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FOXERS.map((foxer) => (
            <FoxerCard key={foxer.id} foxer={foxer} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="group relative px-8 py-4 rounded-full bg-transparent text-white font-bold transition-all flex items-center gap-2 mx-auto overflow-visible">
            {/* Large diffused glow on hover */}
            <span className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/30 blur-xl"></span>
            <span className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/40 blur-lg"></span>
            {/* Glowing border */}
            <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-[#ccff00] group-hover:shadow-[0_0_20px_rgba(204,255,0,0.6),0_0_40px_rgba(204,255,0,0.3)] transition-all duration-300"></span>
            {/* Dark background */}
            <span className="absolute inset-[2px] rounded-full bg-[#0a0b0f]"></span>
            {/* Button text */}
            <span className="relative z-10 group-hover:text-[#ccff00] transition-colors">Load More Foxers</span>
            <span className="relative z-10 material-symbols-outlined group-hover:text-[#ccff00] animate-bounce">
              arrow_downward
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

// Sub-component for foxer cards
function FoxerCard({ foxer }: { foxer: Foxer }) {
  const router = useRouter();

  return (
    <div className="group glass-card rounded-[2rem] p-8 hover:border-primary/50 transition-all duration-300 card-hover-effect relative">
      {/* Stretched Link for the whole card to profile */}
      <Link href={`/foxer/${foxer.id}`} className="absolute inset-0 z-0 rounded-[2rem]" aria-label={`View ${foxer.name}'s profile`}>
        <span className="sr-only">View Profile</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10 pointer-events-none">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={foxer.avatar}
              alt={foxer.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-surface-highlight group-hover:scale-105 transition-transform"
            />
            {foxer.online && (
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-surface-highlight ring-2 ring-black"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1 font-display font-bold text-xl text-white">
              {foxer.name}{" "}
              <span className="material-symbols-outlined text-primary text-[18px] fill-current">
                verified
              </span>
            </div>
            <div className="text-text-muted text-sm">{foxer.role}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 font-bold text-white">
            {foxer.rating}{" "}
            <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">
              star
            </span>
          </div>
          <div className="text-xs text-text-muted">{foxer.reviews} reviews</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-6 line-clamp-2 min-h-[40px] leading-relaxed relative z-10 pointer-events-none">
        {foxer.desc}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {foxer.tags.map((tag, idx) => (
          <span
            key={idx}
            className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-gray-400 border border-white/5 group-hover:text-white transition-colors hover:bg-white/10 cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Portfolio Images */}
      <div className="flex justify-between gap-3 mb-8 relative z-10 pointer-events-none">
        {foxer.images.map((img, idx) => (
          <div
            key={idx}
            className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300 first:rotate-[-3deg] last:rotate-[3deg]"
          >
            <img src={img} alt="Work" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 relative z-20">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/match/${foxer.id}`);
          }}
          className="flex-1 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] flex items-center justify-center cursor-pointer"
        >
          Match Me
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors group/heart cursor-pointer"
        >
          <span className="material-symbols-outlined group-hover/heart:scale-125 transition-transform">
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}
