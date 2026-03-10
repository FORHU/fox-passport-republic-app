"use client";

export default function HeroSection() {
  return (
    <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left reveal-on-scroll">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#ccff00]/50 shadow-[0_0_25px_rgba(204,255,0,0.3),0_0_50px_rgba(204,255,0,0.1)] mx-auto lg:mx-0 backdrop-blur-sm animate-bounce duration-1000">
                <span className="flex h-3 w-3 rounded-full bg-[#ccff00] shadow-[0_0_15px_#ccff00,0_0_30px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display">
                  Fresh Drops Daily
                </span>
              </div>

              {/* Title */}
              <h1 className="text-6xl font-display font-bold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95] group cursor-default">
                Find your <br />
                <span
                  className="text-gradient relative inline-block hover:scale-105 transition-transform duration-500 cursor-cell"
                  style={{ textShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                >
                  Core Memory.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Curated experiences for the main character energy. Underground gigs, secret spots, and adventures that actually matter.
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full max-w-2xl mx-auto lg:mx-0 relative group z-20">
              {/* Pulsing violet glow border */}
              <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-purple-700 via-violet-500 to-purple-700 opacity-80 animate-pulse blur-[2px]"></div>
              <div className="absolute -inset-[1px] rounded-[2rem] border border-purple-500/60 shadow-[0_0_15px_rgba(139,92,246,0.5)] animate-pulse"></div>
              
              {/* Search bar content */}
              <div className="relative bg-[#0c0d14] p-2 rounded-[2rem]">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative grow">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/50">
                      <span className="material-symbols-outlined group-focus-within:text-purple-400 transition-colors">
                        search
                      </span>
                    </div>
                    <input
                      className="block w-full pl-12 pr-4 py-4 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 text-lg font-medium focus:placeholder-white/20 transition-all outline-none"
                      placeholder="Search vibes, artists, locations..."
                      type="text"
                    />
                  </div>
                  <div className="h-px sm:h-auto sm:w-px bg-white/10 mx-2"></div>
                  <div className="relative w-full sm:w-48">
                    <select className="block w-full pl-4 pr-10 py-4 bg-transparent border-none text-white focus:ring-0 font-bold cursor-pointer appearance-none hover:text-[#ccff00] transition-colors outline-none">
                      <option className="bg-background">Manila</option>
                      <option className="bg-background">Siargao</option>
                      <option className="bg-background">Cebu</option>
                      <option className="bg-background">La Union</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#ccff00]">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                  <button className="h-14 sm:h-auto px-8 rounded-3xl bg-white text-black font-bold transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-[#ccff00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                    Go
                  </button>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex -space-x-4 hover:space-x-0 transition-all duration-500">
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM"
                />
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU"
                />
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-xs font-bold hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer">
                  +2k
                </div>
              </div>
              <div className="text-sm font-medium text-text-muted group cursor-default">
                <div className="flex text-[#ccff00] text-lg mb-1 group-hover:gap-1 transition-all">
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-75">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-100">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-150">star</span>
                  <span className="material-symbols-outlined text-[20px] fill-current animate-pulse delay-200">star</span>
                </div>
                Verified by Citizens
              </div>
            </div>
          </div>

          {/* Right Image Grid */}
          <div className="lg:col-span-5 relative mt-16 lg:mt-0 perspective-1000">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4 translate-y-12 animate-float">
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
                  <img
                    alt="Weddings & Commitments"
                    className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Weddings
                  </span>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <span className="material-symbols-outlined text-white text-[16px]">arrow_outward</span>
                  </div>
                </div>
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img
                    alt="Private Experiences"
                    className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Private Dining
                  </span>
                </div>
              </div>
              <div className="space-y-4 animate-float-delayed">
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img
                    alt="Celebrations"
                    className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Celebrations
                  </span>
                </div>
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
                  <img
                    alt="Signature Places"
                    className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Signature Places
                  </span>
                </div>
              </div>
              {/* Trending Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="bg-[#ccff00] text-black px-6 py-3 rounded-full font-display font-bold uppercase tracking-widest shadow-[0_0_30px_#ccff00] transform animate-pulse border border-white/20 pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  Trending
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
