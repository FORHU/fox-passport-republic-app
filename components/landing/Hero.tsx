"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const SEARCH_TABS = ["All", "Events", "Adventures", "Music", "Food", "Camping", "Venues"];

const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?location=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left Content */}
        <div className="flex-1 text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            More Than Events.
            <br />
            <span className="text-primary">Experience Life.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl leading-relaxed">
            Discover adventures, book unique venues, taste local flavors, and
            find the perfect camping spots across the Philippines. Your next
            memory starts here.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-[2rem] p-3 shadow-2xl shadow-gray-200 border border-gray-100 w-full max-w-2xl relative z-10">
            {/* Tabs */}
            <div className="flex gap-2 pb-3 mb-1 overflow-x-auto no-scrollbar px-2 border-b border-gray-50">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 items-center"
            >
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experiences, venues, or locations..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-pink-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/25"
              >
                Search
              </button>
            </form>
          </div>

          {/* Social Proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/64?u=user${i + 100}`}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                  alt="User"
                />
              ))}
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                +5k
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Join 5,000+ happy explorers
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 w-full relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[1.3/1] shadow-2xl shadow-gray-300">
            <img
              src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800"
              className="w-full h-full object-cover"
              alt="Friends celebrating"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">
                Featured Experience
              </p>
              <h3 className="text-2xl font-extrabold">
                Island Hopping & Sunset Gala
              </h3>
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
