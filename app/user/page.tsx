"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import UserMenuButton from '@/components/users/UserMenuButton';
import RequireAuth from '@/components/authentication/RequireAuth';

function UserDashboardContent() {
  const {
    userName,
    userInitial,
    isAuthenticated,
    dashboardData,
    walletBalance,
    recentTransactions,
    savedVibes,
    navigateToPassport
  } = useUserDashboard();

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer relative">
              <div className="flex h-12 w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <Image 
                  src="/foxonlylogo.png" 
                  alt="FoxPassport Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <div className="relative">
                <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">FoxPassport</h2>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link href="/user" className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] hover:bg-[#b8e600] hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5">Dashboard</Link>
              <Link href="/passport" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">Passport</Link>
              <Link href="/" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">Explore</Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12 relative group">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#db2777] border border-black group-hover:animate-ping"></span>
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#db2777] border border-black"></span>
              </button>
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-3 pl-2">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-[#ccff00] font-bold uppercase tracking-wide">Hey, {userName}</p>
                    <p className="text-sm font-bold text-white">Lvl {dashboardData.citizenLevel} Citizen</p>
                  </div>
                  <UserMenuButton />
                </div>
              ) : (
                <Link href="/" className="hidden sm:flex items-center gap-2 rounded-full bg-[#ccff00] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#b8e600] transition-all">
                  Sign In
                </Link>
              )}
              <button className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-36 px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 reveal-on-scroll">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                Ready for the <span className="text-gradient-lime relative inline-block">weekend?</span>
              </h1>
              <p className="text-text-muted mt-2 text-lg">You have <span className="text-white font-bold">{dashboardData.upcomingEvents} upcoming events</span> and <span className="text-white font-bold">{dashboardData.recommendations} recommendations</span>.</p>
            </div>
            <div className="hidden md:flex gap-4 mt-6 md:mt-0">
              <div className="bg-surface-highlight/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4 min-w-[200px]">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <span className="material-symbols-outlined">sunny</span>
                </div>
                <div>
                  <div className="text-xs text-text-muted uppercase font-bold">Weather</div>
                  <div className="text-white font-bold">{dashboardData.weather.temp} {dashboardData.weather.condition}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-12">
              <section className="reveal-on-scroll">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent animate-pulse">airplane_ticket</span>
                    Next Up
                  </h3>
                  <a className="text-sm text-gray-400 hover:text-white transition-colors" href="#">View all tickets</a>
                </div>
                <div className="glass-ticket rounded-3xl p-0 flex flex-col md:flex-row overflow-hidden group hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] transition-all duration-500">
                  <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <Image 
                      alt="Event" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"
                      width={400}
                      height={300}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-accent text-black text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">TOMORROW</span>
                      <h2 className="text-2xl font-bold text-white font-display leading-tight">Neon Nights: Retro Wave Party</h2>
                    </div>
                  </div>
                  <div className="relative w-full md:w-3/5 p-8 flex flex-col justify-between border-l border-white/10 border-dashed">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Location</p>
                        <p className="text-white font-bold text-lg flex items-center gap-1">
                          <span className="material-symbols-outlined text-accent text-sm">location_on</span>
                          Club XYZ, Makati
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Time</p>
                        <p className="text-white font-bold text-lg">9:00 PM</p>
                      </div>
                    </div>
                    <div className="my-6 border-t border-white/10 border-dashed"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                        <Image 
                          className="w-10 h-10 rounded-full border-2 border-surface object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU"
                          alt="Friend 1"
                          width={40}
                          height={40}
                        />
                        <Image 
                          className="w-10 h-10 rounded-full border-2 border-surface object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA"
                          alt="Friend 2"
                          width={40}
                          height={40}
                        />
                        <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-highlight flex items-center justify-center text-xs font-bold text-white">+3</div>
                      </div>
                      <button className="bg-white/10 hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group/btn">
                        <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        Show Pass
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section className="reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-display font-bold text-white">For You</h3>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
                    <button className="px-4 py-1.5 rounded-full bg-accent text-black text-sm font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)] whitespace-nowrap">All Vibes</button>
                    <button className="px-4 py-1.5 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/10 whitespace-nowrap transition-colors">Music</button>
                    <button className="px-4 py-1.5 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/10 whitespace-nowrap transition-colors">Art</button>
                    <button className="px-4 py-1.5 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/10 whitespace-nowrap transition-colors">Food</button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Cards */}
                  <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image 
                        alt="Coffee" 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg"
                        width={400}
                        height={300}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-4 right-4 z-10">
                        <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-secondary hover:bg-white transition-all">
                          <span className="material-symbols-outlined text-[20px]">bookmark</span>
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">New Spot</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-accent transition-colors">Bean & Leaf Pop-up Cafe</h3>
                      <p className="text-text-muted text-sm line-clamp-2 mb-4">An exclusive pop-up featuring rare beans from Mt. Apo. Limited seating available.</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">$$</span>
                        <div className="flex items-center gap-1 text-xs text-accent">
                          <span className="material-symbols-outlined text-[14px] fill-current">star</span> 4.9
                        </div>
                      </div>
                    </div>
                  </article>
                  <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image 
                        alt="Art" 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8psAoxLif143bhZR9_uyQQN5yq6hgkNyUctxvMzcYUpzSguWiFojBLT_vQUS2u2Eao930f0cZgAa6vnHL9FRYCqX-j3tnACNNV1o-QuHU4Qnd3fIb8SgNuhe6XY5Ic1uL4Mb8yYeME95g3M81RaVM-iFnuaL3uIpkMuB8L4-N1m04CSsSsTJnwG4laZfj0ugPrRRH3-xdWbz1lnp6AYn4VgL4xJZw7L5HSKPQFSoWqgiZ3yBLIOgDbpAPg8bOhTrNV4jcidgjRpY"
                        width={400}
                        height={300}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-4 right-4 z-10">
                        <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-secondary hover:bg-white transition-all">
                          <span className="material-symbols-outlined text-[20px]">bookmark</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-accent transition-colors">Abstract Gallery Opening</h3>
                      <p className="text-text-muted text-sm line-clamp-2 mb-4">Featuring local street artists. Free drinks for the first 50 guests.</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-black bg-accent px-2 py-1 rounded">FREE</span>
                        <span className="text-xs text-gray-400">Fri, Aug 30</span>
                      </div>
                    </div>
                  </article>
                  <article className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image 
                        alt="Camping" 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XA52iqn3OYq_ek6lF7a5RrGBaIYiCLbhKptRxzzgr1w5g1rVfS3IAKovFFayv15ZLnHMWWtTtje9S1U71VWK-1PDExtYW9y_5Oc7EJYEc-Vp6RaZu68x7vepjoN0dNDpWVyuLMXRVxTjOkvIR2k6uhg2oNLwgTJW4xkjDC8zPazWFcViSboKtLViluxCMf4YcJ9dzEEJfo7uyHlmHBLpo9riL-1nhYHM0v-SRB-c1l6Ao0PMoBTYz1u7rbHmJiROH-b3NkvgseE"
                        width={400}
                        height={300}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-4 right-4 z-10">
                        <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-secondary hover:bg-white transition-all">
                          <span className="material-symbols-outlined text-[20px]">bookmark</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-accent transition-colors">Stargazing Camp</h3>
                      <p className="text-text-muted text-sm line-clamp-2 mb-4">Escape the city lights. Tent rentals included in the package.</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">₱2,500</span>
                        <span className="text-xs text-gray-400">Sat, Sep 02</span>
                      </div>
                    </div>
                  </article>
                  <article className="group relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 bg-black/20 hover:bg-black/40 hover:border-accent cursor-pointer transition-all duration-300 min-h-[300px]">
                    <div className="h-16 w-16 rounded-full bg-surface-highlight flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] group-hover:bg-surface">
                      <span className="material-symbols-outlined text-white group-hover:text-accent text-3xl font-bold">add</span>
                    </div>
                    <p className="font-bold text-white text-lg group-hover:text-accent transition-colors">Load More</p>
                    <p className="text-sm text-text-muted mt-1">Discover more gems</p>
                  </article>
                </div>
              </section>
              <section className="reveal-on-scroll pt-8" style={{ transitionDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-purple-400">history_edu</span>
                  <h3 className="text-xl font-display font-bold text-white">Core Memories</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  <div className="shrink-0 w-64 h-40 rounded-2xl relative overflow-hidden group cursor-pointer">
                    <Image 
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"
                      alt="Last Friday"
                      width={256}
                      height={160}
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white font-bold border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">Last Friday</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-64 h-40 rounded-2xl relative overflow-hidden group cursor-pointer">
                    <Image 
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmgc1ziaofMi_-lTKcjpZEv7VTfF2giPd9g4dk7Tp2nV4zGq8Q5IRga5YTfRI_Jn_Ify-Tosw9kUkDF66j16bJhuxcA142KSgPbVJ-Up9pS9F7PNz63ifWmP4U5JaVM9HYqNd8sktuxLqRWOY1Pj2jFRyYN95x7r5JTsz3oLrbAf-TOEO8mNeF45A-pH7tTbULW3TTpFuhwLwvTaBtcULpdKffMLjcLe9RgSE8PXf3NRi_xZqMstDkVF5U8JcLaCYz1TqBPvadL4I"
                      alt="Hiking Trip"
                      width={256}
                      height={160}
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white font-bold border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">Hiking Trip</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-64 h-40 rounded-2xl relative overflow-hidden group cursor-pointer">
                    <Image 
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XA52iqn3OYq_ek6lF7a5RrGBaIYiCLbhKptRxzzgr1w5g1rVfS3IAKovFFayv15ZLnHMWWtTtje9S1U71VWK-1PDExtYW9y_5Oc7EJYEc-Vp6RaZu68x7vepjoN0dNDpWVyuLMXRVxTjOkvIR2k6uhg2oNLwgTJW4xkjDC8zPazWFcViSboKtLViluxCMf4YcJ9dzEEJfo7uyHlmHBLpo9riL-1nhYHM0v-SRB-c1l6Ao0PMoBTYz1u7rbHmJiROH-b3NkvgseE"
                      alt="Coffee Run"
                      width={256}
                      height={160}
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white font-bold border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">Coffee Run</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="lg:col-span-4 space-y-6">
              
              {/* My Journey Widget */}
              <div 
                className="relative overflow-hidden rounded-[2.5rem] bg-[#0f392b] border border-[#10b981]/20 p-8 shadow-glow hover:scale-[1.02] transition-transform duration-300 reveal-on-scroll cursor-pointer group" 
                onClick={navigateToPassport}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-24 bg-[#10b981] opacity-20 blur-[80px] rounded-full group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[#10b981] text-xs font-bold uppercase tracking-widest mb-1">My Journey</p>
                            <h3 className="text-2xl font-display font-bold text-white tracking-tight">{userName}</h3>
                        </div>
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#10b981] group-hover:text-[#022c22] transition-colors">
                            <span className="material-symbols-outlined text-white group-hover:text-[#022c22]">verified</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-white/70 font-medium">Next Rank</span>
                                <span className="text-[#bef264] font-display font-bold text-sm">Trailblazer</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#10b981] to-[#bef264] w-[75%] rounded-full shadow-[0_0_10px_#10b981]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-white/40 font-medium mt-1">
                                <span>15 stamps</span>
                                <span>5 to go</span>
                            </div>
                        </div>
                        
                        <div className="pt-2 flex items-center gap-2 text-xs text-[#10b981] font-bold group-hover:text-white transition-colors">
                            <span>View Passport</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Foxx Wallet */}
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10 p-8 shadow-glow hover:scale-[1.02] transition-transform duration-300 reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
                <div className="absolute top-0 right-0 p-32 bg-accent opacity-10 blur-[80px] rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium mb-1">Foxx Wallet</p>
                      <h3 className="text-4xl font-display font-bold text-white tracking-tight">₱{walletBalance.toLocaleString()}<span className="text-lg text-indigo-300"></span></h3>
                    </div>
                    <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button className="bg-accent text-black py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                      <span className="material-symbols-outlined text-[18px]">add</span> Top Up
                    </button>
                    <button className="bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">send</span> Send
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Recent Activity</p>
                    {recentTransactions.map((tx, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full ${tx.type === 'purchase' ? 'bg-secondary/20' : 'bg-accent/20'} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined ${tx.type === 'purchase' ? 'text-secondary' : 'text-accent'} text-xs`}>
                              {tx.type === 'purchase' ? 'local_activity' : 'add'}
                            </span>
                          </div>
                          <div className="text-sm text-white">{tx.label}</div>
                        </div>
                        <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-accent' : 'text-white'}`}>
                          {tx.amount > 0 ? '+' : ''} ₱{Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
                <a className="bg-surface-highlight/50 hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all group" href="#">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined">chat_bubble</span>
                  </div>
                  <span className="text-white font-bold text-sm">Messages</span>
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full absolute top-4 right-4 animate-pulse">2</span>
                </a>
                <a className="bg-surface-highlight/50 hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all group" href="#">
                  <div className="h-12 w-12 rounded-full bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined">settings</span>
                  </div>
                  <span className="text-white font-bold text-sm">Settings</span>
                </a>
              </div>
              <div className="glass-panel rounded-[2.5rem] p-6 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white">Saved Vibes</h3>
                  <span className="text-xs text-text-muted">{savedVibes.length} Items</span>
                </div>
                <div className="space-y-4">
                  {savedVibes.map((item) => (
                    <div key={item.id} className="flex gap-4 p-2 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                      <Image 
                        className="h-16 w-16 rounded-xl object-cover group-hover:scale-105 transition-transform" 
                        src={item.image}
                        alt={item.title}
                        width={64}
                        height={64}
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm mb-1 group-hover:text-accent transition-colors">{item.title}</h4>
                        <p className="text-xs text-text-muted mb-2">{item.location}</p>
                        {item.status === 'open' && (
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            <span className="text-[10px] text-green-500 font-bold">Open Now</span>
                          </div>
                        )}
                        {item.status === 'upcoming' && (
                          <span className="text-[10px] text-gray-400">Next Weekend</span>
                        )}
                        {item.status === 'sold_out' && (
                          <span className="text-[10px] text-red-400">Sold Out</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
                  View All Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">explore</span>
              <span className="text-xl font-display font-bold text-white">FoxPassport</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">© 2024 FoxPassport Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Privacy</a>
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Terms</a>
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <RequireAuth>
      <UserDashboardContent />
    </RequireAuth>
  );
}
