import React from 'react';

export const UserQuickLinks: React.FC = () => {
  return (
    <div className="flex gap-2">
      <a 
        className="px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 flex items-center gap-2 transition-all group relative" 
        href="#"
      >
        <div className="h-8 w-8 rounded-full bg-blue-500/30 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all">
          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
        </div>
        <span className="text-white font-medium text-sm">Messages</span>
        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">2</span>
      </a>
      <a 
        className="px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 flex items-center gap-2 transition-all group" 
        href="#"
      >
        <div className="h-8 w-8 rounded-full bg-pink-500/30 text-pink-400 group-hover:bg-pink-500 group-hover:text-white flex items-center justify-center transition-all">
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </div>
        <span className="text-white font-medium text-sm">Settings</span>
      </a>
    </div>
  );
};
