'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SCHEDULE_ITEMS } from '@/data/dashboardData';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;

  const handleViewFullCalendar = () => {
    onClose();
    router.push('/host/calendar');
  };

  const getIcon = (type: string) => (type === 'event' ? 'event' : type === 'venue' ? 'apartment' : 'inventory_2');
  const getBgColor = (type: string) =>
    type === 'event' ? 'bg-[#ccff00] text-black' : type === 'venue' ? 'bg-pink-500 text-white' : 'bg-orange-400 text-black';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0f111a] border border-white/10 w-full max-w-6xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px]" />
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-display font-bold">October 2024</h2>
            <div className="flex gap-2">
              <button className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-white/70">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-white/70">Venues</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-white/70">Assets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs text-white/70">Services</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <div key={d} className="bg-[#1a1d2d] p-3 text-center text-xs font-bold text-white/40 uppercase tracking-wider">
                {d}
              </div>
            ))}
            <div className="bg-[#0f111a]/50" />
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const evs = SCHEDULE_ITEMS.filter((x) => day >= x.startDay && day <= x.endDay);
              const isToday = day === 3;
              return (
                <div
                  key={day}
                  className="bg-[#0f111a] border-b border-r border-white/5 flex flex-col relative group hover:bg-white/5"
                >
                  <div
                    className={`mx-2 mt-2 mb-1 text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg ${
                      isToday ? 'bg-[#ccff00] text-black shadow-[0_0_10px_#ccff00]' : 'text-white/50'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    {evs.map((e) => {
                      const isStart = day === e.startDay;
                      const isEnd = day === e.endDay;
                      const isMiddle = !isStart && !isEnd;
                      
                      // Determine rounded corners based on position
                      const roundedClass = isStart && isEnd 
                        ? 'rounded-md mx-0' 
                        : isStart 
                        ? 'rounded-l-md rounded-r-none -mr-1' 
                        : isEnd 
                        ? 'rounded-r-md rounded-l-none -ml-1' 
                        : 'rounded-none -mx-1';
                      
                      return isStart ? (
                        <div
                          key={e.id}
                          className={`${getBgColor(e.type)} text-[10px] font-bold py-1 px-2 flex items-center gap-1 truncate h-[22px] ${roundedClass}`}
                        >
                          <span className="material-symbols-outlined text-[12px]">{getIcon(e.type)}</span>
                          {e.title}
                        </div>
                      ) : (
                        <div key={e.id} className={`${getBgColor(e.type)} h-[22px] ${roundedClass}`} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#0f111a]/30" />
            ))}
          </div>
          
          {/* View Full Calendar Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleViewFullCalendar}
              className="px-6 py-3 rounded-xl bg-accent text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              View Full Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
