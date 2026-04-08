export default function TrendingSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 reveal-on-scroll">
          <div>
            <span className="text-[#ccff00] font-bold uppercase tracking-widest text-xs mb-2 block animate-pulse">
              Don&apos;t Sleep On These
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              Trending This Week
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white hover:text-black transition-all hover:-translate-y-1">
              Today
            </button>
            <button className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-shadow">
              This Week
            </button>
            <button className="px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white hover:text-black transition-all hover:-translate-y-1">
              Upcoming
            </button>
          </div>
        </div>

        {/* Event Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Neon Nights */}
          <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                alt="Nightlife"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 group-hover:bg-red-500/80 group-hover:border-red-500/50 transition-colors">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse group-hover:bg-white"></span>
                  Live
                </span>
              </div>
              <button className="absolute top-4 right-4 z-10 h-10 w-10 bg-black/30 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors hover:scale-110">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[#ccff00] font-bold text-xs mb-1 uppercase tracking-wider">Tomorrow • 9PM</div>
                  <h3 className="text-xl font-bold text-white leading-tight font-display group-hover:text-primary-glow transition-colors glitch-hover">
                    Neon Nights: Retro Wave Party
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center text-gray-400 text-sm gap-1 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Makati
                </div>
                <span className="text-white font-bold bg-white/10 px-3 py-1 rounded-lg text-sm group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                  ₱1,500
                </span>
              </div>
            </div>
          </article>

          {/* Card 2: Bean & Leaf */}
          <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                alt="Coffee"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-primary/80 transition-colors">
                  ☕ Markets
                </span>
              </div>
              <button className="absolute top-4 right-4 z-10 h-10 w-10 bg-black/30 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors hover:scale-110">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs mb-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    4.9 (120)
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight font-display group-hover:text-primary-glow transition-colors glitch-hover">
                    Bean & Leaf Pop-up Cafe
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center text-gray-400 text-sm gap-1 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  QC
                </div>
                <span className="text-white font-bold bg-white/10 px-3 py-1 rounded-lg text-sm group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                  $$
                </span>
              </div>
            </div>
          </article>

          {/* Card 3: Abstract Gallery */}
          <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect reveal-on-scroll" style={{ transitionDelay: "300ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                alt="Art"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8psAoxLif143bhZR9_uyQQN5yq6hgkNyUctxvMzcYUpzSguWiFojBLT_vQUS2u2Eao930f0cZgAa6vnHL9FRYCqX-j3tnACNNV1o-QuHU4Qnd3fIb8SgNuhe6XY5Ic1uL4Mb8yYeME95g3M81RaVM-iFnuaL3uIpkMuB8L4-N1m04CSsSsTJnwG4laZfj0ugPrRRH3-xdWbz1lnp6AYn4VgL4xJZw7L5HSKPQFSoWqgiZ3yBLIOgDbpAPg8bOhTrNV4jcidgjRpY"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-secondary/80 transition-colors">
                  🎨 Festivals
                </span>
              </div>
              <button className="absolute top-4 right-4 z-10 h-10 w-10 bg-black/30 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors hover:scale-110">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[#ccff00] font-bold text-xs mb-1 uppercase tracking-wider">Fri, Aug 30</div>
                  <h3 className="text-xl font-bold text-white leading-tight font-display group-hover:text-primary-glow transition-colors glitch-hover">
                    Abstract Gallery Opening
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center text-gray-400 text-sm gap-1 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  BGC
                </div>
                <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded hover:bg-[#ccff00] cursor-pointer transition-colors hover:shadow-[0_0_10px_#ccff00]">
                  RSVP
                </span>
              </div>
            </div>
          </article>

          {/* Card 4: Mountain Hike */}
          <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect reveal-on-scroll" style={{ transitionDelay: "400ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                alt="Camping"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XA52iqn3OYq_ek6lF7a5RrGBaIYiCLbhKptRxzzgr1w5g1rVfS3IAKovFFayv15ZLnHMWWtTtje9S1U71VWK-1PDExtYW9y_5Oc7EJYEc-Vp6RaZu68x7vepjoN0dNDpWVyuLMXRVxTjOkvIR2k6uhg2oNLwgTJW4xkjDC8zPazWFcViSboKtLViluxCMf4YcJ9dzEEJfo7uyHlmHBLpo9riL-1nhYHM0v-SRB-c1l6Ao0PMoBTYz1u7rbHmJiROH-b3NkvgseE"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-green-600/80 transition-colors">
                  ⛺ Tours
                </span>
              </div>
              <button className="absolute top-4 right-4 z-10 h-10 w-10 bg-black/30 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors hover:scale-110">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[#ccff00] font-bold text-xs mb-1 uppercase tracking-wider">Sat, Sep 02</div>
                  <h3 className="text-xl font-bold text-white leading-tight font-display group-hover:text-primary-glow transition-colors glitch-hover">
                    Mountain Peak Hike & Camp
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center text-gray-400 text-sm gap-1 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Rizal
                </div>
                <span className="text-white font-bold bg-white/10 px-3 py-1 rounded-lg text-sm group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                  ₱3,500
                </span>
              </div>
            </div>
          </article>
        </div>

        {/* Load More */}
        <div className="mt-16 flex justify-center reveal-on-scroll">
          <button className="group relative px-8 py-4 rounded-full bg-transparent text-white font-bold transition-all flex items-center gap-2 overflow-visible">
            {/* Large diffused glow on hover */}
            <span className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/30 blur-xl"></span>
            <span className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/40 blur-lg"></span>
            {/* Glowing border */}
            <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-[#ccff00] group-hover:shadow-[0_0_20px_rgba(204,255,0,0.6),0_0_40px_rgba(204,255,0,0.3)] transition-all duration-300"></span>
            {/* Dark background */}
            <span className="absolute inset-[2px] rounded-full bg-[#0a0b0f]"></span>
            {/* Button text */}
            <span className="relative z-10 group-hover:text-[#ccff00] transition-colors">Load More Vibes</span>
            <span className="relative z-10 material-symbols-outlined group-hover:text-[#ccff00] group-hover:translate-y-1 transition-all">
              expand_more
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
