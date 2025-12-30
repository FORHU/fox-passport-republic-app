
"use client";

import React from "react";
import HeroCarousel from "./hero/HeroCarousel";
import HeroSearchContainer from "./hero/HeroSearchContainer";
import HeroSocialProof from "./hero/HeroSocialProof";

const Hero: React.FC = () => {
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

          <HeroSearchContainer />
          <HeroSocialProof />
        </div>

        {/* Right Image - Rotating */}
        <HeroCarousel />
      </div>
    </section>
  );
};

export default Hero;
