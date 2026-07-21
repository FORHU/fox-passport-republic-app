"use client";

export default function FeaturesSection() {
  return (
    <section className="py-6 sm:py-16 border-t border-white/5 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-4 pb-2 md:pb-0 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
          {/* Feature 1: Verified */}
          <div className="flex-shrink-0 w-[65vw] max-w-[240px] sm:w-auto sm:max-w-none snap-center bg-surface-highlight/30 rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-10 hover:bg-surface-highlight/50 transition-all duration-300 group border border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] reveal-on-scroll">
            <div className="h-9 w-9 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <span className="material-symbols-outlined text-[22px] sm:text-[36px]">check_circle</span>
            </div>
            <h3 className="text-base sm:text-2xl font-display font-bold text-white mb-1.5 sm:mb-3">Verified Vibes Only</h3>
            <p className="text-[11px] sm:text-base text-text-muted leading-relaxed group-hover:text-white transition-colors">
              No catfishing here. We verify every foxer and venue so you can book with zero stress and 100% confidence.
            </p>
          </div>

          {/* Feature 2: Instant Booking */}
          <div className="flex-shrink-0 w-[65vw] max-w-[240px] sm:w-auto sm:max-w-none snap-center bg-surface-highlight/30 rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-10 hover:bg-surface-highlight/50 transition-all duration-300 group border border-white/5 hover:border-[#ccff00]/50 hover:shadow-[0_0_30px_-5px_rgba(204,255,0,0.3)] reveal-on-scroll" style={{ transitionDelay: "150ms" }}>
            <div className="h-9 w-9 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-[#ccff00]/10 text-[#ccff00] flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-[#ccff00] group-hover:text-black transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]">
              <span className="material-symbols-outlined text-[22px] sm:text-[36px]">bolt</span>
            </div>
            <h3 className="text-base sm:text-2xl font-display font-bold text-white mb-1.5 sm:mb-3">Instant Booking</h3>
            <p className="text-[11px] sm:text-base text-text-muted leading-relaxed group-hover:text-white transition-colors">
              Skip the DMs. Book your spot instantly and get your tickets directly to your phone. Fast, secure, easy.
            </p>
          </div>

          {/* Feature 3: Find Your Crew */}
          <div className="flex-shrink-0 w-[65vw] max-w-[240px] sm:w-auto sm:max-w-none snap-center bg-surface-highlight/30 rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-10 hover:bg-surface-highlight/50 transition-all duration-300 group border border-white/5 hover:border-pink-500/50 hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)] reveal-on-scroll" style={{ transitionDelay: "300ms" }}>
            <div className="h-9 w-9 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <span className="material-symbols-outlined text-[22px] sm:text-[36px]">pets</span>
            </div>
            <h3 className="text-base sm:text-2xl font-display font-bold text-white mb-1.5 sm:mb-3">Find Your Crew</h3>
            <p className="text-[11px] sm:text-base text-text-muted leading-relaxed group-hover:text-white transition-colors">
              See who&apos;s going, join group chats, and make memories with people who match your energy perfectly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
