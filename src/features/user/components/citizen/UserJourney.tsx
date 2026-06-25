import React from 'react';

interface UserJourneyProps {
    userName?: string;
    navigateToPassport: () => void;
    className?: string;
}

export const UserJourney: React.FC<UserJourneyProps> = ({ userName, navigateToPassport, className = '' }) => {
  return (
    <section className={`reveal-on-scroll flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981]">flight_takeoff</span>
            My Journey
        </h3>
        <button 
            onClick={navigateToPassport}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
            View Passport <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div 
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0f392b] border border-[#10b981]/20 p-6 shadow-glow hover:scale-[1.02] transition-transform duration-300 cursor-pointer group flex-1 h-full" 
          onClick={navigateToPassport}
      >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-24 bg-[#10b981] opacity-20 blur-[80px] rounded-full group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      {/* Removed internal My Journey label */}
                      <h3 className="text-2xl font-display font-bold text-white tracking-tight">{userName || 'Citizen'}</h3>
                      <p className="text-white/60 text-sm">Level 12 • <span className="text-[#bef264] font-bold">Citizen</span></p>
                  </div>
                  <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#10b981] group-hover:text-[#022c22] transition-colors relative">
                      <span className="material-symbols-outlined text-white group-hover:text-[#022c22] z-10">verified</span>
                      {/* Spinning border for active status */}
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#10b981]/50 animate-spin-slow"></div>
                  </div>
              </div>
              
              {/* Tier Progression Stepper */}
              <div className="space-y-4">
                  <div className="relative pt-2 pb-12 w-full">
                      {/* Background Line */}
                      <div className="absolute top-[14px] left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
                      
                      {/* Progress Line - 60% for Level 12 */}
                      <div className="absolute top-[14px] left-0 w-[60%] h-1 bg-gradient-to-r from-[#10b981] to-[#bef264] -translate-y-1/2 rounded-full shadow-[0_0_10px_#10b981]"></div>
                      
                      {/* The Plane Indicator - Positioned at 60% */}
                      <div className="absolute top-[14px] left-[60%] z-20">
                          <div className="relative" style={{ animation: 'fly 3s ease-in-out infinite' }}>
                              {/* Plane centered on the origin (top-0 left-0 of this div is the exact point on the line) */}
                              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                                  <span className="material-symbols-outlined text-[#bef264] text-3xl drop-shadow-[0_0_10px_rgba(190,242,100,0.8)] rotate-90">flight</span>
                              </div>
                              
                              {/* Label above */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                  <span className="text-[10px] font-bold text-[#bef264] bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm border border-[#bef264]/30">You (Lvl 12)</span>
                              </div>
                          </div>
                      </div>
  
                      {/* Milestones */}
                      <div className="relative flex justify-between text-xs font-bold w-full">
                          <div className="flex flex-col items-center gap-2 relative z-10">
                              <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></div>
                              <div className="flex flex-col items-center">
                                  <span className="text-[#10b981]">Traveler</span>
                                  <span className="text-[10px] text-white/40 font-normal">Lvl 1</span>
                              </div>
                          </div>
                          <div className="flex flex-col items-center gap-2 relative z-10">
                              <div className="w-4 h-4 rounded-full bg-[#bef264] border-2 border-[#0f392b] shadow-[0_0_15px_#bef264]"></div>
                              <div className="flex flex-col items-center">
                                  <span className="text-[#bef264]">Citizen</span>
                                  <span className="text-[10px] text-[#bef264]/60 font-normal">Lvl 10</span>
                              </div>
                          </div>
                          <div className="flex flex-col items-center gap-2 relative z-10">
                              <div className="w-3 h-3 rounded-full bg-white/20"></div>
                              <div className="flex flex-col items-center">
                                  <span className="text-white/40">Diplomat</span>
                                  <span className="text-[10px] text-white/20 font-normal">Lvl 20</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                      <div className="text-xs text-white/70">
                          <span className="text-[#bef264] font-bold">1,200 XP</span> to Level 20
                      </div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                          Keep Booking
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </section>
  );
};
