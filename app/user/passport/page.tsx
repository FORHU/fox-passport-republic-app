"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const Passport: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const userName = (user?.name as string) || (user?.username as string) || "Guest";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#022c22] text-white pt-28 pb-12 px-4 sm:px-6 flex items-center justify-center relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      {/* Navigation Buttons */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => router.push('/user')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/40 transition-all font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto relative perspective-1000">
        <div className="relative bg-gradient-to-br from-[#0f392b] to-[#04221a] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          
          {/* Left Spine/Profile */}
          <div className="md:w-5/12 lg:w-4/12 relative border-r border-black/20 bg-black/20 backdrop-blur-sm p-8 flex flex-col z-20">
            <div className="relative z-10 text-center mb-8">
              <div className="inline-block relative mb-4">
                <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl mx-auto rotate-[-2deg] bg-[#10b981]/20 flex items-center justify-center">
                   {/* Placeholder for user image, using initials for now if no image */}
                   <span className="text-4xl font-bold text-[#10b981]">{userInitials}</span>
                </div>
                <div className="absolute -bottom-3 -right-3 h-12 w-12 bg-[#bef264] rounded-full flex items-center justify-center text-[#022c22] border-4 border-[#0f392b] shadow-lg animate-bounce">
                  <span className="material-symbols-outlined">verified</span>
                </div>
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">{userName}</h1>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                <span className="text-white/80 text-sm font-medium">Level 12</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span className="text-[#bef264] font-bold text-sm uppercase tracking-wide">Citizen</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-5 border border-white/5 mb-6 relative overflow-hidden group">
              <div 
                className="absolute w-10 h-10 flex items-center justify-center opacity-30 transition-opacity z-0"
                style={{ animation: 'travel-perimeter 12s linear infinite' }} 
              >
                 <span className="material-symbols-outlined text-3xl text-[#bef264]">flight</span>
              </div>
              <div className="flex justify-between items-end mb-2 relative z-10">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Next Rank</span>
                <span className="text-[#bef264] font-display font-bold">Diplomat</span>
              </div>
              <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden mb-2 relative z-10">
                <div className="h-full bg-gradient-to-r from-[#10b981] to-[#bef264] w-[20%] rounded-full shadow-[0_0_10px_#10b981]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-medium relative z-10">
                <span>1,200 XP</span>
                <span>Level 20</span>
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bef264]">stars</span>
                Unlocked Perks
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="h-10 w-10 rounded-lg bg-[#10b981]/20 text-[#10b981] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white group-hover:text-[#bef264] transition-colors">Priority Access</p>
                    <p className="text-xs text-white/50">Skip the line at partner venues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="h-10 w-10 rounded-lg bg-[#bef264]/20 text-[#bef264] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">local_drink</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white group-hover:text-[#bef264] transition-colors">Welcome Drinks</p>
                    <p className="text-xs text-white/50">Free drink at verified spots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Page / Stamps */}
          <div className="md:w-7/12 lg:w-8/12 p-6 md:p-10 relative bg-[#f0fdf4] text-[#022c22] flex flex-col z-10 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            
            <div className="relative z-20 flex flex-wrap gap-2 mb-8 items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-[#022c22]">My Journey</h2>
              <div className="flex bg-black/5 p-1 rounded-full backdrop-blur-sm">
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#022c22] shadow-sm">All</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold text-[#022c22]/60 hover:text-[#022c22]">Events</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {/* Stamp 1 */}
              <div className="aspect-square relative group cursor-pointer">
                <div className="w-full h-full border-2 border-dashed border-black/10 rounded-xl flex items-center justify-center bg-white/40 transition-all group-hover:border-[#ec4899]/30 group-hover:bg-white/60">
                  <div className="w-20 h-20 rounded-full border-4 border-[#ec4899] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 bg-[#ec4899]/10 shadow-[0_0_15px_rgba(236,72,153,0.3)] rotate-[-12deg]">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-3xl text-[#ec4899]">music_note</span>
                      <div className="text-[8px] font-bold text-[#ec4899] uppercase tracking-tighter border-t border-[#ec4899] mt-1 pt-0.5">Concert</div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-[#022c22]">Neon Nights</span>
                </div>
              </div>
              {/* Stamp 2 */}
              <div className="aspect-square relative group cursor-pointer">
                <div className="w-full h-full border-2 border-dashed border-black/10 rounded-xl flex items-center justify-center bg-white/40 transition-all group-hover:border-[#0ea5e9]/30 group-hover:bg-white/60">
                  <div className="w-20 h-20 bg-[#0ea5e9]/10 rounded-lg rotate-3 border-4 border-[#0ea5e9] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-3xl text-[#0ea5e9]">apartment</span>
                      <div className="text-[8px] font-bold text-[#0ea5e9] uppercase tracking-tighter border-t border-[#0ea5e9] mt-1 pt-0.5">Summit</div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-[#022c22]">Tech Meet</span>
                </div>
              </div>
              {/* Stamp 3 */}
              <div className="aspect-square relative group cursor-pointer">
                <div className="w-full h-full border-2 border-dashed border-black/10 rounded-xl flex items-center justify-center bg-white/40 transition-all group-hover:border-[#f59e0b]/30 group-hover:bg-white/60">
                  <div className="w-20 h-20 bg-[#f59e0b]/10 rounded-full border-4 border-[#f59e0b] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 rotate-[8deg]">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-3xl text-[#f59e0b]">restaurant</span>
                      <div className="text-[8px] font-bold text-[#f59e0b] uppercase tracking-tighter border-t border-[#f59e0b] mt-1 pt-0.5">Foodie</div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-[#022c22]">Taste of MNL</span>
                </div>
              </div>
              {/* Empty Slots */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square relative flex items-center justify-center border-2 border-dashed border-black/5 rounded-xl hover:bg-black/5 transition-colors cursor-pointer group">
                  <span className="text-xs font-bold text-black/10 group-hover:text-black/20">Empty</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passport;
