
"use client";

import React, { useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  useScrollReveal();

  return (
    <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Gradient Blobs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left reveal-on-scroll">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mx-auto lg:mx-0 backdrop-blur-sm animate-bounce duration-1000">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00]"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display">
                  Fresh Drops Daily
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl font-display font-bold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95] group cursor-default">
                Find your <br />
                <span
                  className="text-gradient relative inline-block hover:scale-105 transition-transform duration-500 cursor-cell"
                  style={{ textShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                >
                  Core Memory.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Curated experiences for the main character energy. Underground gigs, secret spots, and adventures that actually matter.
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full max-w-2xl mx-auto lg:mx-0 relative group z-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-25 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-pulse"></div>
              <div className="relative glass-panel p-2 rounded-[2rem] group-hover:border-white/20 transition-colors">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Input
                      icon="search"
                      placeholder="Search vibes, artists, locations..."
                      className="text-lg"
                    />
                  </div>
                  <div className="h-px sm:h-auto sm:w-px bg-white/10 mx-2"></div>
                  <div className="relative w-full sm:w-48">
                    <select className="block w-full pl-4 pr-10 py-4 bg-transparent border-none text-white focus:ring-0 font-bold cursor-pointer appearance-none hover:text-accent transition-colors outline-none">
                      <option className="bg-background">Manila</option>
                      <option className="bg-background">Siargao</option>
                      <option className="bg-background">Cebu</option>
                      <option className="bg-background">La Union</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-accent">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                  <Button variant="neon" size="xl" className="shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Go
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex -space-x-4 hover:space-x-0 transition-all duration-500">
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop"
                />
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop"
                />
                <img
                  alt="User"
                  className="h-12 w-12 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-xs font-bold hover:bg-accent hover:text-black transition-colors cursor-pointer">
                  +2k
                </div>
              </div>
              <div className="text-sm font-medium text-text-muted group cursor-default">
                <div className="flex text-accent text-lg mb-1 group-hover:gap-1 transition-all">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[20px] fill-current animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
                      star
                    </span>
                  ))}
                </div>
                <span className="text-white/60">2,000+ happy explorers</span>
              </div>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="lg:col-span-5 relative reveal-on-scroll delay-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 animate-float">
                <img
                  src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&auto=format&fit=crop"
                  alt="Experience 1"
                  className="rounded-3xl shadow-2xl w-full aspect-square object-cover card-hover-effect"
                />
                <img
                  src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&auto=format&fit=crop"
                  alt="Experience 2"
                  className="rounded-3xl shadow-2xl w-full aspect-[3/4] object-cover card-hover-effect"
                />
              </div>
              <div className="space-y-4 pt-12 animate-float-delayed">
                <img
                  src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&auto=format&fit=crop"
                  alt="Experience 3"
                  className="rounded-3xl shadow-2xl w-full aspect-[3/4] object-cover card-hover-effect"
                />
                <img
                  src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&auto=format&fit=crop"
                  alt="Experience 4"
                  className="rounded-3xl shadow-2xl w-full aspect-square object-cover card-hover-effect"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
