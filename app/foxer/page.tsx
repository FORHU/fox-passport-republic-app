"use client";

import React from 'react';

export default function DashboardPage() {
  return (
    <div className="w-full pb-10 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full">
        <div className="relative h-[500px] w-full flex items-center justify-center text-center overflow-hidden bg-background-dark">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent dark:from-background-dark"></div>
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center gap-8 mt-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              Discover the best events <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400">foxing</span> near you
            </h1>
            <p className="text-xl text-pink-100/90 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              Join thousands of foxers exploring the city. Find your next adventure today.
            </p>
            <div className="flex gap-5 mt-4">
              {/* FIXED: Explicit Pink Color */}
              <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-pink-500/30 transition-all hover:scale-105 active:scale-95">
                Explore Events
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/50 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 active:scale-95">
                How it works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FIXED: Removed -mt-16 to stop overlapping. Added py-10 for spacing. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
        
        {/* 2. POPULAR FOXXERS */}
        <section className="bg-white dark:bg-card-dark rounded-3xl border border-pink-100 dark:border-pink-900/30 p-8 mb-12 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Popular Foxxers</h2>
              <p className="text-sm text-gray-500 mt-1">Connect with top event hosts and community leaders</p>
            </div>
            <a href="#" className="text-sm font-bold text-pink-500 hover:text-pink-600 flex items-center gap-2 transition-colors group">
              View All <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Tech Organizer", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200", events: 15, followers: "2.4k" },
              { name: "Mike Thompson", role: "Music & Nightlife", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200", events: 42, followers: "8.1k" },
              { name: "Elena Rodriguez", role: "Art & Culture", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200", events: 8, followers: "1.2k" },
              { name: "Davide Russo", role: "Food & Drink", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200", events: 22, followers: "5.6k" },
            ].map((foxxer, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-pink-50/40 dark:bg-white/5 hover:bg-white dark:hover:bg-card-dark hover:shadow-xl hover:shadow-pink-100/50 transition-all border border-transparent hover:border-pink-100 dark:hover:border-pink-900/30 group">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-cover bg-center border-[3px] border-white shadow-md group-hover:border-pink-500 transition-colors" style={{ backgroundImage: `url("${foxxer.img}")` }}></div>
                  <div className="absolute bottom-0 right-0 bg-pink-500 text-white text-[10px] p-1 rounded-full border-2 border-white">★</div>
                </div>
                <h3 className="font-bold text-base text-gray-800 dark:text-white mb-1">{foxxer.name}</h3>
                <p className="text-xs font-medium text-pink-500 mb-4 bg-pink-500/10 px-3 py-1 rounded-full">{foxxer.role}</p>
                <div className="flex gap-6 w-full justify-center text-xs mb-5 py-3 border-y border-pink-100/50 dark:border-white/10">
                  <div className="flex flex-col gap-1"><span className="font-black text-lg text-gray-800 dark:text-white">{foxxer.events}</span><span className="text-[10px] text-gray-500 uppercase tracking-wider">Events</span></div>
                  <div className="flex flex-col gap-1"><span className="font-black text-lg text-gray-800 dark:text-white">{foxxer.followers}</span><span className="text-[10px] text-gray-500 uppercase tracking-wider">Fans</span></div>
                </div>
                <button className="w-full bg-white dark:bg-transparent border-2 border-pink-200 dark:border-pink-700 text-gray-600 dark:text-white font-bold text-sm py-2.5 rounded-xl hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all shadow-sm">Follow</button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. MAIN CONTENT: SIDEBAR + EVENTS GRID */}
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* --- LEFT SIDEBAR FILTERS --- */}
          <aside className="hidden md:block w-72 flex-shrink-0 space-y-10 sticky top-24 self-start">
            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-gray-800 dark:text-white">Categories</h3>
              <div className="space-y-3">
                {['Music & Concerts', 'Business & Tech', 'Food & Drink', 'Sports & Fitness', 'Arts & Theatre'].map((cat, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group pl-1">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="h-5 w-5 border-2 border-pink-300 rounded-md bg-white peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all"></div>
                      <svg className="absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-pink-500 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-gray-800 dark:text-white">Date</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group pl-1">
                  <div className="relative flex items-center">
                    <input type="radio" name="date" defaultChecked className="peer sr-only" />
                    <div className="h-5 w-5 border-2 border-pink-300 rounded-full bg-white peer-checked:border-pink-500 relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-pink-500 after:rounded-full after:h-2 after:w-2 after:opacity-0 peer-checked:after:opacity-100 transition-all"></div>
                  </div>
                  <span className="text-sm font-bold text-pink-500">Any time</span>
                </label>
                {['Today', 'Tomorrow', 'This Weekend'].map((date, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group pl-1">
                    <div className="relative flex items-center">
                      <input type="radio" name="date" className="peer sr-only" />
                      <div className="h-5 w-5 border-2 border-pink-300 rounded-full bg-white peer-checked:border-pink-500 relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-pink-500 after:rounded-full after:h-2 after:w-2 after:opacity-0 peer-checked:after:opacity-100 transition-all"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-pink-500 transition-colors">{date}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Become a Host Card */}
            <div className="p-6 bg-gradient-to-br from-pink-500/5 to-pink-100/50 dark:from-pink-500/20 dark:to-background-dark rounded-3xl border border-pink-500/20 shadow-lg shadow-pink-50/50">
              <h4 className="font-black text-xl text-gray-800 dark:text-white mb-3">Become a Host</h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Create your own events and build a vibrant community around your passion.
              </p>
              {/* FIXED: Explicit Pink Color */}
              <button className="w-full bg-pink-500 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-pink-600 transition-all shadow-md shadow-pink-500/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                Start Creating
              </button>
            </div>
          </aside>

          {/* --- RIGHT SIDE: EVENT GRID --- */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Upcoming Events</h2>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3 bg-white dark:bg-card-dark px-4 py-2 rounded-full border border-pink-100 dark:border-pink-900/30 shadow-sm">
                <span className="text-sm font-medium text-gray-500">Sort by:</span>
                <select className="text-sm font-bold bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white cursor-pointer p-0 pr-6 outline-none">
                  <option>Trending</option>
                  <option>Date: Soonest</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Neon Night Run 5K", loc: "Downtown Central Park", price: "$25", tag: "Running", color: "bg-pink-500", img: "https://images.unsplash.com/photo-1552674605-46d536d2e609?q=80&w=600", date: "12", month: "NOV" },
                { title: "Tech Founders Mixer & Panel", loc: "The Hive Co-working Space", price: "Free", tag: "Networking", color: "bg-indigo-500", img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600", date: "14", month: "NOV" },
                { title: "Rooftop Jazz & Cocktails", loc: "SkyBar at The Pinnacle", price: "$15", tag: "Nightlife", color: "bg-rose-500", img: "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=600", date: "15", month: "NOV" },
                { title: "Clay & Sip: Pottery Workshop", loc: "Artisan Studio, East End", price: "$45", tag: "Workshop", color: "bg-orange-500", img: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?q=80&w=600", date: "18", month: "NOV" },
                { title: "Cinema in the Park: Classic Sci-Fi", loc: "Riverside Park Amphitheater", price: "Free", tag: "Community", color: "bg-purple-500", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600", date: "20", month: "NOV" },
                { title: "Sunrise Yoga & Meditation", loc: "Harbor Point Deck", price: "$12", tag: "Wellness", color: "bg-teal-500", img: "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=600", date: "22", month: "NOV" },
              ].map((event, i) => (
                <div key={i} className="group bg-white dark:bg-card-dark rounded-3xl overflow-hidden border border-pink-100 dark:border-pink-900/30 hover:shadow-2xl hover:shadow-pink-200/40 dark:hover:shadow-none hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-2 rounded-2xl z-10 flex flex-col items-center shadow-sm min-w-[50px]">
                      <span className="text-[11px] font-black text-pink-500 uppercase tracking-widest">{event.month}</span>
                      <span className="text-2xl font-black leading-none text-gray-800 dark:text-white">{event.date}</span>
                    </div>
                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url("${event.img}")` }}></div>
                    <div className={`absolute top-4 left-4 ${event.color} text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider`}>
                      {event.tag}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 relative">
                    <h3 className="font-bold text-xl leading-snug mb-3 text-gray-800 dark:text-white group-hover:text-pink-500 transition-colors line-clamp-1">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6">
                      <span className="text-pink-500 flex-shrink-0 bg-pink-500/10 p-1 rounded-full">📍</span> 
                      <span className="truncate">{event.loc}</span>
                    </div>
                    <div className="mt-auto pt-5 border-t border-pink-50 dark:border-pink-900/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-pink-100 bg-cover bg-center" style={{ backgroundImage: `url("https://i.pravatar.cc/150?u=${i}")` }} />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">By Host</span>
                      </div>
                      <span className="font-black text-lg text-pink-500">{event.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-16">
              <button className="flex items-center gap-3 px-8 py-4 rounded-full border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-card-dark text-gray-800 dark:text-white font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-500 transition-all text-sm group shadow-sm">
                Load More Events
                <span className="text-xs group-hover:translate-y-1 transition-transform">▼</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}