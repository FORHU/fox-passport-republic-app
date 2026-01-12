"use client";

import React, { useState } from "react";

interface HostProfileProps {
  className?: string;
}

const HostProfile: React.FC<HostProfileProps> = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  
  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get last few days of previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Check if a day is today
  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days (grayed out)
  for (let i = startDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false, isToday: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true, isToday: isToday(i) });
  }
  
  // Next month days to fill remaining cells (up to 35 or 42 cells)
  const totalCells = calendarDays.length <= 35 ? 35 : 42;
  let nextMonthDay = 1;
  while (calendarDays.length < totalCells) {
    calendarDays.push({ day: nextMonthDay++, isCurrentMonth: false, isToday: false });
  }

  return (
    <section className={`flex flex-col h-full ${className}`}>
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden flex flex-col flex-1">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white">Mayor Profile</h3>
          <span className="text-xs font-bold bg-accent text-black px-3 py-1 rounded-full">Elite Mayor</span>
        </div>
        <div className="relative z-10 space-y-2 mb-4">
          <button className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
            <div className="h-7 w-7 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
              <span className="material-symbols-outlined text-[14px]">edit_square</span>
            </div>
            <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">Edit Profile</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
            <div className="h-7 w-7 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
              <span className="material-symbols-outlined text-[14px]">credit_card</span>
            </div>
            <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">Payout Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
            <div className="h-7 w-7 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
              <span className="material-symbols-outlined text-[14px]">help</span>
            </div>
            <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">Mayor Support</span>
          </button>
        </div>
        
        {/* Calendar integrated into profile */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex-1">
          {/* Calendar header with navigation */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold text-white flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-accent text-[18px]">event</span>
              {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMonth}
                className="h-6 w-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button 
                onClick={nextMonth}
                className="h-6 w-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2">
            <span className="text-white/40 font-medium">M</span>
            <span className="text-white/40 font-medium">T</span>
            <span className="text-white/40 font-medium">W</span>
            <span className="text-white/40 font-medium">T</span>
            <span className="text-white/40 font-medium">F</span>
            <span className="text-white/40 font-medium">S</span>
            <span className="text-white/40 font-medium">S</span>
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
            {calendarDays.map((item, idx) => (
              <span 
                key={idx}
                className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                  item.isToday 
                    ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]' 
                    : item.isCurrentMonth 
                      ? 'text-white hover:bg-white/10' 
                      : 'text-white/20'
                }`}
              >
                {item.day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HostProfile;
