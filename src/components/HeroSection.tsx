"use client";
import { useState, useEffect } from "react";

// --- UPDATE THESE PATHS TO MATCH YOUR PUBLIC FOLDER FILES ---
// If your file is public/banner.png, just write "/banner.png"
const HERO_IMAGES = [
  "/herosec1.jpg", 
  "/herosec2.webp", 
  "/herosec3.jpg", 
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effect to change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === HERO_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5000ms = 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[400px] md:h-[850px] bg-black z-20 flex items-center justify-center overflow-hidden transition-all duration-300">
      
      {/* BACKGROUND IMAGE CAROUSEL */}
      {HERO_IMAGES.map((imgSrc, index) => (
        <div
          key={imgSrc}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Using standard img tag is often smoother for simple background fades than next/image */}
          <img
            src={imgSrc}
            alt={`Hero Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 px-4 w-full max-w-[850px]">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-8 tracking-tight drop-shadow-lg leading-tight items-start text-left">
            Let's Make Life <br className="md:hidden" /> An Event
          </h1>
        </div>
      </div>
    </section>
  );
}