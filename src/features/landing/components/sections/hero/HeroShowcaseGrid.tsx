/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";

export function HeroShowcaseGrid() {
  return (
    <div className="hidden sm:block lg:col-span-5 relative mt-16 lg:mt-0 perspective-1000">
      <div className="relative grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4 translate-y-12 animate-float">
          <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
            <img
              alt="Weddings & Commitments"
              className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
              Weddings
            </span>
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <span className="material-symbols-outlined text-white text-[16px]">
                arrow_outward
              </span>
            </div>
          </div>
          <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
            <img
              alt="Private Experiences"
              className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
              Private Dining
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 animate-float-delayed">
          <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
            <img
              alt="Celebrations"
              className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
              Celebrations
            </span>
          </div>
          <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 z-10 cursor-pointer">
            <img
              alt="Signature Places"
              className="w-full h-56 object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-700 scale-100 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute bottom-4 left-4 text-white font-display font-bold text-lg tracking-wide group-hover:translate-x-2 transition-transform">
              Signature Places
            </span>
          </div>
        </div>

        {/* Book Now Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <Link
            href="/search"
            className="bg-[#ccff00] text-black px-6 py-3 rounded-full font-display font-bold uppercase tracking-widest text-base shadow-[0_0_30px_#ccff00] animate-pulse hover:scale-110 transition-transform block text-center"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
