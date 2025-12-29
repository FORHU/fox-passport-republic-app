"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, Tag } from "lucide-react";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";

const SEARCH_TABS = ["All", "Events", "Adventures", "Music", "Food", "Camping", "Venues"];

// Featured images that rotate every 5 seconds
const FEATURED_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    label: "Events",
    title: "Live Music & Festival Nights",
    credit: "Photo by Pablo Heimplatz on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    label: "Adventures",
    title: "Mountain Hiking Expeditions",
    credit: "Photo by Toomas Tartes on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    label: "Music",
    title: "Concert & Live Performances",
    credit: "Photo by Yvette de Wit on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
    label: "Food",
    title: "Culinary Adventures & Dining",
    credit: "Photo by Jay Wennington on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
    label: "Camping",
    title: "Outdoor Camping Getaways",
    credit: "Photo by Scott Goodwill on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    label: "Venues",
    title: "Stunning Event Venues",
    credit: "Photo by Edvin Johansson on Unsplash",
  },
];

interface SearchSuggestion {
  type: "location" | "province" | "venue" | "category";
  value: string;
  label: string;
  sublabel?: string;
}

const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Rotate featured images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FEATURED_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate unique suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchSuggestion[] = [];
    const seen = new Set<string>();

    // Get unique locations
    HARDCODED_VENUES.forEach((venue) => {
      const locationKey = `location:${venue.location.toLowerCase()}`;
      if (!seen.has(locationKey) && venue.location.toLowerCase().includes(query)) {
        seen.add(locationKey);
        results.push({
          type: "location",
          value: venue.location,
          label: venue.location,
          sublabel: venue.province,
        });
      }
    });

    // Get unique provinces
    HARDCODED_VENUES.forEach((venue) => {
      const provinceKey = `province:${venue.province.toLowerCase()}`;
      if (!seen.has(provinceKey) && venue.province.toLowerCase().includes(query)) {
        seen.add(provinceKey);
        results.push({
          type: "province",
          value: venue.province,
          label: venue.province,
          sublabel: "Province",
        });
      }
    });

    // Get matching venues by title
    HARDCODED_VENUES.forEach((venue) => {
      if (venue.title.toLowerCase().includes(query) && results.length < 15) {
        const venueKey = `venue:${venue.id}`;
        if (!seen.has(venueKey)) {
          seen.add(venueKey);
          results.push({
            type: "venue",
            value: venue.id,
            label: venue.title,
            sublabel: `${venue.location}, ${venue.province}`,
          });
        }
      }
    });

    // Get unique categories
    const categories = new Set<string>();
    HARDCODED_VENUES.forEach((venue) => {
      if (venue.category.toLowerCase().includes(query)) {
        categories.add(venue.category);
      }
    });
    categories.forEach((cat) => {
      const catKey = `category:${cat.toLowerCase()}`;
      if (!seen.has(catKey)) {
        seen.add(catKey);
        results.push({
          type: "category",
          value: cat,
          label: cat,
          sublabel: "Category",
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowDropdown(false);
    setSearchQuery("");

    if (suggestion.type === "venue") {
      router.push(`/venues/${suggestion.value}`);
    } else if (suggestion.type === "location" || suggestion.type === "province") {
      router.push(`/?location=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === "category") {
      router.push(`/?category=${encodeURIComponent(suggestion.value)}`);
    }
  };

  const getIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "location":
        return <MapPin className="w-4 h-4 text-pink-500" />;
      case "province":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "venue":
        return <Building className="w-4 h-4 text-gray-500" />;
      case "category":
        return <Tag className="w-4 h-4 text-orange-500" />;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/?location=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative pt-6 pb-8 lg:pt-10 lg:pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-700 leading-[1.1] mb-4 tracking-tight">
            More Than Events.
            <br />
            <span className="text-pink-500">Experience Life.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-xl leading-relaxed">
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
                      ? "bg-pink-100 text-pink-500"
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
              <div className="flex-1 w-full relative" ref={dropdownRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search experiences, venues, or locations..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-pink-200 text-sm outline-none"
                />

                {/* Autocomplete Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.value}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          index === selectedIndex
                            ? "bg-pink-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {getIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.label}
                          </p>
                          {suggestion.sublabel && (
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.sublabel}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {suggestion.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-pink-500/25"
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

        {/* Right Image - Rotating */}
        <div className="flex-1 w-full relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[1.3/1] shadow-2xl shadow-gray-300">
            {/* All images stacked, with opacity transition */}
            {FEATURED_IMAGES.map((image, index) => (
              <img
                key={image.label}
                src={image.url}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
                alt={image.title}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">
                {FEATURED_IMAGES[currentImageIndex].label}
              </p>
              <h3 className="text-2xl font-extrabold transition-all duration-500">
                {FEATURED_IMAGES[currentImageIndex].title}
              </h3>
            </div>

            {/* Photo credit */}
            <div className="absolute bottom-3 left-8 text-white/50 text-[9px] font-medium">
              {FEATURED_IMAGES[currentImageIndex].credit}
            </div>

            {/* Image indicators */}
            <div className="absolute bottom-8 right-8 flex gap-1.5">
              {FEATURED_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
