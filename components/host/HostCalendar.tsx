"use client";

import React from "react";

const HostCalendar = () => {
  return (
    <div className="bg-surface rounded-[2rem] p-6 border border-white/5">
      <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-accent text-[20px]">
          event
        </span>
        November
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        <span className="text-text-muted">M</span>
        <span className="text-text-muted">T</span>
        <span className="text-text-muted">W</span>
        <span className="text-text-muted">T</span>
        <span className="text-text-muted">F</span>
        <span className="text-text-muted">S</span>
        <span className="text-text-muted">S</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
        {/* Previous month days (grayed) */}
        <span className="text-white/20 py-2">29</span>
        <span className="text-white/20 py-2">30</span>
        {/* Current month days - GREEN/ACCENT colored */}
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">1</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">2</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">3</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">4</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">5</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">6</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">7</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">8</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">9</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">10</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">11</span>
        {/* Selected date - PINK circle */}
        <span className="bg-secondary text-white font-bold py-2 rounded-full cursor-pointer shadow-[0_0_10px_rgba(219,39,119,0.5)]">12</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">13</span>
        <span className="text-accent py-2 hover:bg-white/10 rounded-lg cursor-pointer">14</span>
      </div>
    </div>
  );
};

export default HostCalendar;
