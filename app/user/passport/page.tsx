"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Stamp {
  id: string;
  icon: string;
  label: string;
  color: string;
  rotation: string;
  shape: "circle" | "square";
}

const stamps: Stamp[] = [
  { id: "1", icon: "music_note", label: "Concert", color: "#ec4899", rotation: "rotate-[-12deg]", shape: "circle" },
  { id: "2", icon: "apartment", label: "Summit", color: "#0ea5e9", rotation: "rotate-3", shape: "square" },
];

const PassportPage: React.FC = () => {
  useScrollReveal();
  // const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "events">("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#022c22] via-[#04221a] to-[#022c22] text-white pt-28 pb-12 px-4 sm:px-6 flex items-center justify-center relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
        }}
      ></div>

      {/* Navigation Buttons */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/user"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/40 transition-all font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>

      <div className="w-full max-w-6xl mx-auto relative">
        <div className="relative bg-gradient-to-br from-[#0f392b] to-[#04221a] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[700px] reveal-on-scroll">
          {/* Left Spine/Profile */}
          <div className="md:w-5/12 lg:w-4/12 relative border-r border-black/20 bg-black/20 backdrop-blur-sm p-8 flex flex-col z-20">
            <div className="relative z-10 text-center mb-8">
              <div className="inline-block relative mb-4">
                <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl mx-auto rotate-[-2deg]">
                  <img
                    alt="User"
                    className="w-full h-full object-cover filter sepia-[0.3]"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 h-12 w-12 bg-[#bef264] rounded-full flex items-center justify-center text-[#022c22] border-4 border-[#0f392b] shadow-lg animate-bounce">
                  <span className="material-symbols-outlined">verified</span>
                </div>
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-1">Alex Citizen</h1>
              <p className="text-[#10b981] font-medium tracking-wide text-sm uppercase">
                Member since 2023
              </p>
            </div>

            <div className="bg-black/20 rounded-2xl p-5 border border-white/5 mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                  Next Rank
                </span>
                <span className="text-[#bef264] font-display font-bold">Trailblazer</span>
              </div>
              <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#10b981] to-[#bef264] w-[75%] rounded-full shadow-[0_0_10px_#10b981]"
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-medium">
                <span>15 stamps collected</span>
                <span>5 to go</span>
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bef264]">stars</span>
                Unlocked Perks
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">
                      confirmation_number
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Priority Access</p>
                    <p className="text-xs text-white/50">Skip the line at partner venues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center text-black shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">
                      discount
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Exclusive Discounts</p>
                    <p className="text-xs text-white/50">Get 15% off all partner events</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Page / Stamps */}
          <div className="md:w-7/12 lg:w-8/12 p-6 md:p-10 relative bg-[#f0fdf4] text-[#022c22] flex flex-col z-10 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            <div className="relative z-20 flex flex-wrap gap-2 mb-8 items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-[#022c22]">My Journey</h2>
              <div className="flex bg-black/5 p-1 rounded-full backdrop-blur-sm">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilter === "all"
                      ? "bg-white text-[#022c22] shadow-sm"
                      : "text-[#022c22]/60 hover:text-[#022c22]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("events")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilter === "events"
                      ? "bg-white text-[#022c22] shadow-sm"
                      : "text-[#022c22]/60 hover:text-[#022c22]"
                  }`}
                >
                  Events
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {/* Collected Stamps */}
              {stamps.map((stamp) => (
                <div key={stamp.id} className="aspect-square relative group">
                  <div className="w-full h-full border-2 border-dashed border-black/10 rounded-xl flex items-center justify-center bg-white/40">
                    {stamp.shape === "circle" ? (
                      <div
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.1)] ${stamp.rotation}`}
                        style={{
                          borderColor: stamp.color,
                          backgroundColor: `${stamp.color}10`,
                          boxShadow: `0 0 15px ${stamp.color}30`,
                        }}
                      >
                        <div className="text-center">
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ color: stamp.color }}
                          >
                            {stamp.icon}
                          </span>
                          <div
                            className="text-[8px] font-bold uppercase tracking-tighter border-t mt-1 pt-0.5"
                            style={{ color: stamp.color, borderColor: stamp.color }}
                          >
                            {stamp.label}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-20 h-20 rounded-lg border-4 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${stamp.rotation}`}
                        style={{
                          borderColor: stamp.color,
                          backgroundColor: `${stamp.color}10`,
                        }}
                      >
                        <div className="text-center">
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ color: stamp.color }}
                          >
                            {stamp.icon}
                          </span>
                          <div
                            className="text-[8px] font-bold uppercase tracking-tighter border-t mt-1 pt-0.5"
                            style={{ color: stamp.color, borderColor: stamp.color }}
                          >
                            {stamp.label}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty Slots */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square relative flex items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                >
                  <span className="text-xs font-bold text-black/10">Empty</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 relative z-20">
              <Link
                href="/user"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#022c22] text-white hover:bg-[#0f392b] transition-all font-bold text-sm shadow-lg"
              >
                <span className="material-symbols-outlined text-[20px]">analytics</span>
                View Full Progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportPage;
