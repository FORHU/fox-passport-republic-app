import React from 'react';

interface UserJourneyProps {
    userName?: string;
    navigateToPassport: () => void;
}

export const UserJourney: React.FC<UserJourneyProps> = ({ userName, navigateToPassport }) => {
  return (
    <div 
                className="relative overflow-hidden rounded-[2.5rem] bg-[#0f392b] border border-[#10b981]/20 p-8 shadow-glow hover:scale-[1.02] transition-transform duration-300 reveal-on-scroll cursor-pointer group" 
                onClick={navigateToPassport}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-24 bg-[#10b981] opacity-20 blur-[80px] rounded-full group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[#10b981] text-xs font-bold uppercase tracking-widest mb-1">My Journey</p>
                            <h3 className="text-2xl font-display font-bold text-white tracking-tight">{userName}</h3>
                        </div>
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#10b981] group-hover:text-[#022c22] transition-colors">
                            <span className="material-symbols-outlined text-white group-hover:text-[#022c22]">verified</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-white/70 font-medium">Next Rank</span>
                                <span className="text-[#bef264] font-display font-bold text-sm">Trailblazer</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#10b981] to-[#bef264] w-[75%] rounded-full shadow-[0_0_10px_#10b981]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-white/40 font-medium mt-1">
                                <span>15 stamps</span>
                                <span>5 to go</span>
                            </div>
                        </div>
                        
                        <div className="pt-2 flex items-center gap-2 text-xs text-[#10b981] font-bold group-hover:text-white transition-colors">
                            <span>View Passport</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </div>
                    </div>
                </div>
              </div>
  );
};
