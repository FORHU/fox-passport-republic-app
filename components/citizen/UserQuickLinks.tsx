import React from 'react';

export const UserQuickLinks: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
                <a className="bg-surface-highlight/50 hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all group" href="#">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined">chat_bubble</span>
                  </div>
                  <span className="text-white font-bold text-sm">Messages</span>
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full absolute top-4 right-4 animate-pulse">2</span>
                </a>
                <a className="bg-surface-highlight/50 hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all group" href="#">
                  <div className="h-12 w-12 rounded-full bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined">settings</span>
                  </div>
                  <span className="text-white font-bold text-sm">Settings</span>
                </a>
              </div>
  );
};
