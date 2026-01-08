"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

// --- Category Data ---
const CATEGORIES = [
  { id: 'festivals', title: 'Festivals & Fairs', icon: 'festival', color: 'from-orange-400 to-red-500', spots: '120+ events', children: ['Food & Drink Fests', 'Music & Art Festivals', 'Wellness & Lifestyle Expos', 'Seasonal Fairs', 'Cultural & Heritage Days'] },
  { id: 'classes', title: 'Classes & Workshops', icon: 'palette', color: 'from-blue-400 to-cyan-500', spots: '85 sessions', children: ['Hands-on Maker Sessions', 'Culinary & Mixology', 'Fitness & Movement', 'Nature & Survival', 'Photography & Content'] },
  { id: 'performances', title: 'Live Performances', icon: 'mic_external_on', color: 'from-purple-500 to-indigo-600', spots: 'Tonight & This Wknd', children: ['Concerts & Live Gigs', 'Comedy & Open Mics', 'Stage & Theater', 'Specialty Acts', 'Live Talks & Podcasts'] },
  { id: 'tours', title: 'Tours & Excursions', icon: 'map', color: 'from-green-400 to-emerald-600', spots: '45 adventures', children: ['Nature & Adventure', 'Food & Bar Crawls', 'Heritage & City Walks', 'Wellness Retreats', '"Tourist in Your Own Town"'] },
  { id: 'parties', title: 'Parties & Socials', icon: 'celebration', color: 'from-pink-400 to-rose-500', spots: 'Top Rated', children: ['Themed Nights', 'Club & Dance Events', 'Networking Mixers', 'Activity-Based Socials', 'Intimate Soirées'] },
  { id: 'markets', title: 'Markets & Pop-Ups', icon: 'storefront', color: 'from-yellow-400 to-amber-600', spots: 'Open Now', children: ['Artisan & Craft Markets', 'Farmers Markets', 'Vintage & Thrift Fairs', 'Brand Pop-Ups', 'Food Truck Rallies'] },
  { id: 'competitions', title: 'Competitions & Games', icon: 'trophy', color: 'from-red-500 to-rose-600', spots: 'Join the Challenge', children: ['Races & Fun Runs', 'Interactive Gaming', 'Trivia & Pub Quizzes', 'Community Sports', 'Performance Contests'] },
  { id: 'celebrations', title: 'Celebrations & Milestones', icon: 'cake', color: 'from-teal-400 to-cyan-600', spots: 'Milestones', children: ['Weddings & Engagements', 'Birthdays & Anniversaries', 'Baby & Bridal Showers', 'Graduations & Proms', 'Religious & Cultural Rites'] }
];

// --- Foxers Data ---
const FOXERS = [
  { id: 1, name: 'Jasmine L.', role: 'Event Stylist', rating: 4.9, reviews: 128, desc: 'I turn pine forests into fairy tales. Specializing in boho camping setups and intimate...', tags: ['#Boho', '#Camping', '#Music'], avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=200', 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=200', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=200'], online: true },
  { id: 2, name: 'Marco D.', role: 'Adventure Guide', rating: 5.0, reviews: 84, desc: 'Leading treks and organizing outdoor activities. Let\'s make your team building...', tags: ['#Trekking', '#TeamBuilding'], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200', images: ['https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=200', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=200', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=200'], online: true },
  { id: 3, name: 'Sarah K.', role: 'Live Music & DJ', rating: 4.8, reviews: 56, desc: 'Acoustic vibes for sunset or electric beats for the after-party. I bring the sound system.', tags: ['#LiveBand', '#DJ'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200', images: ['https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=200', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200', 'https://images.unsplash.com/photo-1459749411177-287ce35e8b75?q=80&w=200'], online: false }
];

const FoxerLandingPage: React.FC = () => {
  const { openModal } = useAuthStore();
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const displayedCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <a className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 transition-all" href="#">Explore</a>
              <Link href="/foxer/dashboard" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">Foxers</Link>
              <Link href="/passport" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">Community</Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button onClick={() => openModal('login')} className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black transition-all">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32">
        {/* Hero Section */}
        <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="mx-auto max-w-7xl px-4 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left reveal-on-scroll">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-accent/30 mx-auto lg:mx-0 backdrop-blur-sm animate-bounce">
                    <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00]"></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/90">Fresh Drops Daily</span>
                  </div>
                  <h1 className="text-6xl font-display font-bold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95]">
                    Find your <br />
                    <span className="text-gradient">Core Memory.</span>
                  </h1>
                  <p className="text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Curated experiences for the main character energy. Underground gigs, secret spots, and adventures that actually matter.
                  </p>
                </div>
                {/* Search Box */}
                <div className="w-full max-w-2xl mx-auto lg:mx-0 relative group z-20">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative glass-panel p-2 rounded-[2rem]">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/50">
                          <span className="material-symbols-outlined">search</span>
                        </div>
                        <input className="block w-full pl-12 pr-4 py-4 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 text-lg outline-none" placeholder="Search vibes, artists, locations..." type="text" />
                      </div>
                      <div className="h-px sm:h-auto sm:w-px bg-white/10 mx-2"></div>
                      <select className="block w-full sm:w-48 pl-4 pr-10 py-4 bg-transparent border-none text-white focus:ring-0 font-bold cursor-pointer appearance-none outline-none">
                        <option className="bg-background">Manila</option>
                        <option className="bg-background">Siargao</option>
                        <option className="bg-background">Cebu</option>
                      </select>
                      <button className="btn-neon h-14 px-8 rounded-3xl bg-white text-black font-bold">Go</button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Image Grid */}
              <div className="lg:col-span-5 relative mt-16 lg:mt-0">
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4 translate-y-12 animate-float">
                    <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                      <img alt="Hiking" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg">Adventure</span>
                    </div>
                    <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                      <img alt="Party" className="w-full h-72 object-cover" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg">Nightlife</span>
                    </div>
                  </div>
                  <div className="space-y-4 animate-float-delayed">
                    <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                      <img alt="Coffee" className="w-full h-72 object-cover" src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg">Hangouts</span>
                    </div>
                    <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
                      <img alt="Social" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg">Social</span>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="bg-accent text-black px-6 py-3 rounded-full font-display font-bold uppercase tracking-widest shadow-[0_0_30px_#ccff00] animate-pulse">Trending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vibe Check Categories */}
        <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 mb-8 relative z-20 reveal-on-scroll">
            <h2 className="text-3xl font-display font-bold text-white">Vibe Check</h2>
            <p className="text-text-muted mt-1">Browse by category</p>
          </div>
          <div className="mx-auto max-w-7xl px-4 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedCategories.map((cat, idx) => (
                <a key={idx} href="#" className="group relative flex flex-col justify-between p-5 bg-surface-highlight/50 rounded-3xl border border-white/5 h-[280px] overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative z-10">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                      <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 font-display">{cat.title}</h3>
                    <p className="text-sm text-text-muted">{cat.spots}</p>
                  </div>
                  <div className="absolute inset-0 bg-surface-highlight/95 backdrop-blur-xl p-5 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Explore</h4>
                    <ul className="space-y-2">
                      {cat.children.map(child => (
                        <li key={child} className="flex items-center gap-2 text-sm text-white/80 hover:text-accent transition-colors cursor-pointer">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>{child}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${cat.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                </a>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <button onClick={() => setShowAllCategories(!showAllCategories)} className="px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white hover:text-black transition-all">
                {showAllCategories ? 'Show Less' : 'View All Categories'}
              </button>
            </div>
          </div>
        </section>

        {/* Foxers Section */}
        <section className="py-20 relative overflow-hidden bg-black/40">
          <div className="mx-auto max-w-7xl px-4 relative z-10 reveal-on-scroll">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Who's vibe matches yours?</h2>
            <p className="text-lg text-text-muted max-w-2xl mb-12">Browse Certified Foxers available for your dates.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FOXERS.map((foxxer) => (
                <div key={foxxer.id} className="group glass-card rounded-[2rem] p-8 hover:border-primary/50 transition-all duration-300 card-hover-effect">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4">
                      <div className="relative">
                        <img src={foxxer.avatar} alt={foxxer.name} className="h-16 w-16 rounded-full object-cover border-2 border-surface-highlight" />
                        {foxxer.online && <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-surface-highlight"></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-display font-bold text-xl text-white">{foxxer.name} <span className="material-symbols-outlined text-primary text-[18px]">verified</span></div>
                        <div className="text-text-muted text-sm">{foxxer.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-white">{foxxer.rating} <span className="material-symbols-outlined text-yellow-400 text-[16px]">star</span></div>
                      <div className="text-xs text-text-muted">{foxxer.reviews} reviews</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-6 line-clamp-2">{foxxer.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {foxxer.tags.map((tag, idx) => (<span key={idx} className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-gray-400 border border-white/5">{tag}</span>))}
                  </div>
                  <div className="flex justify-between gap-3 mb-8">
                    {foxxer.images.map((img, idx) => (<div key={idx} className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10"><img src={img} alt="Work" className="h-full w-full object-cover" /></div>))}
                  </div>
                  <button className="w-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] py-3.5 text-sm font-bold text-white">Match Me</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-white/5 bg-surface/50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-surface-highlight/30 rounded-[2.5rem] p-10 hover:bg-surface-highlight/50 transition-all group border border-white/5 hover:border-primary/50 reveal-on-scroll">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 text-primary-glow flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[36px]">verified_user</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Verified Vibes Only</h3>
                <p className="text-text-muted group-hover:text-white transition-colors">No catfishing here. We verify every foxer and venue.</p>
              </div>
              <div className="bg-surface-highlight/30 rounded-[2.5rem] p-10 hover:bg-surface-highlight/50 transition-all group border border-white/5 hover:border-accent/50 reveal-on-scroll">
                <div className="h-16 w-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-black transition-all">
                  <span className="material-symbols-outlined text-[36px]">bolt</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Instant Booking</h3>
                <p className="text-text-muted group-hover:text-white transition-colors">Skip the DMs. Book your spot instantly.</p>
              </div>
              <div className="bg-surface-highlight/30 rounded-[2.5rem] p-10 hover:bg-surface-highlight/50 transition-all group border border-white/5 hover:border-secondary/50 reveal-on-scroll">
                <div className="h-16 w-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[36px]">diversity_3</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Find Your Crew</h3>
                <p className="text-text-muted group-hover:text-white transition-colors">See who's going and make memories together.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 relative z-10 reveal-on-scroll">
            <div className="bg-gradient-to-br from-primary via-purple-900 to-black rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl border border-white/10">
              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="inline-block py-1.5 px-4 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest mb-8 animate-bounce">Weekly Digest</span>
                <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-tight">FOMO is real.<br />Don't let it win.</h2>
                <p className="text-xl text-gray-200 mb-12">Get the freshest drops on underground parties, secret pop-ups, and limited adventures.</p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input className="flex-1 rounded-full bg-black/40 border border-white/20 text-white placeholder-gray-400 px-8 py-5 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="your@email.com" type="email" />
                  <button className="bg-accent text-black font-bold text-lg px-10 py-5 rounded-full hover:bg-white transition-all" type="submit">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                  <span className="material-symbols-outlined text-[24px]">explore</span>
                </div>
                <span className="text-2xl font-display font-bold text-white">FoxPassport</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-sm text-lg">The ultimate platform for the next generation of explorers.</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-bold text-white mb-6 font-display">Discover</h3>
              <ul className="space-y-4">
                <li><a className="text-sm text-gray-400 hover:text-accent transition-colors" href="#">Events</a></li>
                <li><a className="text-sm text-gray-400 hover:text-accent transition-colors" href="#">Adventures</a></li>
                <li><a className="text-sm text-gray-400 hover:text-accent transition-colors" href="#">Venues</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-bold text-white mb-6 font-display">Company</h3>
              <ul className="space-y-4">
                <li><a className="text-sm text-gray-400 hover:text-accent transition-colors" href="#">About</a></li>
                <li><a className="text-sm text-gray-400 hover:text-accent transition-colors" href="#">Careers</a></li>
                <li><a className="text-sm text-gray-400 hover:text-accent transition-colors" href="#">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">© 2024 FoxPassport Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-xs text-gray-500 hover:text-white transition-colors" href="#">Privacy</a>
              <a className="text-xs text-gray-500 hover:text-white transition-colors" href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FoxerLandingPage;
