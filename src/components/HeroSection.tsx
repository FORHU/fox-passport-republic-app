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

// Mobile Dropdown Component
const MobileNavDropdown = ({ 
  title, 
  id, 
  items, 
  activeDropdown, 
  setActiveDropdown 
}: { 
  title: string; 
  id: string; 
  items: any[]; 
  activeDropdown: string | null; 
  setActiveDropdown: (id: string | null) => void; 
}) => {
  const isOpen = activeDropdown === id;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setActiveDropdown(isOpen ? null : id)}
        className="flex items-center gap-1 text-white text-sm font-semibold hover:text-pink-300 transition-colors"
      >
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
            {items.map((item, idx) => {
              const Icon = item.icon; 
              return (
                <a 
                  key={idx} 
                  href={item.href} 
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-pink-600 font-medium transition-colors"
                >
                  <div className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                    <Icon className="w-3 h-3" />
                  </div>
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Desktop Dropdown Component
const NavItemWithDropdown = ({ 
  title, 
  id, 
  items, 
  activeDropdown, 
  setActiveDropdown 
}: { 
  title: string; 
  id: string; 
  items: any[]; 
  activeDropdown: string | null; 
  setActiveDropdown: (id: string | null) => void; 
}) => (
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
    <div className={`absolute top-full left-0 pt-4 w-64 transition-all duration-200 z-40 ${activeDropdown === id ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
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

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === HERO_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMobileActiveDropdown(null);
    if (mobileActiveDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileActiveDropdown]);

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

      {/* CONTENT - z-30 to stay below navbar (z-50) */}
      <div className="relative z-30 w-full px-4 md:px-10">
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
          <div className="w-full max-w-[850px] mb-1 md:mb-2 relative z-40">
            <SearchBar isHero={true} />
          </div>

          {/* MOBILE NAVIGATION DROPDOWNS */}
          <div 
            className="md:hidden w-full max-w-[850px] flex justify-center gap-6 text-sm px-2 mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <MobileNavDropdown 
              title="Venues" 
              id="venues-mobile" 
              items={NAV_MENU.venues} 
              activeDropdown={mobileActiveDropdown} 
              setActiveDropdown={setMobileActiveDropdown} 
            />
            <MobileNavDropdown 
              title="Catering" 
              id="catering-mobile" 
              items={NAV_MENU.catering} 
              activeDropdown={mobileActiveDropdown} 
              setActiveDropdown={setMobileActiveDropdown} 
            />
            <MobileNavDropdown 
              title="Photography" 
              id="photography-mobile" 
              items={NAV_MENU.photography} 
              activeDropdown={mobileActiveDropdown} 
              setActiveDropdown={setMobileActiveDropdown} 
            />
          </div>

          {/* DESKTOP NAVIGATION DROPDOWNS */}
          <div className="hidden md:flex w-full max-w-[850px] flex-wrap justify-start gap-8 text-sm px-6">
            <NavItemWithDropdown title="Venues" id="venues" items={NAV_MENU.venues} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
            <NavItemWithDropdown title="Catering" id="catering" items={NAV_MENU.catering} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
            <NavItemWithDropdown title="Photography" id="photography" items={NAV_MENU.photography} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
          </div>

        </div>
      </div>
    </section>
  );
}