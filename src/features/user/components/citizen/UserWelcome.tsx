import React from 'react';

interface UserWelcomeProps {
    upcomingEventsCount: number;
    recommendationsCount: number;
}

export const UserWelcome: React.FC<UserWelcomeProps> = ({ upcomingEventsCount, recommendationsCount }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end mb-10 reveal-on-scroll">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                Ready for the <span className="text-gradient-lime relative inline-block">weekend?</span>
              </h1>
              <p className="text-text-muted mt-2 text-lg">You have <span className="text-white font-bold">{upcomingEventsCount} upcoming events</span> and <span className="text-white font-bold">{recommendationsCount} recommendations</span>.</p>
            </div>
            <div className="hidden md:flex gap-4 mt-6 md:mt-0">
              {/* Quick Links */}
              <div className="flex gap-3">
                <a href="#" className="bg-surface-highlight/40 hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-all group min-w-[80px] relative">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  </div>
                  <span className="text-white font-bold text-[10px]">Messages</span>
                </a>

                <a href="#" className="bg-surface-highlight/40 hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-all group min-w-[80px]">
                  <div className="h-8 w-8 rounded-full bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                  </div>
                  <span className="text-white font-bold text-[10px]">Settings</span>
                </a>
              </div>
            </div>
          </div>
  );
};
