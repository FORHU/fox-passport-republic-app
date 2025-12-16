"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import { NAV_MENU } from "../config/navMenuData";

const HERO_IMAGES = [
  "/herosec1.jpg", 
  "/herosec2.webp", 
  "/herosec3.jpg", 
  "/herosec4.jpg",
  "/herosec5.jpg",
  "/herosec6.jpg",
  "/herosec7.jpg",
];

const HoverText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-200 cursor-default hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#E31C79] hover:to-[#ff5fb6] hover:drop-shadow-[0_0_15px_#E31C79]"
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
};

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === HERO_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Helper Component for Dropdowns
  const NavItemWithDropdown = ({ title, id, items }: { title: string, id: string, items: any[] }) => (
    <div 
      className="relative group"
      onMouseEnter={() => setActiveDropdown(id)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <button className="flex items-center gap-1 text-white font-semibold hover:text-pink-300 transition-colors">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === id ? "rotate-180" : ""}`} />
      </button>

      {/* DROPDOWN MENU */}
      <div className={`absolute top-full left-0 pt-4 w-64 transition-all duration-200 z-50 ${activeDropdown === id ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
          {items.map((item, idx) => {
            const Icon = item.icon; 
            return (
              <a key={idx} href={item.href} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-600 font-medium transition-colors">
                <div className="p-2 bg-gray-100 rounded-full text-gray-500 group-hover:text-pink-600 group-hover:bg-pink-50 transition-colors">
                   <Icon className="w-4 h-4" />
                </div>
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative w-full h-[400px] md:h-[850px] bg-black flex items-center overflow-visible transition-all duration-300">
      
      {/* BACKGROUND IMAGE CAROUSEL */}
      {HERO_IMAGES.map((imgSrc, index) => (
        <div
          key={imgSrc}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={imgSrc}
            alt={`Hero Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* CONTENT */}
      <div className="relative z-[90] w-full px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center">
          
          {/* TITLE */}
          <h1 className="text-3xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight drop-shadow-lg leading-tight text-center">
            <HoverText text="Let's Make Life" /> 
            <br className="md:hidden" />{" "}
            <HoverText text="An Event" />
          </h1>

          {/* SUBTITLE */}
          <p className="text-lg md:text-3xl text-white mb-6 md:mb-8 text-center font-medium">
            <HoverText text="Plan your next event with FoxPassport" />
          </p>

          {/* SEARCH BAR */}
          <div className="w-full max-w-[850px] mb-4 md:mb-6">
            <SearchBar isHero={true} />
          </div>

          {/* NAVIGATION DROPDOWNS */}
          <div className="hidden md:flex gap-8 text-sm">
            <NavItemWithDropdown title="Venues" id="venues" items={NAV_MENU.venues} />
            <NavItemWithDropdown title="Catering" id="catering" items={NAV_MENU.catering} />
            <NavItemWithDropdown title="Photography" id="photography" items={NAV_MENU.photography} />
          </div>

        </div>
      </div>
    </section>
  );
}