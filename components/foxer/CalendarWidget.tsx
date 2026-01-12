"use client";

import React, { useState } from 'react';

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };



  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  // Adjust so Monday is 0, Sunday is 6 if you want Mon-Sun week
  // But standard JS .getDay() is 0=Sun, 1=Mon.
  // The UI shows M T W T F S S, so we need to adjust indices if we want Monday start.
  // Let's assume standard Sun-Sat for simplicity or adjust for Monday start strictly if required.
  // The previous design had M T W T F S S.
  // Let's implement Monday start logic.
  
  const getDayIndex = (date: Date) => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // 0=Sun is now 6, 1=Mon is now 0
  };

  const totalDays = daysInMonth(currentDate);
  const startDay = getDayIndex(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="py-2"></div>);
  }
  for (let i = 1; i <= totalDays; i++) {
    const isSelected = selectedDate && 
      selectedDate.getDate() === i && 
      selectedDate.getMonth() === currentDate.getMonth() && 
      selectedDate.getFullYear() === currentDate.getFullYear();
    
    // Check if it's today (just for styling fun)
    const today = new Date();
    const isToday = today.getDate() === i && 
                    today.getMonth() === currentDate.getMonth() &&
                    today.getFullYear() === currentDate.getFullYear();

    days.push(
      <div 
        key={i} 
        onClick={() => handleDateClick(i)}
        className={`
          py-1 rounded-md cursor-pointer text-[10px] font-medium transition-all
          ${isSelected 
            ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]' 
            : 'text-white hover:bg-white/10'
          }
          ${isToday && !isSelected ? 'border border-accent/30 text-accent' : ''}
        `}
      >
        {i}
      </div>
    );
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-white flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-accent text-[18px]">event</span>
          {monthName} {year}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          </button>
          <button onClick={nextMonth} className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1 text-text-muted font-bold">
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
        <span>S</span>
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {days}
      </div>
    </div>
  );
};

export default CalendarWidget;
