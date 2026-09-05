"use client";

import { motion } from "motion/react";
import { HeroSearchForm } from "./hero/HeroSearchForm";
import { HeroSocialProof } from "./hero/HeroSocialProof";
import { HeroShowcaseGrid } from "./hero/HeroShowcaseGrid";

export default function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-36 lg:pt-40 pb-6 sm:pb-20 lg:pb-32 overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            className="lg:col-span-7 flex flex-col gap-10 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <div className="space-y-6">
              {/* Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#ccff00]/50 shadow-[0_0_25px_rgba(204,255,0,0.3),0_0_50px_rgba(204,255,0,0.1)] mx-auto lg:mx-0 backdrop-blur-sm animate-bounce duration-1000"
              >
                <span className="flex h-3 w-3 rounded-full bg-[#ccff00] shadow-[0_0_15px_#ccff00,0_0_30px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display">
                  Fresh Drops Daily
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="text-4xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight text-white leading-tight sm:leading-[0.95] group cursor-default"
              >
                Find your <br />
                <span
                  className="text-gradient relative inline-block hover:scale-105 transition-transform duration-500 cursor-cell"
                  style={{ textShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                >
                  Core Memory.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="text-xs sm:text-sm lg:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Curated experiences for the main character energy.{" "}
                <br className="block" />
                Underground gigs, secret spots, and adventures that actually
                matter.
              </motion.p>
            </div>

            {/* Search Area */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
                },
              }}
            >
              <HeroSearchForm />
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
                },
              }}
            >
              <HeroSocialProof />
            </motion.div>
          </motion.div>

          {/* Right — Image Grid Showcase */}
          <HeroShowcaseGrid />
        </div>
      </div>
    </section>
  );
}
