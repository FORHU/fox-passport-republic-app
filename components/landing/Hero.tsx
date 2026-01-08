
"use client";

import React, { useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  useScrollReveal();

  return (
    <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Gradient Blobs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left reveal-on-scroll">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mx-auto lg:mx-0 backdrop-blur-sm animate-bounce duration-1000">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00]"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display">
                  Fresh Drops Daily
                </span>
              </div>

              {/* Main Heading */}
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
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-25 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-pulse"></div>
              <div className="relative glass-panel p-2 rounded-[2rem] group-hover:border-white/20 transition-colors">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Input
                      icon="search"
                      placeholder="Search vibes, artists, locations..."
                      className="text-lg"
                    />
                  </div>
                  <div className="h-px sm:h-auto sm:w-px bg-white/10 mx-2"></div>
                  <div className="relative w-full sm:w-48">
                    <select className="block w-full pl-4 pr-10 py-4 bg-transparent border-none text-white focus:ring-0 font-bold cursor-pointer appearance-none hover:text-accent transition-colors outline-none">
                      <option className="bg-background">Manila</option>
                      <option className="bg-background">Siargao</option>
                      <option className="bg-background">Cebu</option>
                      <option className="bg-background">La Union</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-accent">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                  <Button variant="neon" size="xl" className="shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Go
                  </Button>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-xs font-bold hover:bg-accent hover:text-black transition-colors cursor-pointer">
                  +2k
                </div>
              </div>
              <div className="text-sm font-medium text-text-muted group cursor-default">
                <div className="flex text-accent text-lg mb-1 group-hover:gap-1 transition-all">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[20px] fill-current animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
                      star
                    </span>
                  ))}
                </div>
                Verified by Citizens
              </div>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="lg:col-span-5 relative mt-16 lg:mt-0 perspective-1000">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4 translate-y-12 animate-float">
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
                  <img
                    alt="Hiking"
                    className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmgc1ziaofMi_-lTKcjpZEv7VTfF2giPd9g4dk7Tp2nV4zGq8Q5IRga5YTfRI_Jn_Ify-Tosw9kUkDF66j16bJhuxcA142KSgPbVJ-Up9pS9F7PNz63ifWmP4U5JaVM9HYqNd8sktuxLqRWOY1Pj2jFRyYN95x7r5JTsz3oLrbAf-TOEO8mNeF45A-pH7tTbULW3TTpFuhwLwvTaBtcULpdKffMLjcLe9RgSE8PXf3NRi_xZqMstDkVF5U8JcLaCYz1TqBPvadL4I"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Adventure
                  </span>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <span className="material-symbols-outlined text-white text-[16px]">arrow_outward</span>
                  </div>
                </div>
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img
                    alt="Party"
                    className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Nightlife
                  </span>
                </div>
              </div>
              <div className="space-y-4 animate-float-delayed">
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img
                    alt="Coffee"
                    className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Hangouts
                  </span>
                </div>
                <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
                  <img
                    alt="Social"
                    className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XA52iqn3OYq_ek6lF7a5RrGBaIYiCLbhKptRxzzgr1w5g1rVfS3IAKovFFayv15ZLnHMWWtTtje9S1U71VWK-1PDExtYW9y_5Oc7EJYEc-Vp6RaZu68x7vepjoN0dNDpWVyuLMXRVxTjOkvIR2k6uhg2oNLwgTJW4xkjDC8zPazWFcViSboKtLViluxCMf4YcJ9dzEEJfo7uyHlmHBLpo9riL-1nhYHM0v-SRB-c1l6Ao0PMoBTYz1u7rbHmJiROH-b3NkvgseE"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
                    Social
                  </span>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="bg-accent text-black px-6 py-3 rounded-full font-display font-bold uppercase tracking-widest shadow-[0_0_30px_#ccff00] transform animate-pulse border border-white/20 pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  Trending
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
