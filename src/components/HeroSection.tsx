"use client";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/herosec1.jpg", 
  "/herosec2.webp", 
  "/herosec3.jpg", 
  "/herosec4.jpg",
  "/herosec5.jpg",
  "/herosec6.jpg",
  "/herosec7.jpg",
];

// --- UPDATED COMPONENT: HANDLES WORD-BY-WORD HOVER WITH INTENSE GLOW ---
const HoverText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <span className={className}>
      {/* Split text by spaces into words */}
      {text.split(" ").map((word, index) => (
        <span
          key={index}
          // The magic happens here:
          // 1. hover:bg-gradient-to-r hover:from-[#E31C79] hover:to-[#ff5fb6] -> Brighter gradient
          // 2. hover:drop-shadow-[0_0_15px_#E31C79] -> Increased blur for a more intense glow
          className="inline-block transition-all duration-200 cursor-default hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#E31C79] hover:to-[#ff5fb6] hover:drop-shadow-[0_0_15px_#E31C79]"
        >
          {word}&nbsp; {/* Add a non-breaking space after each word */}
        </span>
      ))}
    </span>
  );
};

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === HERO_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

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
          <img
            src={imgSrc}
            alt={`Hero Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* TEXT CONTENT */}
      <div className="relative z-20 px-4 w-full max-w-[850px]">
        <div className="flex flex-col">
          
          {/* TITLE */}
          <h1 className="text-3xl md:text-7xl font-black text-white mb-4 md:mb-8 tracking-tight drop-shadow-lg leading-tight items-start text-left">
            <HoverText text="Let's Make Life" /> 
            <br className="md:hidden" />{" "}
            <HoverText text="An Event" />
          </h1>

          {/* SUBTITLE */}
          <p className="text-lg md:text-3xl text-white opacity-100 mb-4 md:mb-6 text-shadow text-align-left font-medium">
            <HoverText text="Plan your next event with FoxPassport" />
          </p>

        </div>
      </div>
    </section>
  );
}