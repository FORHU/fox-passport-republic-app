"use client";

import React from "react";

const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Card 1 - Space Rental Income */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
        {/* Large watermark icon - VISIBLE in top right */}
        <div className="absolute top-2 right-2">
          <span className="material-symbols-outlined text-[56px] text-accent opacity-30">payments</span>
        </div>
        <div className="relative z-10">
          <p className="text-text-muted text-sm font-medium mb-1">Space Rental Income</p>
          <h3 className="text-3xl font-display font-bold text-white mb-3">₱284,000</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#14532d] text-[#4ade80] px-2 py-1 rounded font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +18%
            </span>
            <span className="text-white/40">vs last month</span>
          </div>
        </div>
        {/* Bottom EXP bar - LIME/GREEN solid with glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5">
          <div className="h-full bg-[#ccff00] w-[70%] rounded-r-full" style={{ boxShadow: '0 0 20px #ccff00, 0 0 40px #ccff00' }}></div>
        </div>
      </div>

      {/* Card 2 - Total Guests */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
        <div className="absolute top-2 right-2">
          <span className="material-symbols-outlined text-[56px] text-primary opacity-30">groups</span>
        </div>
        <div className="relative z-10">
          <p className="text-text-muted text-sm font-medium mb-1">Total Guests</p>
          <h3 className="text-3xl font-display font-bold text-white mb-3">854</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#14532d] text-[#4ade80] px-2 py-1 rounded font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +3.2%
            </span>
            <span className="text-white/40">vs last month</span>
          </div>
        </div>
        {/* Bottom EXP bar - PURPLE solid with glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5">
          <div className="h-full bg-[#7c3aed] w-[55%] rounded-r-full" style={{ boxShadow: '0 0 20px #7c3aed, 0 0 40px #7c3aed' }}></div>
        </div>
      </div>

      {/* Card 3 - Venue Views */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
        <div className="absolute top-2 right-2">
          <span className="material-symbols-outlined text-[56px] text-secondary opacity-30">visibility</span>
        </div>
        <div className="relative z-10">
          <p className="text-text-muted text-sm font-medium mb-1">Venue Views</p>
          <h3 className="text-3xl font-display font-bold text-white mb-3">12.5k</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#831843] text-[#f472b6] px-2 py-1 rounded font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">trending_flat</span> 1.5%
            </span>
            <span className="text-white/40">vs last month</span>
          </div>
        </div>
        {/* Bottom EXP bar - PINK/MAGENTA solid with glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5">
          <div className="h-full bg-[#db2777] w-[85%] rounded-r-full" style={{ boxShadow: '0 0 20px #db2777, 0 0 40px #db2777' }}></div>
        </div>
      </div>

      {/* Card 4 - Mayor Rating */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
        <div className="absolute top-2 right-2">
          <span className="material-symbols-outlined text-[56px] text-warning opacity-30">star</span>
        </div>
        <div className="relative z-10">
          <p className="text-text-muted text-sm font-medium mb-1">Mayor Rating</p>
          <h3 className="text-3xl font-display font-bold text-white mb-3">4.8</h3>
          <div className="flex items-center gap-1 text-xs text-warning">
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span className="text-white/40 ml-1">(89 reviews)</span>
          </div>
        </div>
        {/* Bottom EXP bar - YELLOW/GOLD solid with glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5">
          <div className="h-full bg-[#eab308] w-[98%] rounded-r-full" style={{ boxShadow: '0 0 20px #eab308, 0 0 40px #eab308' }}></div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
